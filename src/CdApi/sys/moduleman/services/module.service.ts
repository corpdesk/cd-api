import { Observable, of, forkJoin, iif } from 'rxjs';
import { map, mergeMap } from 'rxjs';
import * as Lá from 'lodash';
import { BaseService } from '../../base/base.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
import { NotificationService } from '../../comm/services/notification.service';
import { MemoService } from '../../comm/services/memo.service';
import { CalendarService } from '../../scheduler/services/calendar.services';
import { GroupMemberService } from '../../user/services/group-member.service';
import { ConsumerService } from './consumer.service';
import { MenuService } from './menu.service';
import { AclService } from './acl.service';
import { GroupService } from '../../user/services/group.service';
import { ModuleModel } from '../models/module.model';
import { CreateIParams, IAclCtx, IRespInfo, IServiceInput, ObjectItem } from '../../base/IBase';
import { ModuleViewModel } from '../models/module-view.model';
import { CdService } from '../../base/cd.service';

export class ModuleService extends CdService {
    cdToken;
    serviceModel;
    b: BaseService;
    srvSess: SessionService;
    srvUser: UserService;
    srvGroup: GroupService;
    srvGroupMember: GroupMemberService;
    srvMemo: MemoService;
    srvMenu: MenuService;
    srvNotif: NotificationService;
    srvCalnd: CalendarService;
    srvConsumer: ConsumerService;
    srvAcl: AclService;
    consumerGuid: string;

    /*
     * create rules
     */
    cRules: any = {
        required: [
            'moduleName',
            'isSysModule',
        ],
        noDuplicate: [
            'moduleName',
        ],
    };

    constructor() {
        super();
        this.b = new BaseService();
        this.serviceModel = new ModuleModel();
    }

    async create(req, res): Promise<void> {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: ModuleModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Module',
                dSource: 1,
            }
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new module created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(res);
        } else {
            svSess.sessResp.cd_token = req.post.dat.token;
            this.b.i.app_msg = 'validation failed'
            await this.b.setAppState(false, this.b.i, svSess.sessResp);
            const r = await this.b.respond(res);
        }
    }

    createI(req, res, createIParams: CreateIParams) {
        //
    }

    async validateCreate(req, res) {
        const params = {
            controllerInstance: this,
            model: ModuleModel,
        }
        this.b.i.code = 'ModuleService::validateCreate';
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                return true;
            } else {
                this.b.i.app_msg = `you must provide ${this.cRules.required.join(', ')}`
                this.b.err.push(this.b.i.app_msg);
                return false;
            }
        } else {
            this.b.i.app_msg = `duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`
            this.b.err.push(this.b.i.app_msg);
            return false;
        }
    }

    async beforeCreate(req, res): Promise<boolean> {
        this.b.setPlData(req, { key: 'moduleGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'moduleEnabled', value: true });
        return true;
    }

    getModulesUserData$(req, res, cUser: ModuleModel): Observable<any> {
        this.srvSess = new SessionService();
        this.srvUser = new UserService();
        this.srvMemo = new MemoService();
        this.srvNotif = new NotificationService();
        this.srvCalnd = new CalendarService();
        this.srvGroup = new GroupService();
        this.srvGroupMember = new GroupMemberService();
        this.srvConsumer = new ConsumerService();
        this.srvMenu = new MenuService();
        this.srvAcl = new AclService();
        const cguid = this.srvConsumer.getConsumerGuid(req);
        const clientConsumer$ = this.srvConsumer.getConsumerByGuid$(req, res, cguid);
        const allowedModules$ = this.getAclModule$(req, res, { currentUser: cUser, consumerGuid: cguid });
        const menuData$ = allowedModules$
            .pipe(
                mergeMap(
                    (am: any[]) => iif(
                        () => {
                            return am.length > 0
                        },
                        this.srvMenu.getAclMenu$(req, res, { modules$: allowedModules$, modulesCount: am.length }),
                        []
                    )
                )
            )
        /**
         * Add more user data
         * - notifications
         * - memos
         * - calender
         */
        // const acoid = this.srvUser.getUserActiveCo();
        // const notifdata = this.srvNotif.getsrvNotifications(cuid);
        // const notifsumm = this.srvNotif.getsrvNotifications_summary(cuid);
        // const memosumm = this.srvMemo.getMemoSummary(cuid);
        // const calndsumm = this.srvCalnd.getCalendarSumm(cuid);
        // const userContacts = this.srvUser.getContacts(cuid);
        // const userPals = this.srvGroupMember.getPals(cuid);

        const result$ = forkJoin({
            consumer: clientConsumer$,
            menuData: menuData$,
            userData: of(cUser),
            /////////////////////
            // OPTIONAL ADDITIVES:
            // notifData: notifdata,
            // notifSumm: notifsumm,
            // memoSumm: memosumm,
            // calndSumm: calndsumm,
            // contacts: userContacts,
            // pals: userPals,
            // aCoid: acoid,
        });
        return result$;
    }

    getAclModule$(req, res, params): Observable<any> {
        this.consumerGuid = params.consumerGuid;
        return forkJoin({
            // unfilteredModules: this.getAll$(req, res).pipe(map((m) => { return m })), // for isRoot
            userRoles: this.srvAcl.aclUser$(req, res, params).pipe(map((m) => { return m })),
            consumerModules: this.srvAcl.aclModule$(req, res).pipe(map((m) => { return m })),
            moduleParents: this.srvAcl.aclModuleMembers$(req, res, params).pipe(map((m) => { return m }))
        })
            .pipe(
                map((acl: any) => {
                    // Based on acl result, return appropirate modules
                    const publicModules = acl.consumerModules.filter(m => m.moduleIsPublic);
                    if (acl.userRoles.isConsumerRoot.length > 0) { // if userIsConsumerRoot then return all consumerModules
                        return acl.consumerModules;
                    }
                    else if (acl.userRoles.isConsumerUser.length > 0) { // if user is registered as consumer user then filter consumer modules
                        const userModules = this.b.intersect(acl.consumerModules, acl.moduleParents, 'moduleGuid');
                        return userModules.concat(publicModules); // return user modules and public modules
                    }
                    else {  // if is neither of the abobe, return zero modules
                        return publicModules; // return only public modules
                    }
                })
            );
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
    getModule(req, res) {
        const f = this.b.getQuery(req);
        console.log('ModuleService::getModule/f:', f);
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
                this.b.i.code = 'ModulesController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(res)
            })
    }

    getModuleCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('ModuleService::getModuleCount/q:', q);
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
                this.b.i.code = 'ModulesController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(res)
            })
    }

    getModuleByName(req, res, moduleName): Promise<ModuleModel[]> {
        const f = { where: { moduleName: `${moduleName}` } };
        const serviceInput = {
            serviceInstance: this,
            serviceModel: ModuleViewModel,
            docName: 'ModuleService::getModuleByName',
            cmd: {
                action: 'find',
                query: f
            },
            dSource: 1
        }
        return this.b.read(req, res, serviceInput)
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
        console.log(`starting SessionService::remove()`);
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