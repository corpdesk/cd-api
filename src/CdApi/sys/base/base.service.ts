
import { isInstance } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { ClassRef, ICdRequest, ICdResponse, IControllerContext, IRespInfo, ISessResp } from './IBase';
import { createConnection, EntityMetadata, getConnection, } from 'typeorm';
import { Database } from './connect';
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
    constructor() {
        this.cdResp = this.initCdResp();
    }

    async init() {
        if (!this.db) {
            const db = await new Database();
            const conn = await db.getConnection();
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

    async returnErr(req, res, i: IRespInfo) {
        const sess = this.getSess(req, res);
        await this.setAppState(false, i, sess);
        return await this.respond(req, res, []);
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
        this.cdResp.app_state = await {
            success: succ,
            info: i,
            sess: ss,
            cache: {}
        };
        console.log('BaseService::setAppState/this.cdResp:', this.cdResp);
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
                    cd_token: uuidv4(),
                    jwt: '',
                    p_sid: '',
                    ttl: 0,
                },
                cache: {}
            },
            data: null
        }
    }

    async respond(req, res, data) {
        console.log('----request:-----------------\n', JSON.stringify(req.post));
        console.log('----response:----------------\n', JSON.stringify(this.cdResp));
        res.status(200).json(this.cdResp);
    }

    // setEntity<T>(u: T, d: object): T {
    //     for (const key in d) {
    //         if (key) {
    //             u[key] = d[key];
    //         }
    //     }
    //     return u;
    // }

    getPlData(req): any {
        return req.post.dat.f_vals[0].data;
    }

    async getEntityPropertyMap(model) {
        const entityMetadata: EntityMetadata = await getConnection().getMetadata(model);
        const cols = await entityMetadata.columns;
        const colsFiltd = await cols.map(async (col) => {
            return { propertyAliasName: col.propertyAliasName, databaseNameWithoutPrefixes: col.databaseNameWithoutPrefixes };
        });
        // console.log('BaseService::colsFiltd:', colsFiltd);
        return colsFiltd;
    }

    async validateUnique(req, res, params) {
        // assign payload data to this.userModel
        params.controllerInstance.userModel = this.getPlData(req);

        // set connection
        const userRepository = getConnection().getRepository(params.model);

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
        console.log('validateUnique/strQueryItems:', await strQueryItems);

        // convert the string items into JSON objects
        const arrQueryItems = strQueryItems.map((item) => {
            return JSON.parse(item);
        })
        console.log('validateUnique/arrQueryItems:', await arrQueryItems);

        // execute the query
        const results = await userRepository.count({
            where: await arrQueryItems
        });
        console.log(`results:${JSON.stringify(results)}`);

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
        console.log('starting validateRequired(req, res)');
        const rqFieldNames = cRules.required as string[];
        const isInvalid = await rqFieldNames.filter((fieldName) => !Boolean(this.getPlData(req)[fieldName]));
        console.log('BaseService::validateRequired/isInvalid:', isInvalid);
        if (isInvalid.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    async read(entity, cmd): Promise<any> {
        const userRepository = getConnection().getRepository(entity);
        let results: any = null;
        switch (cmd.action) {
            case 'find':
                results = await userRepository.find(cmd.filter);
                break;
            case 'count':
                results = await userRepository.count(cmd.filter);
                break;
        }
        console.log(results);
        return await results;
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

