import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser, ICdRequest } from '../../../sys/base/IBase';
import { CdGeoModel } from '../models/cd-geo.model';
// import { CdGeoViewModel, siGet } from '../models/cd-geo-view.model';
import { CdGeoTypeModel } from '../models/cd-geo-type.model';
import { CdGeoViewModel } from '../models/cd-geo-view.model';
import { siGet } from '../../../sys/base/base.model';

export class CdGeoService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CdGeoModel;
    modelName: "CdGeoModel";
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cd-geoName', 'cdGeoTypeId', 'cd-geoDateLabel'],
        noDuplicate: ['cd-geoName', 'cd-geoDateLabel']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdGeoModel();
    }

     /**
     * {
        "ctx": "App",
        "m": "CdGeos",
        "c": "CdGeo",
        "a": "Create",
        "dat": {
            "f_vals": [
            {
                "data": {
                    "cd-geoGuid":"",
                    "cd-geoName": "Benin", 
                    "cd-geoDescription":"2005",
                    "cdGeoLocationId":null,
                    "cd-geoWoccu": false,
                    "cd-geoCount": null,
                    "cd-geoMembersCount": 881232, 
                    "cd-geoSavesShares":56429394,
                    "cd-geoLoans":45011150,
                    "cd-geoReserves":null, 
                    "cd-geoAssets": null,
                    "cd-geoMemberPenetration":20.95,
                    "cd-geoDateLabel": "2005-12-31 23:59:59",
                    "cd-geoRefId":null
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
        console.log('cd-geo/create::validateCreate()/01')
        
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CdGeoModel,
                modelName: "CdGeoModel",
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeo',
                dSource: 1,
            }
            console.log('CdGeoService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new CdGeo created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('cd-geo/create::validateCreate()/02')
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
                serviceModel: CdGeoModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeo',
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

    async createI(req, res, createIParams: CreateIParams): Promise<CdGeoModel | boolean> {
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
        "m": "CdGeos",
        "c": "CdGeo",
        "a": "CreateM",
        "dat": {
            "f_vals": [
            {
                "data": [
                {
                    "cd-geoGuid": "",
                    "cd-geoName": "Kenya",
                    "cd-geoDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geoWoccu": false,
                    "cd-geoCount": 2993,
                    "cd-geoMembersCount": 3265545,
                    "cd-geoSavesShares": 1608009012,
                    "cd-geoLoans": 1604043550,
                    "cd-geoReserves": 102792479,
                    "cd-geoAssets": 2146769999,
                    "cd-geoMemberPenetration": 16.01,
                    "cd-geoDateLabel": "2006-12-31 23:59:59",
                    "cd-geoRefId": null
                },
                {
                    "cd-geoGuid": "",
                    "cd-geoName": "Malawi",
                    "cd-geoDescription": "2006",
                    "cdGeoLocationId": null,
                    "cd-geoWoccu": false,
                    "cd-geoCount": 70,
                    "cd-geoMembersCount": 62736,
                    "cd-geoSavesShares": 6175626,
                    "cd-geoLoans": 4946246,
                    "cd-geoReserves": 601936,
                    "cd-geoAssets": 7407250,
                    "cd-geoMemberPenetration": 0.9,
                    "cd-geoDateLabel": "2006-12-31 23:59:59",
                    "cd-geoRefId": null
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
        console.log('CdGeoService::createM()/01')
        let data = req.post.dat.f_vals[0].data
        console.log('CdGeoService::createM()/data:', data)
        // this.b.models.push(CdGeoModel)
        // this.b.init(req, res)

        for (var cdGeoData of data) {
            console.log('cd-geoData', cdGeoData)
            const cdGeoQuery: CdGeoModel = cdGeoData;
            const svCdGeo = new CdGeoService();
            const si = {
                serviceInstance: svCdGeo,
                serviceModel: CdGeoModel,
                serviceModelInstance: svCdGeo.serviceModel,
                docName: 'CdGeoService::CreateM',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: cdGeoQuery
            }
            let ret = await this.createI(req, res, createIParams)
            console.log('CdGeoService::createM()/forLoop/ret:', ret)
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement 
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "cd-geoName",
            //     "cd-geoDescription"
            // ],
            "where": {},
            "take": 5,
            "skip": 0
        }
        this.getCdGeo(req, res,q)
    }

    async CdGeoExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdGeoModel,
            docName: 'CdGeoService::CdGeoExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CdGeoGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CdGeoEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CdGeoGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CdGeoEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CdGeoModel,
        //     docName: 'CdGeoService::CdGeoExists',
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
        console.log('CdGeoService::getCdGeo/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoService::read$()/r:', r)
                    this.b.i.code = 'CdGeoService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // console.log('CdGeoService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdGeoModel,
            docName: 'CdGeoService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CdGeoService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        console.log('CdGeoService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdGeoModel,
            docName: 'CdGeoService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdGeoService::update()/02')
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
        if (q.update.CdGeoEnabled === '') {
            q.update.CdGeoEnabled = null;
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
        console.log('cd-geo/CdGeoService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdGeoModel,
        }
        this.b.i.code = 'CdGeoService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.log('cd-geo/CdGeoService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('cd-geo/CdGeoService::validateCreate()/03')
                ret = true;
            } else {
                console.log('cd-geo/CdGeoService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('cd-geo/CdGeoService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('cd-geo/CdGeoService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the cdGeoTypeId referenced exists
        const pl: CdGeoModel = this.b.getPlData(req);
        if ('cdGeoTypeId' in pl) {
            console.log('cd-geo/CdGeoService::validateCreate()/07')
            console.log('cd-geo/CdGeoService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CdGeoTypeModel,
                docName: 'CdGeoService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { cdGeoTypeId: pl.cdGeoTypeId } }
                },
                dSource: 1
            }
            console.log('cd-geo/CdGeoService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
            const r: any = await this.b.read(req, res, serviceInput)
            console.log('cd-geo/CdGeoService::validateCreate()/r:', r)
            if (r.length > 0) {
                console.log('cd-geo/CdGeoService::validateCreate()/08')
                ret = true;
            } else {
                console.log('cd-geo/CdGeoService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `CdGeo type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('cd-geo/CdGeoService::validateCreate()/11')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `cdGeoTypeId is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('CdGeoService::getCdGeo/12');
        if (this.b.err.length > 0) {
            console.log('cd-geo/CdGeoService::validateCreate()/13')
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeos","c": "CdGeo","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geoName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     * @param q 
     */
    async getCdGeo(req, res, q: IQuery = null): Promise<any> {
        
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CdGeoService::getCdGeo/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CdGeoService::read$()/e:', e)
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
    async getCdGeoStats(req, res, q: IQuery = null): Promise<any> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CdGeoService::getCdGeo/f:', q);
        const serviceInput = siGet(q,this)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CdGeoService::read$()/e:', e)
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

    async getCdGeoSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdGeoService::getCdGeo/q:', q);
        const serviceInput = siGet(q,this)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoService::read$()/r:', r)
                    this.b.i.code = 'CdGeoService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    /**
     * 
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "GetType","dat":{"f_vals": [{"query":{"where": {"cdGeoTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    getCdGeoType(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdGeoService::getCdGeo/f:', q);
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoService::getCdGeoType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdGeoService::read$()/r:', r)
                    this.b.i.code = 'CdGeoController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdGeoService::read$()/e:', e)
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
    getCdGeoCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdGeoService::getCdGeoCount/q:', q);
        const serviceInput = {
            serviceModel: CdGeoViewModel,
            docName: 'CdGeoService::getCdGeoCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoController::Get';
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
        console.log('CdGeoService::getCdGeoCount()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoModel,
            docName: 'CdGeoService::getCdGeoCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    getCdGeoTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdGeoService::getCdGeoCount/q:', q);
        const serviceInput = {
            serviceModel: CdGeoTypeModel,
            docName: 'CdGeoService::getCdGeoCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdGeoController::Get';
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
        console.log('CdGeoService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoModel,
            docName: 'CdGeoService::delete',
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
        console.log('CdGeoService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CdGeoModel,
            docName: 'CdGeoService::deleteSL',
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