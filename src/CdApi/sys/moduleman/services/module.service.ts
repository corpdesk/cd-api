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
import { CreateIParams, IAclCtx, IQuery, IRespInfo, IServiceInput, ObjectItem } from '../../base/IBase';
import { ModuleViewModel } from '../models/module-view.model';
import { CdService } from '../../base/cd.service';
import { Logging } from '../../base/winston.log';
import { GroupModel } from '../../user/models/group.model';

export class ModuleService extends CdService {
    logger: Logging;
    cdToken;
    serviceModel;
    b: BaseService;
    svSess: SessionService;
    svUser: UserService;
    svGroup: GroupService;
    svGroupMember: GroupMemberService;
    svMemo: MemoService;
    svMenu: MenuService;
    svNotif: NotificationService;
    svCalnd: CalendarService;
    svConsumer: ConsumerService;
    svAcl: AclService;
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
        this.logger = new Logging();
        this.serviceModel = new ModuleModel();
        this.svSess = new SessionService();
        this.svConsumer = new ConsumerService();
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
            const newModule = await this.b.create(req, res, serviceInput);
            const respData = this.afterCreate(req, res, newModule)
            this.b.i.app_msg = 'new module created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            svSess.sessResp.cd_token = req.post.dat.token;
            const r = await this.b.respond(req, res);
        }
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

    /**
     * sync bill with cd-moduleGroup
     * @param req 
     * @param res 
     * @param createResult 
     * @returns 
     */
    async afterCreate(req, res, newModule: ModuleModel): Promise<any> {
        console.log('ModuleService::afterCreate()/01')
        console.log('ModuleService::afterCreate()/newModule:', newModule)
        // const nb = await newModule;
        const sessionData = await this.svSess.getSession(req, res);
        console.log('ModuleService::afterCreate()/sessionData:', sessionData)
        const consumerGuid = sessionData[0].consumerGuid;
        const cuid = sessionData[0].currentUserId;
        console.log('ModuleService::afterCreate()/consumerGuid:', consumerGuid)
        const consumerData = await this.svConsumer.getCompanyData(req, res, consumerGuid);
        console.log('ModuleService::afterCreate()/consumerData:', consumerData)
        const companyId = consumerData[0].companyId
        /**
         *  - confirm bill is not double entry on moduleGroup
         *  - create or update accts/moduleGroup while creating a bill
         */
        const moduleGroup: GroupModel = {
            groupGuid: newModule.moduleGuid,
            groupName: newModule.moduleName,
            groupOwnerId: cuid,
            groupTypeId: 2,
            groupEnabled: true,
            moduleGuid: newModule.moduleGuid,
            companyId: companyId
        }
        console.log('ModuleService::afterCreate()/moduleGroup:', moduleGroup)
        const svGroup = new GroupService();
        const si = {
            serviceInstance: svGroup,
            serviceModel: GroupModel,
            serviceModelInstance: svGroup.serviceModel,
            docName: 'ModuleService/afterCreate',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: moduleGroup
        }
        console.log('ModuleService::afterCreate()/02')
        /**
         * create new group from new module data
         */
        const newGroup = await svGroup.createI(req, res, createIParams)
        console.log('ModuleService::afterCreate()/newGroup:', newGroup)
        /**
         * update new module with new group data
         */
        // const update = await this.setGroupId(req, res, newGroup, newModule)
        let updatedModule: any;
        if (newGroup) {
            updatedModule = await this.setGroupId(req, res, newGroup[0], newModule)
            console.log('ModuleService::afterCreate()/updatedModule:', updatedModule)
        } else {
            // Handle the case where newGroup is null, if needed
        }


        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ModuleModel,
            docName: 'ModuleService::afterCreate',
            cmd: {
                action: 'find',
                query: { where: { moduleId: newModule.moduleId } }
            },
            dSource: 1,
        }
        console.log('ModuleService::afterCreate/serviceInput:', serviceInput);
        const ret = await this.b.read(req, res, serviceInput)
        console.log('ModuleService::afterCreate/ret:', ret);
        return ret;
    }

    async setGroupId(req, res, newGroup: GroupModel, newModule: ModuleModel) {
        console.log('ModuleService::setGroupId/01');
        // const groupData: GroupModel;
        if (newModule && newModule) {
            // const g = groupData;
            const q = {
                update: {
                    groupGuid: newModule.moduleGuid,
                    moduleGuid: newModule.moduleGuid
                },
                where: {
                    moduleId: newModule.moduleId
                }
            }
            console.log('ModuleService::setGroupId/q:', q);
            return await this.updateI(req, res, q);
        } else {
            const e = 'could not get invoice data'
            this.b.err.push(e);
            const i = {
                messages: this.b.err,
                code: 'ModuleService:setGroupId',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }

    }

    async createI(req, res, createIParams: CreateIParams): Promise<ModuleModel | boolean> {
        console.log('ModuleService::create()/createIParams:', createIParams)
        const newModule = await this.b.createI(req, res, createIParams)
        // const ret = await this.afterCreate(req, res, newModule)
        return newModule;
    }

    /**
     * This method uses getAclModule$ to get allowedModules$ which is then used to generate menu data
     * allowedModules$ is generated using this.getAclModule$(req, res, { currentUser: cUser, consumerGuid: cguid });
     * note that allowedModules$ is an
     * allowedModules$ is then used to generate acl menu
     * 
     * @param req 
     * @param res 
     * @param cUser 
     * @returns 
     */
    getModulesUserData$(req, res, cUser: ModuleModel): Observable<any> {
        this.b.logTimeStamp('ModuleService::getModulesUserData$/01')
        this.svSess = new SessionService();
        this.svUser = new UserService();
        this.svMemo = new MemoService();
        this.svNotif = new NotificationService();
        this.svCalnd = new CalendarService();
        this.svGroup = new GroupService();
        this.svGroupMember = new GroupMemberService();
        this.svConsumer = new ConsumerService();
        this.svMenu = new MenuService();
        this.svAcl = new AclService();

        /**
         * extract the request consumer guid
         */
        const cguid = this.svConsumer.getConsumerGuid(req);
        // this.logger.logInfo("ModuleService::getModulesUserData$/02/cguid:", cguid)

        /**
         * use consumer guid to get the associated consumer
         */
        const clientConsumer$ = this.svConsumer.getConsumerByGuid$(req, res, cguid);
        const allowedModules$ = this.getAclModule$(req, res, { currentUser: cUser, consumerGuid: cguid });
        // allowedModules$.subscribe((d)=>{
        //     console.log("ModuleService::getModulesData$()/allowedModules$:", d)
        // })
        const menuData$ = allowedModules$
            .pipe(
                mergeMap(
                    (am: any[]) => iif(
                        () => {
                            this.logger.logInfo('ModuleService::getModulesUserData$/am:', am)
                            return am.length > 0
                        },
                        this.svMenu.getAclMenu$(req, res, { modules$: allowedModules$, modulesCount: am.length }),
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
        // const acoid = this.svUser.getUserActiveCo();
        // const notifdata = this.svNotif.getsvNotifications(cuid);
        // const notifsumm = this.svNotif.getsvNotifications_summary(cuid);
        // const memosumm = this.svMemo.getMemoSummary(cuid);
        // const calndsumm = this.svCalnd.getCalendarSumm(cuid);
        // const userContacts = this.svUser.getContacts(cuid);
        // const userPals = this.svGroupMember.getPals(cuid);

        const result$ = forkJoin({
            consumer: clientConsumer$,
            menuData: menuData$
            // .pipe(
            //     map(menu => menu.flat())
            //   )
            ,
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

    /**
     * Acl modules or allowed modules are modules that are accessible to the current user.
     * For this to be aggregated, 3 datasets are retreived from database to an object as below:
     *  {
            // unfilteredModules: this.getAll$(req, res).pipe(map((m) => { return m })), // for isRoot
            userRoles: this.svAcl.aclUser$(req, res, params).pipe(map((m) => { return m })),
            consumerModules: this.svAcl.aclModule$(req, res).pipe(map((m) => { return m })),
            moduleParents: this.svAcl.aclModuleMembers$(req, res, params).pipe(map((m) => { return m }))
        }

     *  1. User Roles:
        The current user must be registered as a resource to the current consumer in session.
     *  Exceptions is modules that are marked as public.
     *  Apart from being registered as a resource to a consumer, the consumer type is 
     *  used to mark user roles eg consumer_root, consumer_user, consumer_tech, consumer_admin
     *  The above are fetched using consumer_resources_view
     * 
     *  2. Consumer Modules:
     *  These are modules that the current user has acces to.
     *  Must be a module registed as a resource for a given consumer.
     *  The data is also fetched from consumer_resources_view
     * 
     *  3. ModuleParents:
     *  
     * 
     * 
     * @param req 
     * @param res 
     * @param params 
     * @returns 
     */
    getAclModule$(req, res, params): Observable<any> {
        this.b.logTimeStamp('ModuleService::getAclModule$/01')
        this.consumerGuid = params.consumerGuid;
        this.svAcl.consumerGuid = params.consumerGuid;
        this.logger.logInfo('ModuleService::getAclModule$()/params:', params)
        this.logger.logInfo('ModuleService::getAclModule$()/this.svAcl.consumerGuid:', this.svAcl.consumerGuid)
        // this.logger.logInfo('ModuleService::getAclModule$()/01:');
        return forkJoin({
            // unfilteredModules: this.getAll$(req, res).pipe(map((m) => { return m })), // for isRoot
            userRoles: this.svAcl.aclUser$(req, res, params).pipe(map((m) => { return m })),
            consumerModules: this.svAcl.aclModule$(req, res).pipe(map((m) => { return m })),
            moduleParents: this.svAcl.aclModuleMembers$(req, res, params).pipe(map((m) => { return m }))
        })
            .pipe(
                map((acl: any) => {
                    this.b.logTimeStamp('ModuleService::getModulesUserData$/02')
                    this.logger.logInfo('ModuleService::getAclModule$()/acl:', acl)
                    /**
                     * - Public modules are included without acl filtering
                     * - Based on acl result, return appropirate modules
                     */
                    const publicModules = acl.consumerModules.filter(m => m.moduleIsPublic);
                    this.logger.logInfo('ModuleService::getAclModule$()/publicModules:', publicModules)
                    /**
                     * - if userIsConsumerRoot then return all consumerModules
                     */
                    if (acl.userRoles.isConsumerRoot.length > 0) {
                        // this.b.logTimeStamp('ModuleService::getModulesUserData$/03')
                        return acl.consumerModules;
                    }
                    else if (acl.userRoles.isConsumerUser.length > 0) { // if user is registered as consumer user then filter consumer modules
                        // this.b.logTimeStamp('ModuleService::getModulesUserData$/04')
                        // this.logger.logInfo('ModuleService::getModulesUserData$/acl.userRoles.isConsumerUser:', acl.userRoles.isConsumerUser);
                        // this.logger.logInfo('ModuleService::getModulesUserData$/acl.moduleParents:', acl.moduleParents);
                        // this.logger.logInfo('ModuleService::getModulesUserData$/acl.consumerModules:', acl.consumerModules);
                        const userModules = this.b.intersect(acl.consumerModules, acl.moduleParents, 'moduleGuid');
                        // this.logger.logInfo('ModuleService::getModulesUserData$/userModules:', userModules);
                        return userModules.concat(publicModules); // return user modules and public modules
                    }
                    else {  // if is neither of the above, return zero modules
                        // this.logger.logInfo('ModuleService::getAclModule$()/publicModules:', publicModules)
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
        // this.logger.logInfo('ModuleService::getModule/f:', f);
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
                this.b.respond(req, res)
            })
    }

    getModuleCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('ModuleService::getModuleCount/q:', q);
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
                this.b.respond(req, res)
            })
    }

    getModuleQB(req, res) {
        console.log('ModuleService::getModuleQB()/1')
        this.b.entityAdapter.registerMappingFromEntity(ModuleViewModel);
        const q = this.b.getQuery(req);
        // console.log('MenuService::getModuleCount/q:', q);
        const serviceInput = {
            serviceModel: ModuleViewModel,
            docName: 'ModuleService::getModuleQB',
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
        // this.logger.logInfo(`starting SessionService::remove()`);
        return null;
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any): IQuery {
        if (q.update.moduleEnabled === '') {
            q.update.moduleEnabled = null;
        }
        return q;
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
                this.b.respond(req, res)
            })
    }

    async updateI(req, res, q): Promise<any> {
        console.log('ModuleService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('ModuleService::update()/02')
        return this.b.update(req, res, serviceInput)
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
                /**
                 * TODO:
                 * implemement svGroup.deletI(req,res)
                 * then use it to delet group associated with this module
                 */
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }
}