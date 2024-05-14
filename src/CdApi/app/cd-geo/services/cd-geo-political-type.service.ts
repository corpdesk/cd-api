import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest } from '../../../sys/base/IBase';
import { CdGeoPoliticalTypeModel } from '../models/cd-geo-political-type.model';
// import { CdGeoPoliticalTypeViewModel, siGet } from '../models/cd-geo-political-type-view.model';
// import { CdGeoPoliticalTypeViewModel } from '../models/cd-geo-political-type-view.model';
import { siGet } from '../../../sys/base/base.model';
import { Logging } from '../../../sys/base/winston.log';

export class CdGeoPoliticalTypeService extends CdService {
    logger: Logging;
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CdGeoPoliticalTypeModel;
    modelName: "CdGeoPoliticalTypeModel";
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cd_geo_physical_type_name'],
        noDuplicate: ['cd-geo-political-typeName']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.logger = new Logging();
        this.serviceModel = new CdGeoPoliticalTypeModel();
    }

     /**
     * {
        "ctx": "App",
        "m": "CdGeoPoliticalTypes",
        "c": "CdGeoPoliticalType",
        "a": "Create",
        "dat": {
            "f_vals": [
            {
                "data": {
                    "cd-geo-political-typeGuid":"",
                    "cd-geo-political-typeName": "Benin", 
                    "cd-geo-political-typeDescription":"2005",
                    "cdGeoLocationId":null,
                    "cd-geo-political-typeWoccu": false,
                    "cd-geo-political-typeCount": null,
                    "cd-geo-political-typeMembersCount": 881232, 
                    "cd-geo-political-typeSavesShares":56429394,
                    "cd-geo-political-typeLoans":45011150,
                    "cd-geo-political-typeReserves":null, 
                    "cd-geo-political-typeAssets": null,
                    "cd-geo-political-typeMemberPenetration":20.95,
                    "cd-geo-political-typeDateLabel": "2005-12-31 23:59:59",
                    "cd-geo-political-typeRefId":null
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
        this.logger.logInfo('cd-geo-political-type/create::validateCreate()/01')
        
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CdGeoPoliticalTypeModel,
                modelName: "CdGeoPoliticalTypeModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoPoliticalType',
                dSource: 1,
            }
            this.logger.logInfo('CdGeoPoliticalTypeService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new CdGeoPoliticalType created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            this.logger.logInfo('cd-geo-political-type/create::validateCreate()/02')
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
                serviceModel: CdGeoPoliticalTypeModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoPoliticalType',
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

    async createI(req, res, createIParams: CreateIParams): Promise<CdGeoPoliticalTypeModel | boolean> {
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
        "m": "CdGeoPoliticalTypes",
        "c": "CdGeoPoliticalType",
        "a": "CreateM",
        "dat": {
            "f_vals": [
            {
                "data": [
                {
                    "cd-geo-political-typeGuid": "",
                    "cd-geo-political-typeName": "Kenya",
                    "cd-geo-political-typeDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geo-political-typeWoccu": false,
                    "cd-geo-political-typeCount": 2993,
                    "cd-geo-political-typeMembersCount": 3265545,
                    "cd-geo-political-typeSavesShares": 1608009012,
                    "cd-geo-political-typeLoans": 1604043550,
                    "cd-geo-political-typeReserves": 102792479,
                    "cd-geo-political-typeAssets": 2146769999,
                    "cd-geo-political-typeMemberPenetration": 16.01,
                    "cd-geo-political-typeDateLabel": "2006-12-31 23:59:59",
                    "cd-geo-political-typeRefId": null
                },
                {
                    "cd-geo-political-typeGuid": "",
                    "cd-geo-political-typeName": "Malawi",
                    "cd-geo-political-typeDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geo-political-typeWoccu": false,
                    "cd-geo-political-typeCount": 70,
                    "cd-geo-political-typeMembersCount": 62736,
                    "cd-geo-political-typeSavesShares": 6175626,
                    "cd-geo-political-typeLoans": 4946246,
                    "cd-geo-political-typeReserves": 601936,
                    "cd-geo-political-typeAssets": 7407250,
                    "cd-geo-political-typeMemberPenetration": 0.9,
                    "cd-geo-political-typeDateLabel": "2006-12-31 23:59:59",
                    "cd-geo-political-typeRefId": null
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
        this.logger.logInfo('CdGeoPoliticalTypeService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        this.logger.logInfo('CdGeoPoliticalTypeService::createM()/data:', data)
        // this.b.models.push(CdGeoPoliticalTypeModel)
        // this.b.init(req, res)

        for (var CdGeoPoliticalTypeData of data) {
            this.logger.logInfo('CdGeoPoliticalTypeData', CdGeoPoliticalTypeData)
            const CdGeoPoliticalTypeQuery: CdGeoPoliticalTypeModel = CdGeoPoliticalTypeData;
            const svCdGeoPoliticalType = new CdGeoPoliticalTypeService();
            const si = {
                serviceInstance: svCdGeoPoliticalType,
                serviceModel: CdGeoPoliticalTypeModel,
                serviceModelInstance: svCdGeoPoliticalType.serviceModel,
                docName: 'CdGeoPoliticalTypeService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: CdGeoPoliticalTypeQuery
            }
            let ret = await this.createI(req, res, createIParams)
            this.logger.logInfo('CdGeoPoliticalTypeService::createM()/forLoop/ret:', {ret: ret})
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "cd-geo-political-typeName",
            //     "cd-geo-political-typeDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getCdGeoPoliticalType(req, res,q)
    }

    async CdGeoPoliticalTypeExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::CdGeoPoliticalTypeExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdGeoPoliticalTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'cdGeoPoliticalTypeEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdGeoPoliticalTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'cdGeoPoliticalTypeEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CdGeoPoliticalTypeModel,
        //     docName: 'CdGeoPoliticalTypeService::CdGeoPoliticalTypeExists',
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
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CdGeoPoliticalTypeService::read$()/r:', r)
                    this.b.i.code = 'CdGeoPoliticalTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CdGeoPoliticalTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoPoliticalTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // this.logger.logInfo('CdGeoPoliticalTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // this.logger.logInfo('CdGeoPoliticalTypeService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        this.logger.logInfo('CdGeoPoliticalTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        this.logger.logInfo('CdGeoPoliticalTypeService::update()/02')
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
        if (q.update.CdGeoPoliticalTypeEnabled === '') {
            q.update.CdGeoPoliticalTypeEnabled = null;
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
        this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdGeoPoliticalTypeModel,
        }
        this.b.i.code = 'CdGeoPoliticalTypeService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/03')
                ret = true;
            } else {
                this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the CdGeoPoliticalTypeTypeId referenced exists
        // const pl: CdGeoPoliticalTypeModel = this.b.getPlData(req);
        // if ('CdGeoPoliticalTypeTypeId' in pl) {
        //     this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/07')
        //     this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/pl:', pl)
        //     const serviceInput = {
        //         serviceModel: CdGeoPoliticalTypeTypeModel,
        //         docName: 'CdGeoPoliticalTypeService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { CdGeoPoliticalTypeTypeId: pl.CdGeoPoliticalTypeTypeId } }
        //         },
        //         dSource: 1
        //     }
        //     this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/r:', r)
        //     if (r.length > 0) {
        //         this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/08')
        //         ret = true;
        //     } else {
        //         this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/10')
        //         ret = false;
        //         this.b.i.app_msg = `CdGeoPoliticalType type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //         this.b.setAppState(false, this.b.i, svSess.sessResp);
        //     }
        // } else {
        //     this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/11')
        //     // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     // this.b.err.push(this.b.i.app_msg);
        //     //////////////////
        //     this.b.i.app_msg = `CdGeoPoliticalTypeTypeId is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        //     this.b.setAppState(false, this.b.i, svSess.sessResp);
        // }
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/12');
        if (this.b.err.length > 0) {
            this.logger.logInfo('cd-geo-political-type/CdGeoPoliticalTypeService::validateCreate()/13')
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoPoliticalTypes","c": "CdGeoPoliticalType","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-political-typeName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getCdGeoPoliticalType(req, res, q: IQuery = null): Promise<any> {
        
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('CdGeoPoliticalTypeService::read$()/e:', e)
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

    /**
     * Queey params:
     * - selected data level eg all-available, world, continent, country, continental-region, national-region
     * - list of selected items 
     * - eg: 
     * - on selection of all-available, show list of countries availaable with summary data
     * - on selection of world show continents with available data
     * - on selection of continent show list of countries availaable with summary data
     * - on selection of countrie list of national-resions availaable with summary data
     * - on selection of national-region given national-resion with summary data
     * @param q 
     */
    async getCdGeoPoliticalTypeStats(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            this.logger.logInfo('CdGeoPoliticalTypeService::read$()/e:', e)
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

    async getCdGeoPoliticalTypeSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/q:', q);
        const serviceInput = siGet(q,this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // this.logger.logInfo('CdGeoPoliticalTypeService::read$()/r:', r)
                    this.b.i.code = 'CdGeoPoliticalTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('CdGeoPoliticalTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoPoliticalTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // /**
    //  * 
    //  * curl test:
    //  * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPoliticalTypes","c": "CdGeoPoliticalType","a": "GetType","dat":{"f_vals": [{"query":{"where": {"CdGeoPoliticalTypeTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
    //  * @param req 
    //  * @param res 
    //  */
    // getCdGeoPoliticalTypeType(req, res) {
    //     const q = this.b.getQuery(req);
    //     this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/f:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoPoliticalTypeTypeModel,
    //         docName: 'CdGeoPoliticalTypeService::getCdGeoPoliticalTypeType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 // this.logger.logInfo('CdGeoPoliticalTypeService::read$()/r:', r)
    //                 this.b.i.code = 'CdGeoPoliticalTypeController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         this.logger.logInfo('CdGeoPoliticalTypeService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'BaseService:update',
    //             app_msg: ''
    //         };
    //         this.b.serviceErr(req, res, e, i.code)
    //         this.b.respond(req, res)
    //     }
    // }

    /**
     * 
     * @param req 
     * @param res 
     */
    getCdGeoPoliticalTypePaged(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalType/q:', q);
        const serviceInput = {
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::getCdGeoPoliticalType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoPoliticalTypeController::Get';
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
        this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalTypeCount()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::getCdGeoPoliticalTypeCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoPoliticalTypeService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    // getCdGeoPoliticalTypeTypeCount(req, res) {
    //     const q = this.b.getQuery(req);
    //     this.logger.logInfo('CdGeoPoliticalTypeService::getCdGeoPoliticalTypeCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoPoliticalTypeTypeModel,
    //         docName: 'CdGeoPoliticalTypeService::getCdGeoPoliticalTypeCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'CdGeoPoliticalTypeController::Get';
    //             const svSess = new SessionService();
    //             svSess.sessResp.cd_token = req.post.dat.token;
    //             svSess.sessResp.ttl = svSess.getTtl();
    //             this.b.setAppState(true, this.b.i, svSess.sessResp);
    //             this.b.cdResp.data = r;
    //             this.b.respond(req, res)
    //         })
    // }

    delete(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('CdGeoPoliticalTypeService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::delete',
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
        this.logger.logInfo('CdGeoPoliticalTypeService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoPoliticalTypeModel,
            docName: 'CdGeoPoliticalTypeService::deleteSL',
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