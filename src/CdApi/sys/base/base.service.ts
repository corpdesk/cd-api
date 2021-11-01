
import { v4 as uuidv4 } from 'uuid';
import * as Lá from 'lodash';
import { ICdRequest, ICdResponse, IControllerContext, IDoc, IRespInfo, IServiceInput, ISessResp, ObjectItem } from './IBase';
import { EntityMetadata, getConnection, Like, } from 'typeorm';
import { Observable, of, from, defer, bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import moment from 'moment';
import { Database } from './connect';
import { DocModel } from '../moduleman/models/doc.model';
import { UserModel } from '../user/models/user.model';
import { umask } from 'process';
import { verify } from 'crypto';
import { SessionService } from '../user/services/session.service';
import { SessionModel } from '../user/models/session.model';
import { DocService } from '../moduleman/services/doc.service';
// import { UserModel } from '../user/models/user.model';

const USER_ANON = 1000;
const INVALID_REQUEST = 'invalid request';

interface A {
    member: string;
}

export class BaseService {
    cdToken: string;
    cdResp: ICdResponse; // cd response
    err: string[] = []; // error messages
    db;
    cuid = 1000;
    debug = false;
    pl;
    iSess: SessionService;
    sess: SessionModel;
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

    async valid(req, res): Promise<boolean> {
        console.log('starting BaseService::valid()')
        const pl = req.post;
        this.pl = pl;
        if (await this.noToken(req, res)) {
            console.log('BaseService::valid()/01')
            return true;
        } else {
            await this.setSess(req, res);
            if (!this.instanceOfCdResponse(pl)) {
                return false;
            }
            if (!this.validFields(req, res)) {
                return false;
            }
        }
        return true;
    }

    async noToken(req, res) {
        const pl = req.post;
        const ctx = pl.ctx;
        const m = pl.m;
        const c = pl.c;
        const a = pl.a;
        let ret: boolean = false;
        if (!ctx || !m || !c || !a) {
            this.setInvalidRequest(req, res, 'BaseService:noTocken:01');
        }
        if (m === 'User' && (a === 'Login' || a === 'Register')) {
            ret = true;
        }
        // exempt reading list of consumers. Required during registration when token is not set yet
        if (m === 'Moduleman' && c === 'Consumer' && a === 'GetAll') {
            ret = true;
        }
        // exempt anon menu calls
        if (m === 'Moduleman' && c === 'Modules' && a === 'GetAll') {
            ret = true;
        }
        // exampt mpesa call backs
        if ('MSISDN' in pl) {
            ret = true;
        }
        return ret;
    }

    /**
     * implement validation of fields
     * @param req
     * @param res
     * @returns
     */
    validFields(req, res) {
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
        if (succ === false) {
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
        console.log('BaseService::respond(res)/this.pl:', JSON.stringify(this.pl));
        console.log('BaseService::respond(res)/this.cdResp:', JSON.stringify(this.cdResp));
        res.status(200).json(this.cdResp);
    }

    getPlData(req): any {
        return req.post.dat.f_vals[0].data;
    }

    setPlData(req, item: ObjectItem): void {
        req.post.dat.f_vals[0].data[item.key] = item.value;
    }

    getQuery(req) {
        const q = req.post.dat.f_vals[0].query;
        this.pl = req.post;
        if (q) {
            return q;
        } else {
            return {};
        }
    }

    async getEntityPropertyMap(model) {
        const entityMetadata: EntityMetadata = await getConnection().getMetadata(model);
        const cols = await entityMetadata.columns;
        const colsFiltd = await cols.map(async (col) => {
            // console.log('BaseService::getEntityPropertyMap()/col:', col)
            return {
                propertyAliasName: col.propertyAliasName,
                databaseNameWithoutPrefixes: col.databaseNameWithoutPrefixes,
                type: col.type
            };
        });
        return colsFiltd;
    }

    async validateUnique(req, res, params) {
        await this.init();
        // assign payload data to this.userModel
        params.controllerInstance.userModel = this.getPlData(req);
        // set connection
        const baseRepository = getConnection().getRepository(params.model);
        // get model properties
        const propMap = await this.getEntityPropertyMap(params.model);
        const strQueryItems = await this.getQueryItems(req, propMap, params)
        // convert the string items into JSON objects
        const arrQueryItems = await strQueryItems.map(async (item) => {
            return await JSON.parse(item);
        });
        const filterItems = await arrQueryItems
        // execute the query
        const results = await baseRepository.count({
            where: await filterItems[0]
        });
        // return boolean result
        let ret = false;
        if (await results < 1) {
            ret = true;
        }
        return await ret;
    }

    async getQueryItems(req, propMap: any, params: any) {
        const strQueryItems = [];
        await propMap.forEach(async (field: any) => {
            const f = await field;
            const alias = f.propertyAliasName;
            const fieldName = f.databaseNameWithoutPrefixes;
            const isDuplicate = await this.isNoDuplicateField(fieldName, alias, params.controllerInstance.cRules);
            if (await isDuplicate) {
                const item = `{ "${alias}": "${this.getPlData(req)[alias]}" }`;
                strQueryItems.push(item);
            }
        });
        return await strQueryItems;
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
        const noDuplicateField = ndFieldNames.filter((fieldName) => alias === fieldName);
        if (noDuplicateField.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    async validateRequired(req, res, cRules) {
        const rqFieldNames = cRules.required as string[];
        const isInvalid = await rqFieldNames.filter((fieldName) => {
            if (!(fieldName in this.getPlData(req))) { // required field is missing
                return fieldName;
            }
        });
        if (isInvalid.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    async create(req, res, serviceInput: IServiceInput) {
        await this.init();
        let newDocData;
        try {
            newDocData = await this.saveDoc(req, res, serviceInput);
        } catch (e) {
            this.serviceErr(res, e, 'BaseService:create/savDoc')
        }
        let serviceRepository = null;
        try {
            serviceRepository = await getConnection().getRepository(serviceInput.serviceModel);
        } catch (e) {
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
            if ('dSource' in serviceInput) {
                if (serviceInput.dSource === 1) { // data source is provided by the req...data.
                    // req.post.dat.f_vals[0].data.doc_id = await newDocData.docId;
                    await this.setPlData(req, { key: 'docId', value: await newDocData.docId }) // set docId
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

    // async bCreate(req, res, params) {
    //     // params = {
    //     //     controllerInstance: iController,
    //     //     model: Model,
    //     //     docName: dName
    //     // }
    //     params.controllerInstance.docModel = new params.model();
    //     await params.controllerInstance.beforeCreateDocType(req, res);
    //     const serviceInput = {
    //         serviceModel: params.model,
    //         docName: params.docName,
    //         dSource: 1,
    //     }
    //     return await this.create(req, res, serviceInput);
    // }

    async saveDoc(req, res, serviceInput: IServiceInput) {
        const docRepository: any = await getConnection().getRepository(DocModel);
        const doc = await this.setDoc(req, res, serviceInput);
        return await docRepository.save(doc);
    }

    async addParam(req, param) {
        return { ...req.post.dat.f_vals[0].data, ...param }; // merge objects
    }

    // async getDocTypeId(req, res, serviceInput: IServiceInput): Promise<number> {
    //     return 22;
    // }

    async setDoc(req, res, serviceInput) {
        console.log('starting BaseService::setDoc()')
        await this.setSess(req, res);
        const dm: DocModel = new DocModel();
        const iDoc = new DocService();
        dm.docFrom = this.cuid;
        dm.docName = serviceInput.docName;
        dm.docTypeId = await iDoc.getDocTypeId(req, res);
        dm.docDate = await this.mysqlNow();
        return await dm;
    }

    async setSess(req, res) {
        this.iSess = new SessionService();
        this.sess = await this.iSess.getSession(req, res);
        this.setCuid(this.sess[0].currentUserId);
        this.cdToken = this.sess[0].cdToken;
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

    getGuid() {
        return uuidv4();
    }

    getCuid() {
        return this.cuid;
    }

    setCuid(cuid: number) {
        this.cuid = cuid;
    }

    // /**
    //   Options for filter setting: synoimous to sql query
    //  * {
    //         select: ["firstName", "lastName"],
    //         relations: ["profile", "photos", "videos"],
    //         where: {
    //             firstName: "Timber",
    //             lastName: "Saw",
    //             profile: {
    //                 userName: "tshaw",
    //             },
    //         },
    //         order: {
    //             name: "ASC",
    //             id: "DESC",
    //         },
    //         skip: 5,
    //         take: 10,
    //         cache: true,
    //     }
    //  * @param req
    //  * @param res
    //  * @param serviceInput
    //  * @returns
    //  */
    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.init();
        const repo = getConnection().getRepository(serviceInput.serviceModel);
        let r: any = null;
        switch (serviceInput.cmd.action) {
            case 'find':
                try {
                    r = await repo.find(serviceInput.cmd.query);
                    if (serviceInput.extraInfo) {
                        return {
                            result: r,
                            fieldMap: await this.feildMap(serviceInput)
                        }
                    } else {
                        return await r;
                    }
                }
                catch (err) {
                    return await this.serviceErr(res, err, 'BaseService:read');
                }
                break;
            case 'count':
                try {
                    r = await repo.count(serviceInput.cmd.query);
                }
                catch (err) {
                    return await this.serviceErr(res, err, 'BaseService:read');
                }
                break;
        }


        // this.serviceErr(res, err, 'BaseService:read');
    }

    read$(req, res, serviceInput): Observable<any> {
        return from(this.read(req, res, serviceInput));
    }

    async readCount(req, res, serviceInput): Promise<any> {
        await this.init();
        const repo = getConnection().getRepository(serviceInput.serviceModel);
        try {
            const [result, total] = await repo.findAndCount(
                this.getQuery(req)
            );
            return {
                items: result,
                count: total
            }
        }
        catch (err) {
            return await this.serviceErr(res, err, 'BaseService:readCount');
        }
    }

    readCount$(req, res, serviceInput): Observable<any> {
        return from(this.readCount(req, res, serviceInput));
    }

    async feildMap(serviceInput) {
        const meta = getConnection().getMetadata(serviceInput.serviceModel).columns;
        return await meta.map((c) => {
            return { propertyPath: c.propertyPath, givenDatabaseName: c.givenDatabaseName, dType: c.type };
        });
    }


    async update(req, res, serviceInput) {
        let ret: any = [];
        await this.init();
        const serviceRepository = await getConnection().getRepository(serviceInput.serviceModel);
        const result = await serviceRepository.update(
            serviceInput.cmd.query.where,
            await this.fieldsAdaptor(serviceInput.cmd.query.update, serviceInput)
        )

        if ('affected' in result) {
            this.cdResp.app_state.success = true;
            this.cdResp.app_state.info.app_msg = `${result.affected} record/s updated`;
            ret = result;
        } else {
            this.cdResp.app_state.success = false;
            this.cdResp.app_state.info.app_msg = `some error occorred`;
            if (this.debug) {
                ret = result;
            }
        }
        return ret;
    }

    update$(req, res, serviceInput) {
        return from(this.update(req, res, serviceInput))
    }

    /**
     * this method is used to modify values as desired for
     * acceptance to db.
     * @param fieldsData
     * @param serviceInput
     * @returns
     */
    async fieldsAdaptor(fieldsData: any, serviceInput) {
        // get model properties
        const propMap = await this.feildMap(serviceInput);
        for (const fieldName in fieldsData) {
            if (fieldName) {
                console.log('key:', fieldName);
                const fieldMapData: any = propMap.filter(f => f.propertyPath === fieldName);

                /**
                 * adapt boolean values as desired
                 * in the current case, typeorm rejects 1, "1" as boolean so
                 * we convert them as desired;
                 */
                // console.log('BaseService::fieldsAdaptor/fieldMapData[0]', fieldMapData[0])
                if (fieldMapData[0]) {
                    if (this.fieldIsBoolean(fieldMapData[0].dType)) {
                        if (this.isTrueish(fieldsData[fieldName])) {
                            fieldsData[fieldName] = true;
                        } else {
                            fieldsData[fieldName] = false;
                        }
                    }
                }
            }
        }
        console.log('fieldsData:', fieldsData)
        return fieldsData;
    }

    fieldIsBoolean(fieldType): boolean {
        return fieldType.toString() === 'function Boolean() { [native code] }';
    }

    isTrueish(val) {
        let ret = false;
        switch (val) {
            case true:
                ret = true;
                break;
            case 'true':
                ret = true;
                break;
            case 1:
                ret = true;
                break;
            case '1':
                ret = true;
                break;
        }
        return ret;
    }

    async delete(req, res, serviceInput) {
        let ret: any = [];
        await this.init();
        const serviceRepository = await getConnection().getRepository(serviceInput.serviceModel);
        const result = await serviceRepository.delete(
            serviceInput.cmd.query.where
        )

        if ('affected' in result) {
            this.cdResp.app_state.success = true;
            this.cdResp.app_state.info.app_msg = `${result.affected} record/s deleted`;
            ret = result;
        } else {
            this.cdResp.app_state.success = false;
            this.cdResp.app_state.info.app_msg = `some error occorred`;
            if (this.debug) {
                ret = result;
            }
        }
        return ret;
    }

    delete$(req, res, serviceInput) {
        return from(this.delete(req, res, serviceInput))
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

    intersect(arrA, arrB, intersectionField) {
        return Lá.intersectionBy(arrA, arrB, intersectionField);
    }

    intersectionLegacy = (arr1, arr2) => {
        const res = [];
        // for(let i = 0; i < arr1.length; i++){
        for (const i of arr1) {
            if (!arr2.includes(i)) {
                continue;
            };
            res.push(i);
        };
        return res;
    };

    intersectMany = (...arrs) => {
        let res = arrs[0].slice();
        for (let i = 1; i < arrs.length; i++) {
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

