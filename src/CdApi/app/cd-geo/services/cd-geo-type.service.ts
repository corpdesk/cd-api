import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest } from '../../../sys/base/IBase';
import { CdGeoTypeModel } from '../models/cd-geo-type.model';
// import { CdGeoTypeViewModel, siGet } from '../models/cd-geo-type-view.model';
// import { CdGeoTypeViewModel } from '../models/cd-geo-type-view.model';
import { siGet } from '../../../sys/base/base.model';

export class CdGeoTypeService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CdGeoTypeModel;
    modelName: "CdGeoTypeModel";
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cd_geo_proximity_name'],
        noDuplicate: ['cd_geo_proximity_name']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdGeoTypeModel();
    }

     /**
     * {
        "ctx": "App",
        "m": "CdGeoTypes",
        "c": "CdGeoType",
        "a": "Create",
        "dat": {
            "f_vals": [
            {
                "data": {
                    "cd-geo-typeGuid":"",
                    "cd-geo-typeName": "Benin", 
                    "cd-geo-typeDescription":"2005",
                    "cdGeoLocationId":null,
                    "cd-geo-typeWoccu": false,
                    "cd-geo-typeCount": null,
                    "cd-geo-typeMembersCount": 881232, 
                    "cd-geo-typeSavesShares":56429394,
                    "cd-geo-typeLoans":45011150,
                    "cd-geo-typeReserves":null, 
                    "cd-geo-typeAssets": null,
                    "cd-geo-typeMemberPenetration":20.95,
                    "cd-geo-typeDateLabel": "2005-12-31 23:59:59",
                    "cd-geo-typeRefId":null
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
        console.log('cd-geo-type/create::validateCreate()/01')
        
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CdGeoTypeModel,
                modelName: "CdGeoTypeModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoType',
                dSource: 1,
            }
            console.log('CdGeoTypeService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new CdGeoType created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('cd-geo-type/create::validateCreate()/02')
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
                serviceModel: CdGeoTypeModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoType',
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

    async createI(req, res, createIParams: CreateIParams): Promise<CdGeoTypeModel | boolean> {
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
        "m": "CdGeoTypes",
        "c": "CdGeoType",
        "a": "CreateM",
        "dat": {
            "f_vals": [
            {
                "data": [
                {
                    "cd-geo-typeGuid": "",
                    "cd-geo-typeName": "Kenya",
                    "cd-geo-typeDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geo-typeWoccu": false,
                    "cd-geo-typeCount": 2993,
                    "cd-geo-typeMembersCount": 3265545,
                    "cd-geo-typeSavesShares": 1608009012,
                    "cd-geo-typeLoans": 1604043550,
                    "cd-geo-typeReserves": 102792479,
                    "cd-geo-typeAssets": 2146769999,
                    "cd-geo-typeMemberPenetration": 16.01,
                    "cd-geo-typeDateLabel": "2006-12-31 23:59:59",
                    "cd-geo-typeRefId": null
                },
                {
                    "cd-geo-typeGuid": "",
                    "cd-geo-typeName": "Malawi",
                    "cd-geo-typeDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geo-typeWoccu": false,
                    "cd-geo-typeCount": 70,
                    "cd-geo-typeMembersCount": 62736,
                    "cd-geo-typeSavesShares": 6175626,
                    "cd-geo-typeLoans": 4946246,
                    "cd-geo-typeReserves": 601936,
                    "cd-geo-typeAssets": 7407250,
                    "cd-geo-typeMemberPenetration": 0.9,
                    "cd-geo-typeDateLabel": "2006-12-31 23:59:59",
                    "cd-geo-typeRefId": null
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
        console.log('CdGeoTypeService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        console.log('CdGeoTypeService::createM()/data:', data)
        // this.b.models.push(CdGeoTypeModel)
        // this.b.init(req, res)

        for (var CdGeoTypeData of data) {
            console.log('CdGeoTypeData', CdGeoTypeData)
            const CdGeoTypeQuery: CdGeoTypeModel = CdGeoTypeData;
            const svCdGeoType = new CdGeoTypeService();
            const si = {
                serviceInstance: svCdGeoType,
                serviceModel: CdGeoTypeModel,
                serviceModelInstance: svCdGeoType.serviceModel,
                docName: 'CdGeoTypeService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: CdGeoTypeQuery
            }
            let ret = await this.createI(req, res, createIParams)
            console.log('CdGeoTypeService::createM()/forLoop/ret:', ret)
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "cd-geo-typeName",
            //     "cd-geo-typeDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getCdGeoType(req, res,q)
    }

    async CdGeoTypeExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoTypeService::CdGeoTypeExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CdGeoTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CdGeoTypeEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CdGeoTypeGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CdGeoTypeEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CdGeoTypeModel,
        //     docName: 'CdGeoTypeService::CdGeoTypeExists',
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
        console.log('CdGeoTypeService::getCdGeoType/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoTypeService::read$()/r:', r)
                    this.b.i.code = 'CdGeoTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // console.log('CdGeoTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CdGeoTypeService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        console.log('CdGeoTypeService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoTypeService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdGeoTypeService::update()/02')
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
        if (q.update.CdGeoTypeEnabled === '') {
            q.update.CdGeoTypeEnabled = null;
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
        console.log('cd-geo-type/CdGeoTypeService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdGeoTypeModel,
        }
        this.b.i.code = 'CdGeoTypeService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.log('cd-geo-type/CdGeoTypeService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('cd-geo-type/CdGeoTypeService::validateCreate()/03')
                ret = true;
            } else {
                console.log('cd-geo-type/CdGeoTypeService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('cd-geo-type/CdGeoTypeService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('cd-geo-type/CdGeoTypeService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the CdGeoTypeTypeId referenced exists
        // const pl: CdGeoTypeModel = this.b.getPlData(req);
        // if ('CdGeoTypeTypeId' in pl) {
        //     console.log('cd-geo-type/CdGeoTypeService::validateCreate()/07')
        //     console.log('cd-geo-type/CdGeoTypeService::validateCreate()/pl:', pl)
        //     const serviceInput = {
        //         serviceModel: CdGeoTypeTypeModel,
        //         docName: 'CdGeoTypeService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { CdGeoTypeTypeId: pl.CdGeoTypeTypeId } }
        //         },
        //         dSource: 1
        //     }
        //     console.log('cd-geo-type/CdGeoTypeService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     console.log('cd-geo-type/CdGeoTypeService::validateCreate()/r:', r)
        //     if (r.length > 0) {
        //         console.log('cd-geo-type/CdGeoTypeService::validateCreate()/08')
        //         ret = true;
        //     } else {
        //         console.log('cd-geo-type/CdGeoTypeService::validateCreate()/10')
        //         ret = false;
        //         this.b.i.app_msg = `CdGeoType type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //         this.b.setAppState(false, this.b.i, svSess.sessResp);
        //     }
        // } else {
        //     console.log('cd-geo-type/CdGeoTypeService::validateCreate()/11')
        //     // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     // this.b.err.push(this.b.i.app_msg);
        //     //////////////////
        //     this.b.i.app_msg = `CdGeoTypeTypeId is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        //     this.b.setAppState(false, this.b.i, svSess.sessResp);
        // }
        console.log('CdGeoTypeService::getCdGeoType/12');
        if (this.b.err.length > 0) {
            console.log('cd-geo-type/CdGeoTypeService::validateCreate()/13')
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoTypes","c": "CdGeoType","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-typeName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getCdGeoType(req, res, q: IQuery = null): Promise<any> {
        
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CdGeoTypeService::getCdGeoType/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CdGeoTypeService::read$()/e:', e)
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
    async getCdGeoTypeStats(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CdGeoTypeService::getCdGeoType/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CdGeoTypeService::read$()/e:', e)
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

    async getCdGeoTypeSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdGeoTypeService::getCdGeoType/q:', q);
        const serviceInput = siGet(q,this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoTypeService::read$()/r:', r)
                    this.b.i.code = 'CdGeoTypeService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoTypeService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoTypeService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // /**
    //  * 
    //  * curl test:
    //  * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTypes","c": "CdGeoType","a": "GetType","dat":{"f_vals": [{"query":{"where": {"CdGeoTypeTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
    //  * @param req 
    //  * @param res 
    //  */
    // getCdGeoTypeType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdGeoTypeService::getCdGeoType/f:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoTypeTypeModel,
    //         docName: 'CdGeoTypeService::getCdGeoTypeType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 // console.log('CdGeoTypeService::read$()/r:', r)
    //                 this.b.i.code = 'CdGeoTypeController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('CdGeoTypeService::read$()/e:', e)
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

    // /**
    //  * 
    //  * @param req 
    //  * @param res 
    //  */
    // getCdGeoTypeCount(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdGeoTypeService::getCdGeoTypeCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoTypeViewModel,
    //         docName: 'CdGeoTypeService::getCdGeoTypeCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'CdGeoTypeController::Get';
    //             const svSess = new SessionService();
    //             svSess.sessResp.cd_token = req.post.dat.token;
    //             svSess.sessResp.ttl = svSess.getTtl();
    //             this.b.setAppState(true, this.b.i, svSess.sessResp);
    //             this.b.cdResp.data = r;
    //             this.b.respond(req, res)
    //         })
    // }

    getPagedSL(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdGeoTypeService::getCdGeoTypeCount()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoTypeService::getCdGeoTypeCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoTypeService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    // getCdGeoTypeTypeCount(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdGeoTypeService::getCdGeoTypeCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoTypeTypeModel,
    //         docName: 'CdGeoTypeService::getCdGeoTypeCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'CdGeoTypeController::Get';
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
        console.log('CdGeoTypeService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoTypeService::delete',
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
        console.log('CdGeoTypeService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoTypeService::deleteSL',
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