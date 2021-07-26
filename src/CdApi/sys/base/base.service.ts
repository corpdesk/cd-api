
import { isInstance } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { ICdRequest, ICdResponse, IControllerContext, IRespInfo, ISessResp } from './IBase';

const USER_ANON = 1000;
const INVALID_REQUEST = 'invalid request';

interface A {
    member: string;
}

export class BaseService {

    cdResp: ICdResponse;

    constructor() {
        this.cdResp = this.initCdResp();
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
        console.log(`resolveCls:clsCtx: ${JSON.stringify(clsCtx)}`);
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
        console.log(`b::valid:001`);
        if (this.noToken(req, res)) {
            console.log(`b::valid:002`);
            return true;
        } else {
            if (!this.instanceOfCdResponse(pl)) {
                console.log(`b::valid:003`);
                return false;
            }
        }

        console.log(`b::valid:004`);
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
        console.log(`m:${m},c:${c},a:${a},`);
        console.log(`b::NoToken:001`);
        if (!ctx || !m || !c || !a) {
            this.setInvalidRequest(req, res, 'BaseService:noTocken:01');
        }
        if (m === 'User' && (a === 'Login' || a === 'Register')) {
            console.log(`b::NoToken:002`);
            return true;
        }
        console.log(`b::NoToken:003`);
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
        // ctx: string;
        // m: string;
        // c: string;
        // a: string;
        // dat: any;
        // args: object;
        return 'ctx' in object && 'm' in object && 'c' in object && 'a' in object && 'dat' in object && 'args' in object;
    }

    /**
     * for setting up response details
     * @param Success
     * @param Info
     * @param Sess
     */
    setAppState(succ: boolean, i: IRespInfo | null, ss: ISessResp | null) {
        this.cdResp.app_state = {
            success: succ,
            info: i,
            sess: ss,
            cache: {}
        };
    }

    setInvalidRequest(req, res, eCode: string) {
        const i: IRespInfo = {
            messages: INVALID_REQUEST,
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
                    messages: '',
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
        console.log(`starting BaseService::respond()`);
        console.log(`data: ${JSON.stringify(data)}`);
        res.status(200).json(this.cdResp);
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
        console.log(`object[${key}] = ${propertyValue}`);
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

