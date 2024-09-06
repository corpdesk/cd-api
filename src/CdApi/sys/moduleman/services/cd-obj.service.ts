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
import { UserModel } from '../../user/models/user.model';

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
        console.log('CdObjService::create()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            console.log('CdObjService::create()/02')
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdObjModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create cdObj',
                dSource: 1,
            }
            console.log('CdObjService::create()/req.post:', req.post);
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new cdObj created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('CdObjService::create()/03');
            this.b.setAppState(false, this.b.i, svSess.sessResp);
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
    beforeUpdate(q: any) {
        if (q.update.cdObjEnabled === '') {
            q.update.cdObjEnabled = null;
        }
        if (q.update.showIcon === '') {
            q.update.showIcon = null;
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
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdObjModel,
        }
        this.b.i.code = 'CdObjService::validateCreate';
        let ret = false;

        ///////////////////////////////////////////////////////////////////
        // 2. confirm the cd_obj referenced exists
        let pl: CdObjModel = this.b.getPlData(req);

        // if ('cdObjTypeGuid' in pl) {
        //     const serviceInput = {
        //         serviceModel: CdObjTypeModel,
        //         docName: 'CdObjService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { cdObjTypeGuid: pl.cdObjTypeGuid } }
        //         },
        //         dSource: 1
        //     }
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     if (r.length > 0) {
        //         ret = true;
        //     } else {
        //         ret = false;
        //         this.b.i.app_msg = `cdObj type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //     }
        // } else {
        //     this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        // }
        if ('cdObjTypeGuid' in pl) {
            console.log('CdObjService::validateCreate()/01')
            console.log('CdObjService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CdObjTypeModel,
                docName: 'CdObjService::getcdObjType',
                cmd: {
                    action: 'find',
                    query: { where: { cdObjTypeGuid: pl.cdObjTypeGuid } }
                },
                dSource: 1
            }
            const cdObjTypeData: CdObjTypeModel[] = await this.b.read(req, res, serviceInput)
            console.log('CdObjService::validateCreate()/cdObjTypeData:', cdObjTypeData)
            if (await this.b.validateInputRefernce(`cdObj type reference is invalid`, cdObjTypeData, svSess)) {
                console.log('CdObjService::validateCreate()/02')
                console.log('CdObjService::validateCreate()/cdObjTypeData:', cdObjTypeData);
                if (cdObjTypeData[0].cdObjTypeName === 'user') {
                    console.log('CdObjService::validateCreate()/03')
                    if ('objGuid' in pl) {
                        console.log('CdObjService::validateCreate()/04')
                        ret = true;
                        await this.b.setPlData(req, { key: 'cdObjName', value: pl.objGuid });
                        const userData: UserModel[] = await this.b.get(req, res, UserModel, { where: { userGuid: pl.objGuid } });
                        await this.b.setPlData(req, { key: 'objId', value: userData[0].userId });
                    } else {
                        console.log('CdObjService::validateCreate()/05')
                        this.b.setAlertMessage(`if registering user type, objGuid must be provided`, svSess);
                    }
                }
            } else {
                console.log('CdObjService::validateCreate()/06')
                ret = false;
                this.b.setAlertMessage(`cdObj type reference is invalid`, svSess);
            }
        } else {
            console.log('CdObjService::validateCreate()/07')
            this.b.setAlertMessage(`parentModuleGuid is missing in payload`, svSess);
        }

        ///////////////////////////////////////////////////////////////////
        // 3. confirm the parent referenced exists
        if ('parentModuleGuid' in pl) {
            console.log('CdObjService::validateCreate()/08')
            const serviceInput = {
                serviceModel: ModuleModel,
                docName: 'CdObjService::getModuleMenu$',
                cmd: {
                    action: 'find',
                    query: { where: { moduleGuid: pl.parentModuleGuid } }
                },
                dSource: 1
            }
            const moduleData: ModuleModel[] = await this.b.read(req, res, serviceInput)
            await this.b.setPlData(req, { key: 'parentModuleId', value: moduleData[0].moduleId });
            console.log('CdObjService::validateCreate()/moduleData:', moduleData);
            if (moduleData.length > 0) {
                console.log('CdObjService::validateCreate()/09')
                ret = true;
            } else {
                console.log('CdObjService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `parent reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
            }
        } else {
            console.log('CdObjService::getCdObj/11');
            this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
        }

        console.log('CdObjService::getCdObj/111');
        console.log('CdObjService::validateCreate()/req.post', JSON.stringify(req.post));
        pl = this.b.getPlData(req);
        console.log('CdObjService::validateCreate()/pl', JSON.stringify(pl));
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
        /////////////////////////////////////////////

        console.log('CdObjService::getCdObj/13');
        if (this.b.err.length > 0) {
            console.log('CdObjService::validateCreate()/14')
            console.log('CdObjService::validateCreate()/this.b.err:', this.b.err)
            ret = false;
        }
        console.log('CdObjService::getCdObj/15');
        console.log('CdObjService::getCdObj/ret:', ret);
        return ret;
    }

    async getCdObj(req, res) {
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
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getCdObjType(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdObjService::getCdObj/q:', q);
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
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
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

    getCdObjQB(req, res) {
        console.log('CdObjService::getCdObjQB()/1')
        this.b.entityAdapter.registerMappingFromEntity(CdObjViewModel);
        const q = this.b.getQuery(req);
        const serviceInput = {
            serviceModel: CdObjViewModel,
            docName: 'CdObjService::getCdObjQB',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        
        this.b.readQB$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = serviceInput.docName;
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

    async updateI(req, res, q): Promise<any> {
        console.log('CdObjService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdObjModel,
            docName: 'CdObjService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdObjService::update()/02')
        return this.b.update(req, res, serviceInput)
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