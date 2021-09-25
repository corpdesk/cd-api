
import { v4 as uuidv4 } from 'uuid';
import * as Lá from 'lodash';
import { ICdRequest, ICdResponse, IControllerContext, IDoc, IRespInfo, IServiceInput, ISessResp } from './IBase';
import { EntityMetadata, getConnection, } from 'typeorm';
import { Observable, of, from, defer, bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import moment from 'moment';
import { Database } from './connect';
import { DocModel } from '../moduleman/models/doc.model';
import { UserModel } from '../user/models/user.model';
import { umask } from 'process';
import { verify } from 'crypto';
// import { UserModel } from '../user/models/user.model';

const USER_ANON = 1000;
const INVALID_REQUEST = 'invalid request';

interface A {
    member: string;
}

export class BaseService {

    cdResp: ICdResponse; // cd response
    err: string[] = []; // error messages
    db;
    cuid = 1000;
    constructor() {
        this.cdResp = this.initCdResp();
    }
    models = [];

    async init() {
        if (!this.db) {
            const db = await new Database();
            // client expected to input the required models
            this.models.forEach(async (model) => {
                await db.setConnEntity(model);
            });
            // await db.setConnEntity(UserModel);
            // await db.setConnEntity(DocModel);
            await db.getConnection();
        }
    }

    /**
     * resolve the class that is being called
     * via module, controller(class) and action(method)
     * @param req
     * @param res
     * @param clsCtx
     * @returns
     */
    async resolveCls(req, res, clsCtx: IControllerContext) {
        const eImport = await import(clsCtx.path);
        const eCls = eImport[clsCtx.clsName];
        const cls = new eCls();
        return await cls[clsCtx.action](req, res);
    }

    async serviceErr(res, e, eCode) {
        this.err.push(e.toString());
        const i = {
            messages: await this.err,
            code: eCode,
            app_msg: ''
        };
        await this.setAppState(false, i, null);
        this.cdResp.data = [];
        return await this.respond(res);
    }

    async returnErr(req, res, i: IRespInfo) {
        const sess = this.getSess(req, res);
        await this.setAppState(false, i, sess);
        return await this.respond(res);
    }

    entryPath(pl: ICdRequest) {
        return `../../${pl.ctx.toLowerCase()}/${pl.m.toLowerCase()}/controllers/${pl.c.toLowerCase()}.controller`;
    }

    valid(req, res): boolean {
        const pl = req.post;
        if (this.noToken(req, res)) {
            return true;
        } else {
            if (!this.instanceOfCdResponse(pl)) {
                return false;
            }
            if(!this.validFields(req,res)){
                return false;
            }
        }
        return true;
        /*
         * else if token is required and the token is valid
         */
        // else if (this.sessValid(pl)) {
        //     $cuid = tSess:: getCuid();

        //     // ALTERNATIVE:
        //     // $filter = mB::makeFilter('cd_token',$request->input('dat.token'));
        //     // $sess = mSess::get([$filter]);
        //     // $cuid = $sess[0]->current_user_id;

        //     $this -> cuid = $cuid;
        //     if ($cuid) {
        //         $this -> cuid = $cuid;
        //         \Debugbar:: info('Base::cuid='.$this -> cuid);
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }
    }

    async noToken(req, res) {
        const pl = req.post;
        const ctx = pl.ctx;
        const m = pl.m;
        const c = pl.c;
        const a = pl.a;
        if (!ctx || !m || !c || !a) {
            this.setInvalidRequest(req, res, 'BaseService:noTocken:01');
        }
        if (m === 'User' && (a === 'Login' || a === 'Register')) {
            return true;
        }
        // exempt reading list of consumers. Required during registration when token is not set yet
        if (m === 'Moduleman' && c === 'Consumer' && a === 'GetAll') {
            return true;
        }
        // exempt anon menu calls
        if (m === 'Moduleman' && c === 'Modules' && a === 'GetAll') {
            return true;
        }
        // exampt mpesa call backs
        if ('MSISDN' in pl) {
            return true;
        }
        return true;
    }

    /**
     * implement validation of fields
     * @param req
     * @param res
     * @returns
     */
    validFields(req,res){
        /**
         * 1. deduce model directory from the req.post
         * 2. import model
         * 3. verify if fields exists
         */
        return true;
    }

    instanceOfCdResponse(object: any): boolean {
        return 'ctx' in object && 'm' in object && 'c' in object && 'a' in object && 'dat' in object && 'args' in object;
    }

    /**
     * for setting up response details
     * @param Success
     * @param Info
     * @param Sess
     */
    async setAppState(succ: boolean, i: IRespInfo | null, ss: ISessResp | null) {
        if(succ === false){
            this.cdResp.data = [];
        }
        this.cdResp.app_state = {
            success: succ,
            info: i,
            sess: ss,
            cache: {}
        };
    }

    setInvalidRequest(req, res, eCode: string) {
        this.err.push(INVALID_REQUEST);
        const i: IRespInfo = {
            messages: this.err,
            code: eCode,
            app_msg: ''
        }
        const sess = this.getSess(req, res);
        this.setAppState(false, i, sess);
        res.status(200).json(this.cdResp);
    }

    getSess(req, res) {
        return null; // yet to implement
    }

    sessIsValid(pl) {
        // const sess = new SessionService()
    }

    initCdResp() {
        return {
            app_state: {
                success: false,
                info: {
                    messages: [],
                    code: '',
                    app_msg: '',
                },
                sess: {
                    cd_token: this.getGuid(),
                    jwt: '',
                    ttl: 0,
                },
                cache: {}
            },
            data: null
        }
    }

    async respond(res) {
        console.log('**********starting respond(res)*********');
        console.log('BaseService::respond(res)/this.cdResp:', this.cdResp);
        res.status(200).json(this.cdResp);
    }

    getPlData(req): any {
        return req.post.dat.f_vals[0].data;
    }

    async getEntityPropertyMap(model) {
        const entityMetadata: EntityMetadata = await getConnection().getMetadata(model);
        const cols = await entityMetadata.columns;
        const colsFiltd = await cols.map(async (col) => {
            return { propertyAliasName: col.propertyAliasName, databaseNameWithoutPrefixes: col.databaseNameWithoutPrefixes };
        });
        return colsFiltd;
    }

    async validateUnique(req, res, params) {
        // assign payload data to this.userModel
        params.controllerInstance.userModel = this.getPlData(req);
        // set connection
        const baseRepository = getConnection().getRepository(params.model);
        // get model properties
        const propMap = await this.getEntityPropertyMap(params.model);
        // use model properties to set query for unique validation
        const strQueryItems = [];
        await propMap.forEach(async (field: any) => {
            const f = await field;
            const alias = f.propertyAliasName;
            const fieldName = f.databaseNameWithoutPrefixes;
            const isDuplicate = await this.isNoDuplicateField(fieldName, alias, params.controllerInstance.cRules);
            if (isDuplicate) {
                const item = `{ "${alias}": "${this.getPlData(req)[fieldName]}" }`;
                strQueryItems.push(item);
            }
        });
        // convert the string items into JSON objects
        const arrQueryItems = await strQueryItems.map((item) => {
            return JSON.parse(item);
        });
        const filterItems = await arrQueryItems
        // execute the query
        const results = await baseRepository.count({
            where: await filterItems
        });
        // return boolean result
        let ret = false;
        if (results < 1) {
            ret = true;
        }
        return ret;
    }

    /**
     * filter mapping for no-duplicate-fields
     * - the result is used in validateUnique(req, res, params)
     * to query existence of duplicate entries
     * @param name
     * @param alias
     * @param cRules
     * @returns
     */
    async isNoDuplicateField(name, alias, cRules) {
        const ndFieldNames = cRules.noDuplicate as object[];
        const noDuplicateField = ndFieldNames.filter((fieldName) => name === fieldName);
        if (noDuplicateField.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    async validateRequired(req, res, cRules) {
        const rqFieldNames = cRules.required as string[];
        const isInvalid = await rqFieldNames.filter((fieldName) => !Boolean(this.getPlData(req)[fieldName]));
        if (isInvalid.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    async create(req, res, serviceInput: IServiceInput) {
        // console.log('starting BaseService::create(req, res, guest)');
        // console.log('BaseService::create(req, res, guest)/001');
        // console.log('BaseService::create()/serviceInput:', serviceInput)
        await this.init();
        let newDocData;
        try{
            // console.log('BaseService::create(req, res, guest)/002');
            newDocData = await this.saveDoc(req, res, serviceInput);
        } catch(e){
            // console.log('BaseService::create(req, res, guest)/003');
            this.serviceErr(res,e,'BaseService:create/savDoc')
        }
        // console.log('BaseService::create(req, res, guest)/004');
        let serviceRepository = null;
        try {
            serviceRepository = await getConnection().getRepository(serviceInput.serviceModel);
        } catch (e) {
            // console.log('BaseService::create(req, res, guest)/006');
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: 'BaseService:create/getConnection',
                app_msg: ''
            };
            await this.setAppState(false, i, null);
            return this.cdResp;
        }

        try {
            let modelInstance = serviceInput.serviceModelInstance;
            if('dSource' in serviceInput){
                if(serviceInput.dSource === 1){ // data source is provided by the req...data.
                    req.post.dat.f_vals[0].data.doc_id = await newDocData.docId;
                    const serviceData = await this.getServiceData(req, serviceInput);
                    modelInstance = await this.setEntity(serviceInput, serviceData);
                    return await serviceRepository.save(await modelInstance);
                }
            }
        } catch (e) {
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: 'BaseService:create',
                app_msg: ''
            };
            await this.setAppState(false, i, null);
            return this.cdResp;
        }
    }

    async saveDoc(req, res, serviceInput: IServiceInput) {
        const docRepository: any = await getConnection().getRepository(DocModel);
        const doc = await this.setDoc(req, res, serviceInput);
        return await docRepository.save(doc);
    }

    async addParam(req, param) {
        return { ...req.post.dat.f_vals[0].data, ...param }; // merge objects
    }

    async getDocTypeId(req, res, serviceInput: IServiceInput): Promise<number> {
        return 22;
    }

    async setDoc(req, res, serviceInput) {
        const dm: DocModel = new DocModel();
        dm.docFrom = this.cuid;
        dm.docName = serviceInput.docName;
        dm.docTypeId = await this.getDocTypeId(req, res, serviceInput);
        dm.docDate = await this.mysqlNow();
        return await dm;
    }

    async getServiceData(req, serviceInput: IServiceInput) {
        if (serviceInput.data) {
            return await serviceInput.data;
        } else {
            return await this.getPlData(req);
        }
    }

    async setPropertyMapArr(serviceInput) {
        const propMap = await this.getEntityPropertyMap(serviceInput.serviceModel);
        const propMapArr = [];
        await propMap.forEach(async (field: any) => {
            const f = await field;
            const aName = f.propertyAliasName;
            const rName = f.databaseNameWithoutPrefixes;
            propMapArr.push({ alias: aName, fieldName: rName });
        });
        return propMapArr;
    }

    async setEntity(serviceInput: IServiceInput, serviceData: any): Promise<any> {
        const propMapArr = await this.setPropertyMapArr(serviceInput);
        const serviceInstance = serviceInput.serviceModelInstance;
        propMapArr.forEach(async (field: any, i) => {
            serviceInstance[field.alias] = serviceData[field.alias];
        });
        return await serviceInstance;
    }

    async mysqlNow() {
        const now = new Date();
        const date = await moment(
            now,
            'ddd MMM DD YYYY HH:mm:ss'
        );
        return await date.format('YYYY-MM-DD HH:mm:ss'); // convert to mysql date
    }

    getGuid(){
        return uuidv4();
    }

    getCuid(){
        return this.cuid;
    }

    // req, res, serviceInput: IServiceInput
    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.init();
        const userRepository = getConnection().getRepository(serviceInput.serviceModel);
        let results: any = null;
        switch (serviceInput.cmd.action) {
            case 'find':
                results = await userRepository.find(serviceInput.cmd.filter);
                break;
            case 'count':
                results = await userRepository.count(serviceInput.cmd.filter);
                break;
        }
        return await results;
    }

    read$(req, res, serviceInput): Observable<any> {
        // return defer(() => {
        //     return this.read(req, res, serviceInput)
        // });
        return from(this.read(req, res, serviceInput));
    }

    controllerCreate(req, res) {
        return 1;
    }

    controllerUpdate(req, res) {
        return 1;
    }

    controllerDelete(req, res) {
        return 1;
    }

    intersect(arrA,arrB, intersectionField){
        return Lá.intersectionBy(arrA, arrB, intersectionField);
    }

    intersectionLegacy = (arr1, arr2) => {
        const res = [];
        // for(let i = 0; i < arr1.length; i++){
        for(const i of arr1){
           if(!arr2.includes(i)){
              continue;
           };
           res.push(i);
        };
        return res;
     };

     intersectMany = (...arrs) => {
        let res = arrs[0].slice();
        for(let i = 1; i < arrs.length; i++){
           res = this.intersectionLegacy(res, arrs[i]);
        };
        return res;
     };



    /**
     *
     * The type K is constrained to be a value computed from the keyof operator on
     * type T. Remember that the keyof operator will return a string literal type that is made
     * up of the properties of an object, so K will be constrained to the property names of
     * the type T.
     *
     * @param object
     * @param key
     */
    getProperty<T, K extends keyof T>
        (object: T, key: K) {
        const propertyValue = object[key];
    }

    testGetProperty() {
        const obj1 = {
            id: 1,
            name: 'myName',
            print() { console.log(`${this.id}`) }
        }
        this.getProperty(obj1, 'id');
        this.getProperty(obj1, 'name');
        // this.getProperty(obj1, 'surname'); // fails
    }

    ///////////////////////

    createClassInstance<T>(arg1: new () => T): T {
        return new arg1();
    }

    ///////////////////////
    // Promise
    cdPromise(): Promise<void> {
        // return new Promise object
        return new Promise<void>
            ( // start constructor
                (
                    resolve: () => void, // resolve function
                    reject: () => void // reject function
                ) => {
                    // start of function definition
                    function afterTimeout() {
                        resolve();
                    }
                    setTimeout(afterTimeout, 1000);
                    // end of function definition
                }
            ); // end constructor
    }

    testDelayedPromise() {
        this.cdPromise().then(() => {
            console.log(`delayed promise returned`);
        });
    }
}

