
import { BaseService } from '../../base/base.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
import { NotificationService } from '../../comm/services/notification.service';
import { CalendarService } from '../../scheduler/services/calendar.services';
import { GroupMemberService } from '../../user/services/group-member.service';
import { ConsumerService } from './consumer.service';
import { AclService } from './acl.service';
import { GroupService } from '../../user/services/group.service';
import { ModuleModel } from '../models/module.model';
import { IRespInfo, IServiceInput } from '../../base/IBase';
import { ModuleViewModel } from '../models/module-view.model';
import { CdService } from '../../base/cd.service';
import { DocModel } from '../models/doc.model';
import { DocTypeModel } from '../models/doc-type.model';
import { getConnection } from 'typeorm';
import { ModuleService } from './module.service';

export class DocService extends CdService {
    cdToken;
    docModel;
    b: BaseService;
    svSess: SessionService;
    svUser: UserService;
    svGroup: GroupService;
    svGroupMember: GroupMemberService;
    svNotif: NotificationService;
    svCalnd: CalendarService;
    svConsumer: ConsumerService;
    svAcl: AclService;
    consumerGuid: string;
    i: IRespInfo = {
        messages: null,
        code: '',
        app_msg: ''
    };

    /*
     * create rules
     */
    cRules = {
        required: [
            'docName',
            'docFrom',
            'docTypeId',
            'companyId',
        ],
        noDuplicate: [],
    };

    constructor() {
        super();
        this.b = new BaseService();
        this.docModel = new DocModel();
    }

    async create(req, res): Promise<void> {
        if (await this.validateCreate(req, res)) {
            this.docModel = new DocModel();
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: DocModel,
                docName: 'Create Doc',
                dSource: 1,
            }
            const regResp: any = await this.b.create(req, res, serviceInput);
            this.b.cdResp = await regResp;
            const r = await this.b.respond(res);
        } else {
            const i = {
                messages: this.b.err,
                code: 'DocService:create',
                app_msg: ''
            };
            await this.b.setAppState(false, i, null);
            const r = await this.b.respond(res);
        }
    }

    async validateCreate(req, res) {
        const params = {
            controllerInstance: this,
            model: ModuleModel,
        }
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                return true;
            } else {
                this.b.err.push(`you must provide ${this.cRules.required.join(', ')}`);
                return false;
            }
        } else {
            this.b.err.push(`duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`);
            return false;
        }
    }

    async beforeCreate(req, res) {
        this.b.setPlData(req, { key: 'docGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'docDate', value: this.b.mysqlNow() });
        this.b.setPlData(req, { key: 'docEnabled', value: true });
        this.b.setPlData(req, { key: 'docTypeId', value: await this.getDocTypeId(req, res) });
        this.b.setPlData(req, { key: 'companyId', value: await this.getCompanyId(req) });
    }

    async getDocTypeId(req, res): Promise<number> {
        let ret = 0;
        const m = req.post.m;
        const c = req.post.c;
        const a = req.post.a;
        const result: DocTypeModel[] = await this.getDocTypeByName(req, res, `${c}_${a}`)
        if (result.length > 0) {
            ret = result[0].docTypeId;
        } else {
            const r = await this.createDocType(req, res);
            ret = r[0].docTypeId;
        }
        return ret;
    }

    async createDocType(req, res): Promise<DocTypeModel[]> {
        const m = req.post.m;
        const c = req.post.c;
        const a = req.post.a;
        const docTypeRepository: any = await getConnection().getRepository(DocTypeModel);
        await this.b.setSess(req, res);
        const svModule = new ModuleService();
        const mod: ModuleModel[] = await svModule.getModuleByName(req, res, m)
        const dtm: DocTypeModel = new DocTypeModel();
        dtm.docTypeName = `${c}_${a}`;
        dtm.moduleGuid = mod[0].moduleGuid;
        dtm.docGuid = this.b.getGuid();
        dtm.docTypeController = c;
        dtm.docTypeAction = a;
        dtm.docTypeEnabled = true;
        dtm.enableNotification = true;
        const ret = await docTypeRepository.save(await dtm);
        console.log('createDocType()/ret:', await ret)
        return await ret;
    }

    async getDocTypeByName(req, res, docTypeName: string): Promise<DocTypeModel[]> {
        const serviceInput = {
            serviceInstance: this,
            serviceModel: DocTypeModel,
            docName: 'DocService::getDocTypeByName',
            cmd: {
                action: 'find',
                query: { where: { docTypeName: `${docTypeName}` } }
            },
            dSource: 1
        }
        return await this.b.read(req, res, serviceInput)
    }

    async getCompanyId(req) {
        return 1;
    }

    async docTypeExists(req, res, docTypeName: string): Promise<boolean> {
        let ret = false;
        const result = await this.getDocTypeByName(req, res, docTypeName)
        if (result.length > 0) {
            ret = true;
        }
        return ret;
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "filter": {
    //                         "select":["moduleId","moduleGuid"],
    //                         "where": { "moduleId":98}
    //                         }
    //                 }
    //             ],
    //             "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    getDoc(req, res) {
        const f = this.b.getQuery(req);
        const serviceInput = {
            serviceModel: ModuleViewModel,
            docName: 'MenuService::getModuleMenu$',
            cmd: {
                action: 'find',
                query: f
            },
            dSource: 1
        }
        this.b.read$(req, res, serviceInput)
            .subscribe((r) => {
                this.i.code = 'ModulesController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(res)
            })
    }

    getDocCount(req, res) {
        const q = this.b.getQuery(req);
        const serviceInput = {
            serviceModel: ModuleViewModel,
            docName: 'MenuService::getModuleCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.i.code = 'ModulesController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(res)
            })
    }

    /**
     * Use BaseService for simple search
     * @param req
     * @param res
     */
    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        return await this.b.read(req, res, serviceInput);
    }

    remove(req, res): Promise<void> {
        return null;
    }

    update(req, res) {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'MenuService::update',
            cmd: {
                action: 'update',
                query: req.post.dat.f_vals[0].query
            },
            dSource: 1
        }

        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(res)
            })
    }

    delete(req, res) {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::delete',
            cmd: {
                action: 'delete',
                query: req.post.dat.f_vals[0].query
            },
            dSource: 1
        }

        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(res)
            })
    }


}