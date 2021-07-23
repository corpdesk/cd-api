
// import { NodemailerService } from "../../";
const USER_ANON = 1000;

export class BaseController {
    public result;
    public appState = {
        success: 1,
        info: { messages: '', code: 0, app_msg: '' },
        sess: [],
        cache: { 'dat_scope': 0 },
    };
    public token;
    public pSid;
    public ttl;
    public datScope;
    public rules = {};
    public cuid = USER_ANON; // current user id...id of the current user. Default is 1000
    public appMsgs = []; // to hold list of messages
    // public t_name;
    // public f_vals;
    private filter;
    private iController; // instance of active controller
    private cRules; // validation rules based on this->iController->cRules. cRules are rules for this->controller_create()
    private uRules;
    private dRules;
    // private arr_docproc;
    // private doctyp_id;
    private subject;
    private insert;
    private updateData;
    private static transactArr;
    // private static transact_id;
    private contentTypeName;
    public eClass; // entry class
    public ctx;
    public m;
    public c;
    public a;
    public static dat;
    public affectedRows = [];
    private numUpdated;
    private numDeleted;
    // private create_i = false;
    // private update_i = false;
    // private delete_i = false;
    // private module_arr;

    async getEClass(ePath) {
        // return await import(ePath).then(async (cls: any) => {
        //     console.log('getEClass/cls:', cls);
        //     return await cls;
        // });
        return await import(ePath);
    }

    setContentType(req) {
        // let header = req.header;
        // let contentTypeStr = header['content-type'][0];
        // let contentTypeArray = explode(';', contentTypeStr);
        // this.contentTypeName = contentTypeArray[0];
    }

    valid(req, res) {
        return true;
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

    testDelayedPromise(){
        this.cdPromise().then(() => {
            console.log(`delayed promise returned`);
        });
    }

    async respond(req, res, data){
        console.log(`starting BaseController::respond()`);
        console.log(`data: ${JSON.stringify(data)}`);
        res.status(200).json({ data });
    }

    async resolveCls(req, res, clsCtx) {
        const eImport = await import(clsCtx.path);
        const eCls = eImport[clsCtx.clsName];
        const cls = new eCls();
        return await cls[clsCtx.action](req, res);
    }

    ///////////////////////
}

