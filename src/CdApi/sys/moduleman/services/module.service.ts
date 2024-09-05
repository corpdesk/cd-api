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
import { CreateIParams, IAclCtx, IQuery, IRespInfo, IServiceInput, ISessionDataExt, ObjectItem } from '../../base/IBase';
import { ModuleViewModel } from '../models/module-view.model';
import { CdService } from '../../base/cd.service';
import { Logging } from '../../base/winston.log';
import { GroupModel } from '../../user/models/group.model';
import { CdObjModel } from '../models/cd-obj.model';
import { ConsumerResourceModel } from '../models/consumer-resource.model';
import { MenuModel } from '../models/menu.model';
import { CdObjService } from './cd-obj.service';
import { ConsumerResourceService } from './consumer-resource.service';

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
    sessDataExt: ISessionDataExt;
    retMenuCollection:MenuModel[] = [];

    newModule: ModuleModel;
    newModCdObj: CdObjModel | boolean;
    newModConsumRecource: ConsumerResourceModel | boolean;
    newGroup: GroupModel | boolean;
    newModMenus: MenuModel[] | boolean;

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
        // this.svSess = new SessionService();
        // this.svConsumer = new ConsumerService();
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
            this.newModule = await this.b.create(req, res, serviceInput);
            const respData = this.afterCreate(req, res)
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
        const svSess = new SessionService();
        this.sessDataExt = await svSess.getSessionDataExt(req, res);
        this.b.setPlData(req, { key: 'moduleGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'moduleEnabled', value: true });
        return true;
    }

    /**
     * 
     * afterCreate is used to automate post module creation which includes:
     *  - registration of module group
     *  - registration of the module as a cd-object
     *  - registration of the module as consumer-resource to the current
     *  - registration of module menu items (if requested for)
     * 
     * @param req 
     * @param res 
     * @param createResult 
     * @returns 
     */
    async afterCreate(req, res): Promise<any> {
        console.log('ModuleService::afterCreate()/01')
        console.log('ModuleService::afterCreate()/this.sessDataExt:', this.sessDataExt)
        this.newGroup = await this.registerModuleGroup(req, res);
        console.log('ModuleService::afterCreate()/this.newGroup:', this.newGroup)
        /**
        * update new module with new group data
        */
        let updatedModule: any;
        if (this.newGroup) {
            updatedModule = await this.setGroupId(req, res)
            console.log('ModuleService::afterCreate()/updatedModule:', updatedModule)
        } else {
            // Handle the case where newGroup is null, if needed
        }

        /**
         * create new cdObje
         */
        if ("cdObj" in req.post.dat.f_vals[0]) {
            console.log('ModuleService::afterCreate()/cdOb is available')
            this.newModCdObj = await this.registerModCdObj(req, res);
            console.log('ModuleService::afterCreate()/this.newModCdObj:', this.newModCdObj)
        } else {
            // handle if cdObj component is not supplied
        }


        /**
         * register the module as a consumer resource
         */
        this.newModConsumRecource = await this.registerModConsumRecource(req, res);
        console.log('ModuleService::afterCreate()/this.newModConsumRecource:', this.newModConsumRecource)

        /**
         * create module menus
         */
        this.newModMenus = await this.registerModMenu(req, res);
        console.log('ModuleService::afterCreate()/this.newModMenus:', await this.newModMenus)


        /**
         * extract the latest state of new module and return to client
         */
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ModuleModel,
            docName: 'ModuleService::afterCreate',
            cmd: {
                action: 'find',
                query: { where: { moduleId: this.newModule.moduleId } }
            },
            dSource: 1,
        }
        console.log('ModuleService::afterCreate/serviceInput:', serviceInput);
        const ret = await this.b.read(req, res, serviceInput)
        console.log('ModuleService::afterCreate/ret:', ret);
        return await {
            moduleData: ret,
            moduleGroup: this.newGroup,
            moduleCdObj: this.newModCdObj,
            moduleConsumerResource: this.newModConsumRecource,
            moduleMenu: this.newModMenus
        };
        // return ret;

    }

    async setGroupId(req, res) {
        console.log('ModuleService::setGroupId/01');
        // const groupData: GroupModel;
        if (this.newModule && this.newModule) {
            // const g = groupData;
            const q = {
                update: {
                    groupGuid: this.newModule.moduleGuid,
                    moduleGuid: this.newModule.moduleGuid
                },
                where: {
                    moduleId: this.newModule.moduleId
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

    async registerModuleGroup(req, res) {
        const svGroup = new GroupService();

        /**
         *  - confirm bill is not double entry on moduleGroup
         *  - create or update accts/moduleGroup while creating a bill
         */
        const moduleGroup: GroupModel = {
            groupGuid: this.newModule.moduleGuid,
            groupName: this.newModule.moduleName,
            groupOwnerId: this.b.cuid,
            groupTypeId: 2,
            groupEnabled: true,
            moduleGuid: this.newModule.moduleGuid,
            companyId: 0 // this.b.sessDataExt.currentCompany.companyId
        }
        console.log('ModuleService::registerModuleGroup()/moduleGroup:', moduleGroup)
        const si = {
            serviceInstance: svGroup,
            serviceModel: GroupModel,
            serviceModelInstance: svGroup.serviceModel,
            docName: 'ModuleService/registerModuleGroup',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: moduleGroup
        }
        console.log('ModuleService::registerModuleGroup()/02')
        /**
         * create new group from new module data
         */
        return await svGroup.createI(req, res, createIParams)
    }

    async registerModCdObj(req, res) {
        const svCdObj = new CdObjService();
        const cdObj: CdObjModel = await this.b.getPlData(req, "cdObj")
        console.log('ModuleService::afterCreate()/cdObj:', cdObj)
        const si = {
            serviceInstance: svCdObj,
            serviceModel: CdObjModel,
            serviceModelInstance: svCdObj.serviceModel,
            docName: 'ModuleService/registerModCdObj',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: cdObj
        }
        console.log('ModuleService::registerModCdObj()/02')
        /**
         * create new group from new module data
         */
        return await svCdObj.createI(req, res, createIParams)
    }

    async registerModConsumRecource(req, res) {
        const svConsumerResource = new ConsumerResourceService();
        console.log("MosuleService::registerModConsumRecource()/this.b.sessDataExt:", this.sessDataExt)
        // console.log("MosuleService::registerModConsumRecource()/this.newModConsumRecource:", this.newModConsumRecource)
        const consumerModuleResource: ConsumerResourceModel = {
            consumerId: this.sessDataExt.currentConsumer.consumerId,
            consumerGuid: this.sessDataExt.currentConsumer.consumerGuid,
            consumerResourceName: this.newModule.moduleName,
            consumerResourceLink: 'javascript: void(0);',
            consumerResourceEnabled: true,
            objId: this.newModule.moduleId,
            objGuid: this.newModule.moduleGuid,
            cdObjTypeId: 3,
            cdObjId: this.newModCdObj["cdObjId"],
            cdObjGuid: this.newModCdObj["cdObjGuid"],
        }
        console.log('ModuleService::registerModConsumRecource()/consumerModuleResource:', consumerModuleResource)
        const si = {
            serviceInstance: svConsumerResource,
            serviceModel: ConsumerResourceModel,
            serviceModelInstance: svConsumerResource.serviceModel,
            docName: 'ModuleService/registerModConsumRecource',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: consumerModuleResource
        }
        console.log('ModuleService::registerModConsumRecource()/02')
        /**
         * create new group from new module data
         */
        return svConsumerResource.createI(req, res, createIParams)
    }

    // async registerModMenu(req, res) {
    //     console.log("MosuleService::registerModMenu()/this.sessDataExt:", this.sessDataExt)
    //     // const svConsumerResource = new ConsumerResourceService();
    //     // const svCdObj = new CdObjService();
    //     const svMenu = new MenuService();
    //     // let retMenuCollection:MenuModel[] = [];
    //     if("moduleMenu" in req.post.dat.f_vals[0]){
    //         /**
    //          * extract requested menu data
    //          */
    //         const moduleMenu: MenuModel[] = await this.b.getPlData(req, "moduleMenu")
    //         console.log("MosuleService::registerModMenu()/moduleMenu:", moduleMenu)


    //         moduleMenu.forEach(async (menuItem:MenuModel, i) => {
    //             console.log("MosuleService::registerModMenu()/i:", i)
    //             console.log("MosuleService::registerModMenu()/menuItem:", menuItem)
    //             /**
    //              * register cdObj and use the data to fill menu data
    //              */
    //             const cdObj:CdObjModel = {
    //                 cdObjName: this.newModule.moduleName,
    //                 cdObjTypeGuid: '574c73a6-7e5b-40fe-aa89-e52ce1640f42', // menu_item
    //                 parentModuleGuid: this.newModule.moduleGuid,
    //                 cdObjDispName: this.newModule.moduleName,
    //                 icon: "ri-gears-lines"
    //             }
    //             const moduleMenuCdObj:CdObjModel | boolean = await this.registerModCdObj(req,res)
    //             console.log("MosuleService::registerModMenu()/i:", i)
    //             console.log("MosuleService::registerModMenu()/moduleMenuCdObj:", moduleMenuCdObj)


    //             /**
    //             * menu data 
    //             */
    //             console.log("MosuleService::registerModMenu()/i:", i)
    //             console.log("MosuleService::registerModMenu()/retMenuCollection:", this.retMenuCollection)
    //             let menuParentId = 0;
    //             if(i === 0){
    //                 menuParentId = -1;
    //             } else {
    //                 if(this.retMenuCollection.length > 0){
    //                     menuParentId = this.retMenuCollection[0].menuId
    //                 } else {
    //                     console.log("MosuleService::registerModMenu()/problem with insertion to retMenuCollection:")
    //                     this.b.i.app_msg = `problem adding menu item:${menuItem.menuName} `
    //                     this.b.err.push(this.b.i.app_msg);
    //                 }  
    //             }
    //             const moduleMenu: MenuModel = {
    //                 menuName: menuItem.menuName,
    //                 menuLable: menuItem.menuName,
    //                 menuGuid: this.b.getGuid(),
    //                 menuActionId: moduleMenuCdObj["cdObjId"],
    //                 menuParentId: menuParentId,
    //                 moduleId: this.newModule.moduleId,
    //                 path: menuItem.path,
    //                 menuIcon: menuItem.menuIcon,
    //                 iconType: menuItem.iconType,
    //                 cdObjId: moduleMenuCdObj["cdObjId"],
    //                 menuEnabled: true
    //             }
    //             console.log("MosuleService::registerModMenu()/i:", i)
    //             console.log('ModuleService::registerModMenu()/moduleMenu:', moduleMenu)
    //             const si = {
    //                 serviceInstance: svMenu,
    //                 serviceModel: MenuModel,
    //                 serviceModelInstance: svMenu.serviceModel,
    //                 docName: 'ModuleService/registerModMenu',
    //                 dSource: 1,
    //             }
    //             const createIParams: CreateIParams = {
    //                 serviceInput: si,
    //                 controllerData: moduleMenu
    //             }
    //             console.log("MosuleService::registerModMenu()/i:", i)
    //             console.log("MosuleService::registerModMenu()/createIParams:", createIParams)
    //             console.log('ModuleService::registerModMenu()/02')
    //             /**
    //              * create new group from new module data
    //              */
    //             const ret:MenuModel = await svMenu.createI(req, res, createIParams)
    //             console.log("MosuleService::registerModMenu()/i:", i)
    //             console.log("MosuleService::registerModMenu()/ret:", ret)
    //             console.log("MosuleService::registerModMenu()/this.retMenuCollection:", this.retMenuCollection)
    //             this.retMenuCollection.push(ret)
    //             console.log("MosuleService::registerModMenu()/this.retMenuCollection.length:", this.retMenuCollection.length)
    //         })
            
    //         console.log('ModuleService::registerModMenu()/this.retMenuCollection:', this.retMenuCollection)
    //     }

    //     const serviceInput: IServiceInput = {
    //         serviceInstance: svMenu,
    //         serviceModel: MenuModel,
    //         docName: 'ModuleService::registerModMenu',
    //         cmd: {
    //             action: 'find',
    //             query: { where: { moduleId: this.newModule.moduleId } }
    //         },
    //         dSource: 1,
    //     }
    //     const retMenu: MenuModel[] = await this.b.read(req, res, serviceInput)
    //     console.log('ModuleService::registerModMenu()/retMenu:', retMenu)
    //     console.log('ModuleService::registerModMenu()/this.retMenuCollection:', this.retMenuCollection)
    //     return retMenu;
    // }

    async registerModMenu(req, res) {
        console.log("ModuleService::registerModMenu()/this.sessDataExt:", this.sessDataExt)
        const svMenu = new MenuService();
    
        if ("moduleMenu" in req.post.dat.f_vals[0]) {
            /**
             * extract requested menu data
             */
            const moduleMenu: MenuModel[] = await this.b.getPlData(req, "moduleMenu");
            console.log("ModuleService::registerModMenu()/moduleMenu:", moduleMenu);
    
            // Using for...of instead of forEach to handle async properly
            for (let i = 0; i < moduleMenu.length; i++) {
                const menuItem = moduleMenu[i];
                console.log("ModuleService::registerModMenu()/i:", i);
                console.log("ModuleService::registerModMenu()/menuItem:", menuItem);
    
                /**
                 * register cdObj and use the data to fill menu data
                 */
                const cdObj: CdObjModel = {
                    cdObjName: this.newModule.moduleName,
                    cdObjTypeGuid: '574c73a6-7e5b-40fe-aa89-e52ce1640f42', // menu_item
                    parentModuleGuid: this.newModule.moduleGuid,
                    cdObjDispName: this.newModule.moduleName,
                    icon: "ri-gears-lines"
                };
                const moduleMenuCdObj: CdObjModel | boolean = await this.registerModCdObj(req, res);
                console.log("ModuleService::registerModMenu()/moduleMenuCdObj:", moduleMenuCdObj);
    
                /**
                 * menu data
                 */
                console.log("ModuleService::registerModMenu()/retMenuCollection:", this.retMenuCollection);
                let menuParentId = 0;
    
                if (i === 0) {
                    menuParentId = -1; // First item as parent
                } else {
                    if (this.retMenuCollection.length > 0) {
                        menuParentId = this.retMenuCollection[0].menuId;
                    } else {
                        console.log("ModuleService::registerModMenu()/problem with insertion to retMenuCollection:");
                        this.b.i.app_msg = `problem adding menu item:${menuItem.menuName}`;
                        this.b.err.push(this.b.i.app_msg);
                    }
                }
    
                const newMenuItem: MenuModel = {
                    menuName: menuItem.menuName,
                    menuLable: menuItem.menuName,
                    menuGuid: this.b.getGuid(),
                    menuActionId: moduleMenuCdObj["cdObjId"],
                    menuParentId: menuParentId,
                    moduleId: this.newModule.moduleId,
                    path: menuItem.path,
                    menuIcon: menuItem.menuIcon,
                    iconType: menuItem.iconType,
                    cdObjId: moduleMenuCdObj["cdObjId"],
                    menuEnabled: true
                };
    
                console.log('ModuleService::registerModMenu()/newMenuItem:', newMenuItem);
    
                const si = {
                    serviceInstance: svMenu,
                    serviceModel: MenuModel,
                    serviceModelInstance: svMenu.serviceModel,
                    docName: 'ModuleService/registerModMenu',
                    dSource: 1,
                };
    
                const createIParams: CreateIParams = {
                    serviceInput: si,
                    controllerData: newMenuItem
                };
    
                /**
                 * create new group from new module data
                 */
                const ret: MenuModel = await svMenu.createI(req, res, createIParams);
                console.log("ModuleService::registerModMenu()/ret:", ret);
    
                this.retMenuCollection.push(ret);
                console.log("ModuleService::registerModMenu()/this.retMenuCollection.length:", this.retMenuCollection.length);
            }
    
            console.log('ModuleService::registerModMenu()/this.retMenuCollection:', this.retMenuCollection);
        }
    
        const serviceInput: IServiceInput = {
            serviceInstance: svMenu,
            serviceModel: MenuModel,
            docName: 'ModuleService::registerModMenu',
            cmd: {
                action: 'find',
                query: { where: { moduleId: this.newModule.moduleId } }
            },
            dSource: 1,
        };
    
        const retMenu: MenuModel[] = await this.b.read(req, res, serviceInput);
        console.log('ModuleService::registerModMenu()/retMenu:', retMenu);
        console.log('ModuleService::registerModMenu()/this.retMenuCollection:', this.retMenuCollection);
    
        return retMenu;
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