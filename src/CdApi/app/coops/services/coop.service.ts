import { BaseService } from '../../../sys/base/base.service';
import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { CoopModel } from '../models/coop.model';
import { CoopViewModel } from '../models/coop-view.model';
import { CoopTypeModel } from '../models/coop-type.model';

export class CoopService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CoopModel;
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['CoopName', 'email', 'mobile', 'searchTags', 'CoopTypeGuid'],
        noDuplicate: ['CoopName', 'email']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CoopModel();
        // this.moduleModel = new ModuleModel();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Coop",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CoopName": "/src/CdApi/sys/moduleman",
    //                         "CoopTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
    //                         "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b"
    //                     }
    //                 }
    //             ],
    //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async create(req, res) {
        console.log('moduleman/create::validateCreate()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CoopModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Coop',
                dSource: 1,
            }
            console.log('CoopService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new Coop created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('moduleman/create::validateCreate()/02')
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
                serviceModel: CoopModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Coop',
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

    async createI(req, res, createIParams: CreateIParams): Promise<CoopModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async CoopExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CoopModel,
            docName: 'CoopService::CoopExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CoopGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CoopEnabled', value: true });
        return true;
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'CoopGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'CoopEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CoopService::getCoop/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CoopService::read$()/r:', r)
                    this.b.i.code = 'CoopService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    update(req, res) {
        // console.log('CoopService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopModel,
            docName: 'CoopService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CoopService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        console.log('CoopService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CoopModel,
            docName: 'CoopService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CoopService::update()/02')
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
        if (q.update.CoopEnabled === '') {
            q.update.CoopEnabled = null;
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
        console.log('moduleman/CoopService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CoopModel,
        }
        this.b.i.code = 'CoopService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.log('moduleman/CoopService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('moduleman/CoopService::validateCreate()/03')
                ret = true;
            } else {
                console.log('moduleman/CoopService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/CoopService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('moduleman/CoopService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the CoopTypeGuid referenced exists
        const pl: CoopModel = this.b.getPlData(req);
        if ('CoopTypeGuid' in pl) {
            console.log('moduleman/CoopService::validateCreate()/07')
            console.log('moduleman/CoopService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CoopTypeModel,
                docName: 'CoopService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { CoopTypeGuid: pl.CoopTypeGuid } }
                },
                dSource: 1
            }
            console.log('moduleman/CoopService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
            const r: any = await this.b.read(req, res, serviceInput)
            console.log('moduleman/CoopService::validateCreate()/r:', r)
            if (r.length > 0) {
                console.log('moduleman/CoopService::validateCreate()/08')
                ret = true;
            } else {
                console.log('moduleman/CoopService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `Coop type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/CoopService::validateCreate()/11')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `CoopTypeGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('CoopService::getCoop/12');
        if (this.b.err.length > 0) {
            console.log('moduleman/CoopService::validateCreate()/13')
            ret = false;
        }
        return ret;
    }

    async validateCreateSL(req, res) {
        return true;
    }

    async getCoop(req, res, q:IQuery = null): Promise<any> {
        if(q === null){
            q = this.b.getQuery(req);
        }
        console.log('CoopService::getCoop/f:', q);
        const serviceInput = siGet(q)
        try {
            const r = await this.b.read(req, res, serviceInput)
            this.b.successResponse(req, res, r)
        } catch (e) {
            console.log('CoopService::read$()/e:', e)
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

    async getCoopSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CoopService::getCoop/q:', q);
        const serviceInput = siGet(q)
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CoopService::read$()/r:', r)
                    this.b.i.code = 'CoopService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CoopService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    getCoopType(req, res) {
        const q = this.b.getQuery(req);
        console.log('CoopService::getCoop/f:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCoopType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CoopService::read$()/r:', r)
                    this.b.i.code = 'CoopController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CoopService::read$()/e:', e)
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

    getCoopCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CoopService::getCoopCount/q:', q);
        const serviceInput = {
            serviceModel: CoopViewModel,
            docName: 'CoopService::getCoopCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopController::Get';
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
        console.log('CoopService::getCoopCount()/q:', q);
        const serviceInput = {
            serviceModel: CoopModel,
            docName: 'CoopService::getCoopCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose()
                this.b.respond(req, res)
            })
    }

    getCoopTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CoopService::getCoopCount/q:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCoopCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopController::Get';
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
        console.log('CoopService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CoopModel,
            docName: 'CoopService::delete',
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
        console.log('CoopService::deleteSL()/q:', q)
        const serviceInput = {
            serviceModel: CoopModel,
            docName: 'CoopService::deleteSL',
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