import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest } from '../../../sys/base/IBase';
import { AbcdTypeModel } from '../models/abcd-type.model';
// import { AbcdViewModel, siGet } from '../models/abcd-view.model';
// import { AbcdStatViewModel } from '../models/abcd-stat-view.model';
import { siGet } from '../../../sys/base/base.model';
import { Logging } from '../../../sys/base/winston.log';
import { AbcdViewModel } from '../models/abcd-view.model';



export class AbcdTypeService extends CdService {
    logger: Logging;
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: AbcdTypeModel;
    modelName: "AbcdTypeModel";
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['abcdTypeName'],
        noDuplicate: ['abcdTypeName']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.logger = new Logging();
        this.serviceModel = new AbcdTypeModel();
    }

     /**
     * {
        "ctx": "App",
        "m": "Abcds",
        "c": "Abcd",
        "a": "Create",
        "dat": {
            "f_vals": [
            {
                "data": {
                    "abcdStatGuid":"",
                    "abcdStatName": "Benin", 
                    "abcdStatDescription":"2005",
                    "cdGeoLocationId":null,
                    "abcdWoccu": false,
                    "abcdCount": null,
                    "abcdMembersCount": 881232, 
                    "abcdSavesShares":56429394,
                    "abcdLoans":45011150,
                    "abcdReserves":null, 
                    "abcdAssets": null,
                    "abcdMemberPenetration":20.95,
                    "abcdStatDateLabel": "2005-12-31 23:59:59",
                    "abcdStatRefId":null
	            }
            }
            ],
            "token": "3ffd785f-e885-4d37-addf-0e24379af338"
        },
        "args": {}
        }
     * @param req
     * @param res
     */
    async create(req, res) {
        this.logger.logInfo('AbcdTypecreate::validateCreate()/01')
        
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: AbcdTypeModel,
                modelName: "AbcdTypeModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create Abcd',
                dSource: 1,
            }
            this.logger.logInfo('AbcdTypeService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new Abcd created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            this.logger.logInfo('AbcdTypecreate::validateCreate()/02')
            const r = await this.b.respond(req, res);
        }
    }

    async createSL(req, res) {
        const svSess = new SessionService();
        await this.b.initSqlite(req, res)
        if (await this.validateCreateSL(req, res)) {
            await this.beforeCreateSL(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: AbcdTypeModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Abcd',
                dSource: 1,
            }
            const result = await this.b.createSL(req, res, serviceInput)
            this.b.connSLClose()
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = result;
            const r = await this.b.respond(req, res);
        } else {
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<AbcdTypeModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    /**
     * CreateM, Create multiple records
     *  - 1. validate the loop field for multiple data
     *  - 2. loop through the list
     *  - 3. in each cycle:
     *      - get createItem
     *      - createI(createItem)
     *      - save return value
     *  - 4. set return data
     *  - 5. return data
     * 
     * {
        "ctx": "App",
        "m": "Abcds",
        "c": "Abcd",
        "a": "CreateM",
        "dat": {
            "f_vals": [
            {
                "data": [
                {
                    "abcdStatGuid": "",
                    "abcdStatName": "Kenya",
                    "abcdStatDescription": "2006",
                    "cdGeoLocationId": null,
                    "abcdWoccu": false,
                    "abcdCount": 2993,
                    "abcdMembersCount": 3265545,
                    "abcdSavesShares": 1608009012,
                    "abcdLoans": 1604043550,
                    "abcdReserves": 102792479,
                    "abcdAssets": 2146769999,
                    "abcdMemberPenetration": 16.01,
                    "abcdStatDateLabel": "2006-12-31 23:59:59",
                    "abcdStatRefId": null
                },
                {
                    "abcdStatGuid": "",
                    "abcdStatName": "Malawi",
                    "abcdStatDescription": "2006",
                    "cdGeoLocationId": null,
                    "abcdWoccu": false,
                    "abcdCount": 70,
                    "abcdMembersCount": 62736,
                    "abcdSavesShares": 6175626,
                    "abcdLoans": 4946246,
                    "abcdReserves": 601936,
                    "abcdAssets": 7407250,
                    "abcdMemberPenetration": 0.9,
                    "abcdStatDateLabel": "2006-12-31 23:59:59",
                    "abcdStatRefId": null
                }
                ]
            }
            ],
            "token": "3ffd785f-e885-4d37-addf-0e24379af338"
        },
        "args": {}
        }
     * 
     * 
     * @param req 
     * @param res 
     */
    async createM(req, res) {
        this.logger.logInfo('AbcdTypeService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        this.logger.logInfo('AbcdTypeService::createM()/data:', data)
        // this.b.models.push(AbcdTypeModel)
        // this.b.init(req, res)

        for (var abcdData of data) {
            this.logger.logInfo('abcdData', abcdData)
            const abcdQuery: AbcdTypeModel = abcdData;
            const svAbcd = new AbcdTypeService();
            const si = {
                serviceInstance: svAbcd,
                serviceModel: AbcdTypeModel,
                serviceModelInstance: svAbcd.serviceModel,
                docName: 'AbcdTypeService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: abcdQuery
            }
            let ret = await this.createI(req, res, createIParams)
            this.logger.logInfo('AbcdTypeService::createM()/forLoop/ret:', {ret: ret})
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "abcdStatName",
            //     "abcdStatDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getAbcd(req, res,q)
    }

    async AbcdExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::AbcdExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'abcdTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'abcdTypeEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'abcdStatGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'abcdStatEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: AbcdTypeModel,
        //     docName: 'AbcdTypeService::AbcdExists',
        //     cmd: {
        //         action: 'find',
        //         query: { where: params.filter }
        //     },
        //     dSource: 1,
        // }
        return this.b.read(req, res, serviceInput)
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::getAbcdTypeq:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('AbcdTypeService::read$()/r:', r)
                    this.b.i.code = 'AbcdTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('AbcdTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // this.logger.logInfo('AbcdTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // this.logger.logInfo('AbcdTypeService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        this.logger.logInfo('AbcdTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        this.logger.logInfo('AbcdTypeService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.AbcdEnabled === '') {
            q.update.AbcdEnabled = null;
        }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.billEnabled === '') {
            q.update.billEnabled = null;
        }
        return q;
    }

    async remove(req, res) {
        //
    }

    /**
     * methods for transaction rollback
     */
    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbDelete(): number {
        return 1;
    }

    async validateCreate(req, res) {
        this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: AbcdTypeModel,
        }
        this.b.i.code = 'AbcdTypeService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/03')
                ret = true;
            } else {
                this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the abcdTypeId referenced exists
        // const pl: AbcdTypeModel = this.b.getPlData(req);
        // if ('abcdTypeId' in pl) {
        //     this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/07')
        //     this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/pl:', pl)
        //     const serviceInput = {
        //         serviceModel: AbcdTypeModel,
        //         docName: 'AbcdTypeService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { abcdTypeId: pl.abcdTypeId } }
        //         },
        //         dSource: 1
        //     }
        //     this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/r:', r)
        //     if (r.length > 0) {
        //         this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/08')
        //         ret = true;
        //     } else {
        //         this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/10')
        //         ret = false;
        //         this.b.i.app_msg = `Abcd type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //         this.b.setAppState(false, this.b.i, svSess.sessResp);
        //     }
        // } else {
        //     this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/11')
        //     // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     // this.b.err.push(this.b.i.app_msg);
        //     //////////////////
        //     this.b.i.app_msg = `abcdTypeId is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        //     this.b.setAppState(false, this.b.i, svSess.sessResp);
        // }
        this.logger.logInfo('AbcdTypeService::getAbcdType12');
        if (this.b.err.length > 0) {
            this.logger.logInfo('AbcdTypeAbcdTypeService::validateCreate()/13')
            ret = false;
        }
        return ret;
    }

    async validateCreateSL(req, res) {
        return true;
    }

    /**
     * 
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Abcds","c": "Abcd","a": "Get","dat": {"f_vals": [{"query": {"where": {"abcdStatName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getAbcd(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('AbcdTypeService::getAbcdTypef:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('AbcdTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getAbcdSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::getAbcdTypeq:', q);
        const serviceInput = siGet(q,this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('AbcdTypeService::read$()/r:', r)
                    this.b.i.code = 'AbcdTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('AbcdTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    /**
     * 
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "GetType","dat":{"f_vals": [{"query":{"where": {"abcdTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    getAbcdType(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::getAbcdTypef:', q);
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::getAbcdType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('AbcdTypeService::read$()/r:', r)
                    this.b.i.code = 'AbcdController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('AbcdTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    /**
     * 
     * @param req 
     * @param res 
     */
    getAbcdCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::getAbcdCount/q:', q);
        const serviceInput = {
            serviceModel: AbcdViewModel,
            docName: 'AbcdTypeService::getAbcdCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'AbcdController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getPagedSL(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::getAbcdCount()/q:', q);
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::getAbcdCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'AbcdTypeService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    getAbcdTypeCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::getAbcdCount/q:', q);
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::getAbcdCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'AbcdController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    delete(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::delete()/q:', q)
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    deleteSL(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('AbcdTypeService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: AbcdTypeModel,
            docName: 'AbcdTypeService::deleteSL',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.deleteSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }
}