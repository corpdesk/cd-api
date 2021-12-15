import { BaseService } from '../../base/base.service';
import { CdService } from '../../base/cd.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
import { ModuleModel } from '../models/module.model';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../base/IBase';
import { CdObjModel } from '../models/cd-obj.model';
import { ModuleViewModel } from '../models/module-view.model';
import { CdObjViewModel } from '../models/cd-obj-view.model';
import { CdObjTypeModel } from '../models/cd-obj-type.model';

export class CdObjService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CdObjModel;
    sessModel;
    moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cdObjName', 'cdObjTypeGuid', 'parentModuleGuid'],
        noDuplicate: ['cdObjName', 'parentModuleGuid']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdObjModel();
        this.moduleModel = new ModuleModel();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdObj",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "cdObjName": "/src/CdApi/sys/moduleman",
    //                         "cdObjTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdObjModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create cdObj',
                dSource: 1,
            }
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new cdObj created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            const i = {
                messages: this.b.err,
                code: 'CdObjService:create',
                app_msg: 'validation failed'
            };
            await this.b.serviceErr(req, res, i.app_msg, i.code)
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<CdObjModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async cdObjectExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdObjModel,
            docName: 'CdObjService::cdObjectExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdObjGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'cdObjEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    update(req, res) {
        // console.log('CdObjService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdObjModel,
            docName: 'CdObjService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CdObjService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q:any){
        if(q.update.cdObjEnabled === ''){
            q.update.cdObjEnabled = null;
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
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdObjModel,
        }
        this.b.i.code = 'ModuleService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                ret = true;
            } else {
                ret = false;
                this.b.i.app_msg = `the required fields ${this.cRules.required.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
            }
        } else {
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
        }
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the cd_obj referenced exists
        let pl: CdObjModel = this.b.getPlData(req);
        if ('cdObjTypeGuid' in pl) {
            const serviceInput = {
                serviceModel: CdObjTypeModel,
                docName: 'CdObjService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { cdObjTypeGuid: pl.cdObjTypeGuid } }
                },
                dSource: 1
            }
            const r: any = await this.b.read(req, res, serviceInput)
            if (r.length > 0) {
                ret = true;
            } else {
                ret = false;
                this.b.i.app_msg = `cdObj type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
            }
        } else {
            this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
        }
        ///////////////////////////////////////////////////////////////////
        // 3. confirm the parent referenced exists
        pl = this.b.getPlData(req);
        if ('parentModuleGuid' in pl) {
            const serviceInput = {
                serviceModel: ModuleViewModel,
                docName: 'CdObjService::getModuleMenu$',
                cmd: {
                    action: 'find',
                    query: { where: { moduleGuid: pl.parentModuleGuid } }
                },
                dSource: 1
            }
            const r: any = await this.b.read(req, res, serviceInput)
            if (r.length > 0) {
                ret = true;
            } else {
                ret = false;
                this.b.i.app_msg = `parent reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
            }
        } else {
            console.log('CdObjService::getCdObj/12');
            this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
        }
        console.log('CdObjService::getCdObj/13');
        if (this.b.err.length > 0) {
            ret = false;
        }
        return ret;
    }

    getCdObj(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdObjService::getCdObj/f:', q);
        const serviceInput = {
            serviceModel: CdObjViewModel,
            docName: 'CdObjService::getCdObj$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdObjService::read$()/r:', r)
                    this.b.i.code = 'CdObjController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdObjService::read$()/e:', e)
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

    getCdObjType(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdObjService::getCdObj/f:', q);
        const serviceInput = {
            serviceModel: CdObjTypeModel,
            docName: 'CdObjService::getCdObjType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdObjService::read$()/r:', r)
                    this.b.i.code = 'CdObjController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdObjService::read$()/e:', e)
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

    getCdObjCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdObjService::getCdObjCount/q:', q);
        const serviceInput = {
            serviceModel: CdObjViewModel,
            docName: 'CdObjService::getCdObjCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdObjController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getCdObjTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdObjService::getCdObjCount/q:', q);
        const serviceInput = {
            serviceModel: CdObjViewModel,
            docName: 'CdObjService::getCdObjCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdObjController::Get';
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
        console.log('CdObjService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdObjModel,
            docName: 'CdObjService::delete',
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
}