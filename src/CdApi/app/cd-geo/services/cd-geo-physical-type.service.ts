import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest } from '../../../sys/base/IBase';
import { CdGeoPhysicalTypeModel } from '../models/cd-geo-physical-type.model';
// import { CdGeoPhysicalTypeViewModel, siGet } from '../models/cd-geo-physical-type-view.model';
// import { CdGeoPhysicalTypeViewModel } from '../models/cd-geo-physical-type-view.model';
import { siGet } from '../../../sys/base/base.model';

export class CdGeoPhysicalTypeService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CdGeoPhysicalTypeModel;
    modelName: "CdGeoPhysicalTypeModel";
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cd_geo_physical_type_name'],
        noDuplicate: ['cd-geo-physical-typeName']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdGeoPhysicalTypeModel();
    }

     /**
     * {
        "ctx": "App",
        "m": "CdGeoPhysicalTypes",
        "c": "CdGeoPhysicalType",
        "a": "Create",
        "dat": {
            "f_vals": [
            {
                "data": {
                    "cd-geo-physical-typeGuid":"",
                    "cd-geo-physical-typeName": "Benin", 
                    "cd-geo-physical-typeDescription":"2005",
                    "cdGeoLocationId":null,
                    "cd-geo-physical-typeWoccu": false,
                    "cd-geo-physical-typeCount": null,
                    "cd-geo-physical-typeMembersCount": 881232, 
                    "cd-geo-physical-typeSavesShares":56429394,
                    "cd-geo-physical-typeLoans":45011150,
                    "cd-geo-physical-typeReserves":null, 
                    "cd-geo-physical-typeAssets": null,
                    "cd-geo-physical-typeMemberPenetration":20.95,
                    "cd-geo-physical-typeDateLabel": "2005-12-31 23:59:59",
                    "cd-geo-physical-typeRefId":null
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
        console.log('cd-geo-physical-type/create::validateCreate()/01')
        
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CdGeoPhysicalTypeModel,
                modelName: "CdGeoPhysicalTypeModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoPhysicalType',
                dSource: 1,
            }
            console.log('CdGeoPhysicalTypeService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new CdGeoPhysicalType created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('cd-geo-physical-type/create::validateCreate()/02')
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
                serviceModel: CdGeoPhysicalTypeModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoPhysicalType',
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

    async createI(req, res, createIParams: CreateIParams): Promise<CdGeoPhysicalTypeModel | boolean> {
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
        "m": "CdGeoPhysicalTypes",
        "c": "CdGeoPhysicalType",
        "a": "CreateM",
        "dat": {
            "f_vals": [
            {
                "data": [
                {
                    "cd-geo-physical-typeGuid": "",
                    "cd-geo-physical-typeName": "Kenya",
                    "cd-geo-physical-typeDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geo-physical-typeWoccu": false,
                    "cd-geo-physical-typeCount": 2993,
                    "cd-geo-physical-typeMembersCount": 3265545,
                    "cd-geo-physical-typeSavesShares": 1608009012,
                    "cd-geo-physical-typeLoans": 1604043550,
                    "cd-geo-physical-typeReserves": 102792479,
                    "cd-geo-physical-typeAssets": 2146769999,
                    "cd-geo-physical-typeMemberPenetration": 16.01,
                    "cd-geo-physical-typeDateLabel": "2006-12-31 23:59:59",
                    "cd-geo-physical-typeRefId": null
                },
                {
                    "cd-geo-physical-typeGuid": "",
                    "cd-geo-physical-typeName": "Malawi",
                    "cd-geo-physical-typeDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geo-physical-typeWoccu": false,
                    "cd-geo-physical-typeCount": 70,
                    "cd-geo-physical-typeMembersCount": 62736,
                    "cd-geo-physical-typeSavesShares": 6175626,
                    "cd-geo-physical-typeLoans": 4946246,
                    "cd-geo-physical-typeReserves": 601936,
                    "cd-geo-physical-typeAssets": 7407250,
                    "cd-geo-physical-typeMemberPenetration": 0.9,
                    "cd-geo-physical-typeDateLabel": "2006-12-31 23:59:59",
                    "cd-geo-physical-typeRefId": null
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
        console.log('CdGeoPhysicalTypeService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        console.log('CdGeoPhysicalTypeService::createM()/data:', data)
        // this.b.models.push(CdGeoPhysicalTypeModel)
        // this.b.init(req, res)

        for (var CdGeoPhysicalTypeData of data) {
            console.log('CdGeoPhysicalTypeData', CdGeoPhysicalTypeData)
            const CdGeoPhysicalTypeQuery: CdGeoPhysicalTypeModel = CdGeoPhysicalTypeData;
            const svCdGeoPhysicalType = new CdGeoPhysicalTypeService();
            const si = {
                serviceInstance: svCdGeoPhysicalType,
                serviceModel: CdGeoPhysicalTypeModel,
                serviceModelInstance: svCdGeoPhysicalType.serviceModel,
                docName: 'CdGeoPhysicalTypeService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: CdGeoPhysicalTypeQuery
            }
            let ret = await this.createI(req, res, createIParams)
            console.log('CdGeoPhysicalTypeService::createM()/forLoop/ret:', ret)
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "cd-geo-physical-typeName",
            //     "cd-geo-physical-typeDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getCdGeoPhysicalType(req, res,q)
    }

    async CdGeoPhysicalTypeExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::CdGeoPhysicalTypeExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CdGeoPhysicalTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CdGeoPhysicalTypeEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CdGeoPhysicalTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CdGeoPhysicalTypeEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CdGeoPhysicalTypeModel,
        //     docName: 'CdGeoPhysicalTypeService::CdGeoPhysicalTypeExists',
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
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoPhysicalTypeService::read$()/r:', r)
                    this.b.i.code = 'CdGeoPhysicalTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoPhysicalTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoPhysicalTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // console.log('CdGeoPhysicalTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CdGeoPhysicalTypeService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        console.log('CdGeoPhysicalTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdGeoPhysicalTypeService::update()/02')
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
        if (q.update.CdGeoPhysicalTypeEnabled === '') {
            q.update.CdGeoPhysicalTypeEnabled = null;
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
        console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdGeoPhysicalTypeModel,
        }
        this.b.i.code = 'CdGeoPhysicalTypeService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/03')
                ret = true;
            } else {
                console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the CdGeoPhysicalTypeTypeId referenced exists
        // const pl: CdGeoPhysicalTypeModel = this.b.getPlData(req);
        // if ('CdGeoPhysicalTypeTypeId' in pl) {
        //     console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/07')
        //     console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/pl:', pl)
        //     const serviceInput = {
        //         serviceModel: CdGeoPhysicalTypeTypeModel,
        //         docName: 'CdGeoPhysicalTypeService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { CdGeoPhysicalTypeTypeId: pl.CdGeoPhysicalTypeTypeId } }
        //         },
        //         dSource: 1
        //     }
        //     console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/r:', r)
        //     if (r.length > 0) {
        //         console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/08')
        //         ret = true;
        //     } else {
        //         console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/10')
        //         ret = false;
        //         this.b.i.app_msg = `CdGeoPhysicalType type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //         this.b.setAppState(false, this.b.i, svSess.sessResp);
        //     }
        // } else {
        //     console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/11')
        //     // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     // this.b.err.push(this.b.i.app_msg);
        //     //////////////////
        //     this.b.i.app_msg = `CdGeoPhysicalTypeTypeId is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        //     this.b.setAppState(false, this.b.i, svSess.sessResp);
        // }
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/12');
        if (this.b.err.length > 0) {
            console.log('cd-geo-physical-type/CdGeoPhysicalTypeService::validateCreate()/13')
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoPhysicalTypes","c": "CdGeoPhysicalType","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-physical-typeName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getCdGeoPhysicalType(req, res, q: IQuery = null): Promise<any> {
        
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CdGeoPhysicalTypeService::read$()/e:', e)
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
    async getCdGeoPhysicalTypeStats(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CdGeoPhysicalTypeService::read$()/e:', e)
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

    async getCdGeoPhysicalTypeSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/q:', q);
        const serviceInput = siGet(q,this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoPhysicalTypeService::read$()/r:', r)
                    this.b.i.code = 'CdGeoPhysicalTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoPhysicalTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoPhysicalTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // /**
    //  * 
    //  * curl test:
    //  * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPhysicalTypes","c": "CdGeoPhysicalType","a": "GetType","dat":{"f_vals": [{"query":{"where": {"CdGeoPhysicalTypeTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
    //  * @param req 
    //  * @param res 
    //  */
    // getCdGeoPhysicalTypeType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/f:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoPhysicalTypeTypeModel,
    //         docName: 'CdGeoPhysicalTypeService::getCdGeoPhysicalTypeType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 // console.log('CdGeoPhysicalTypeService::read$()/r:', r)
    //                 this.b.i.code = 'CdGeoPhysicalTypeController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('CdGeoPhysicalTypeService::read$()/e:', e)
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
    getCdGeoPhysicalTypePaged(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalType/q:', q);
        const serviceInput = {
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::getCdGeoPhysicalType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoPhysicalTypeController::Get';
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
        console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalTypeCount()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::getCdGeoPhysicalTypeCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoPhysicalTypeService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    // getCdGeoPhysicalTypeTypeCount(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdGeoPhysicalTypeService::getCdGeoPhysicalTypeCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoPhysicalTypeTypeModel,
    //         docName: 'CdGeoPhysicalTypeService::getCdGeoPhysicalTypeCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'CdGeoPhysicalTypeController::Get';
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
        console.log('CdGeoPhysicalTypeService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::delete',
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
        console.log('CdGeoPhysicalTypeService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoPhysicalTypeModel,
            docName: 'CdGeoPhysicalTypeService::deleteSL',
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