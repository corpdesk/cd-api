import { CacheContainer } from 'node-ts-cache';
import { MemoryStorage } from 'node-ts-cache-storage-memory';
import {
    Observable, map, mergeMap, of, bufferCount, tap, forkJoin, switchMap, defaultIfEmpty
} from 'rxjs';
import { SessionService } from '../../user/services/session.service';
import { AclService } from './acl.service';
import { GroupMemberService } from '../../user/services/group-member.service';
import { BaseService } from '../../base/base.service';
import { GroupService } from '../../user/services/group.service';
import { MenuViewModel } from '../models/menu-view.model';
import { CreateIParams, IAllowedModules, IMenuRelations, ISelectedMenu, IServiceInput } from '../../base/IBase';
import { MenuModel } from '../models/menu.model';
import { CdObjService } from './cd-obj.service';
import { CdObjModel } from '../models/cd-obj.model';
import { Logging } from '../../base/winston.log';

const menuCache = new CacheContainer(new MemoryStorage())

export class MenuService {
    logger: Logging;
    b: BaseService;
    srvGroup: GroupService;
    srvGroupMember: GroupMemberService;
    srvAcl: AclService;
    cuid;
    userGroupsArr = [];
    menuArrDb = [];
    serviceModel: MenuModel;

    /*
     * create rules
     */
    cRules = {
        required: [
            'menuName',
            'menuParentId'
        ],
        noDuplicate: [
            'menuName',
            'menuParentId'
        ],
    };

    constructor() {
        
        this.b = new BaseService();
        this.logger = new Logging();
        this.srvGroupMember = new GroupMemberService();
        this.srvAcl = new AclService();
        this.serviceModel = new MenuModel();
    }

    /**
     * {
            "ctx": "Sys",
            "m": "Moduleman",
            "c": "MenuController",
            "a": "actionCreate",
            "dat": {
                "f_vals": [{
                    "cd_obj": {
                        "cd_obj_name": "moduleName-controllerName-menuName",
                        "cd_obj_type_guid": "574c73a6-7e5b-40fe-aa89-e52ce1640f42",
                        "parent_module_guid": "a06f881e-41f1-45b9-87f4-8475fef7fcba"
                    },
                    "data": {
                        "menu_name": "reservation",
                        "menu_closet_file": "",
                        "menu_parent_id": "982",
                        "module_id": "258",
                        "menu_order": "11",
                        "path": "reservation",
                        "menu_description": "reservation",
                        "menu_lable": "reservation",
                        "menu_icon": "cog",
                        "active": true
                    }
                }],
                "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
            },
            "args": null
        }
     */
    async create(req, res): Promise<void> {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            if (await this.beforeCreate(req, res)) {
                const serviceInput = {
                    serviceInstance: this,
                    serviceModel: MenuModel,
                    serviceModelInstance: this.serviceModel,
                    docName: 'Create Menu',
                    dSource: 1,
                }
                console.log('MenuService::create()/')
                const respData = await this.b.create(req, res, serviceInput);
                this.b.i.app_msg = 'new menu created';
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = await respData;
                const r = await this.b.respond(req, res);
            } else {
                const i = {
                    messages: this.b.err,
                    code: 'MenuService:create',
                    app_msg: 'validation failed'
                };
                await this.b.serviceErr(req, res, i.app_msg, i.code)
                const r = await this.b.respond(req, res);
            }

        } else {
            svSess.sessResp.cd_token = req.post.dat.token;
            await this.b.setAppState(false, this.b.i, svSess.sessResp);
            const r = await this.b.respond(req, res);
        }
    }

    createI(req, res, createIParams: CreateIParams) {
        //
    }

    async validateCreate(req, res) {
        console.log('starting validateCreate()')
        console.log('validateCreate()/01')
        let ret = false;
        const params = {
            controllerInstance: this,
            model: MenuModel,
        }
        this.b.i.code = 'MenuService::validateCreate';
        if (await this.b.validateUnique(req, res, params)) {
            // console.log('validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                // console.log('validateCreate()/03')
                ret = true;
            } else {
                console.log('validateCreate()/04')
                this.b.i.app_msg = `you must provide ${this.cRules.required.join(', ')}`
                this.b.err.push(this.b.i.app_msg);
                ret = false;
            }
            // console.log('validateCreate()/05')
        } else {
            // console.log('validateCreate()/06')
            const msg = `duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`
            this.b.i.app_msg = msg
            this.b.i.messages.push(msg);
            ret = false;
        }
        // console.log('validateCreate()/07')
        return await ret;
    }

    async beforeCreate(req, res) {
        const cdObjQuery = req.post.dat.f_vals[0].cdObj;
        const svCdObj = new CdObjService();
        const si = {
            serviceInstance: svCdObj,
            serviceModel: CdObjModel,
            serviceModelInstance: svCdObj.serviceModel,
            docName: 'Create Menu/beforeCreate',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: cdObjQuery
        }
        let ret = false;
        const cdObjData: any = await svCdObj.createI(req, res, createIParams)
        if (cdObjData) {
            console.log('MenuService::beforeCreate()/cdObjData:', cdObjData)
            this.b.setPlData(req, { key: 'menuGuid', value: this.b.getGuid() });
            this.b.setPlData(req, { key: 'cdObjId', value: cdObjData.cdObjId });
            this.b.setPlData(req, { key: 'menuEnabled', value: true });
            ret = true;
        } else {
            this.b.i.app_msg = `duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`
            this.b.err.push(this.b.i.app_msg);
            ret = false;
        }
        return ret;
    }

    getMenu(req, res) {
        const f = this.b.getQuery(req);
        this.logger.logInfo('MenuService::getMenu/f:', f);
        const serviceInput: IServiceInput = {
            serviceModel: MenuViewModel,
            docName: 'MenuService::getMenu',
            cmd: {
                action: 'find',
                query: f
            },
            dSource: 1
        }
        this.b.read$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'MenuController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    /**
     * 
     * @param req 
     * @param res 
     * @param params 
     * @returns 
     */
    getAclMenu$(req, res, params: IAllowedModules): Observable<any> {
        this.logger.logInfo('MenuService::getAclMenu$()/params:', params)
        return params.modules$
            .pipe(
                mergeMap((m) => {
                    console.log('MenuService::getAclMenu$()/m:', m)
                    return m.map(mod => {
                        console.log('MenuService::getAclMenu$()/mod:', mod)
                        const moduleMenuData$ = this.getModuleMenu$(req, res, mod);
                        this.logger.logInfo('MenuService::getAclMenu$()/moduleMenuData:', moduleMenuData$)
                        return forkJoin({
                            modules: params.modules$,
                            menu: this.buildNestedMenu(this.getRootMenuId(moduleMenuData$), moduleMenuData$),
                        }).pipe(
                            map(({ menu, modules }) => {
                                console.log('MenuService::getAclMenu$()/mod:', mod)
                                return menu;
                            })
                        )
                    })
                })
                , mergeMap((m) => {
                    return m.pipe(
                        map((modules) => {
                            return modules;
                        })
                    )
                })
                , bufferCount(params.modulesCount)
            )
    }

    getModuleMenu$(req, res, moduleData): Observable<MenuViewModel[]> {
        this.logger.logInfo('MenuService::getModuleMenu$()/moduleData:', moduleData)
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: MenuViewModel,
            docName: 'MenuService::getModuleMenu$',
            cmd: {
                action: 'find',
                query: { where: { moduleGuid: moduleData.moduleGuid } }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput)
    }

    // menu_view
    // menu_id, menu_lable, menu_guid, closet_file, menu_action_id, doc_id, menu_parent_id, path, is_title, badge, is_layout,
    // module_id, module_guid, module_name, module_is_public, is_sys_module, children, menu_action,
    // cd_obj_id, cd_obj_name, last_sync_date, cd_obj_disp_name, cd_obj_guid, cd_obj_type_guid,
    // last_modification_date, parent_module_guid, parent_class_guid, parent_obj, show_name, icon,
    // show_icon, curr_val, cd_obj_enabled

    // MenuItem {
    //     id?: number; // menuId
    //     label?: string; // manuLabel
    //     icon?: string; // icon
    //     link?: string; // path
    //     subItems?: any; // children
    //     isTitle?: boolean; // isTitle
    //     badge?: any; // badge
    //     parentId?: number; // menuParentId
    //     isLayout?: boolean; // isLayout
    // }
    buildNestedMenu(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<any> {
        this.b.logTimeStamp('MenuService::buildNestedMenu/01')
        return this.getMenuItem(menuId$, moduleMenuData$).pipe(
            map((sm: ISelectedMenu) => {
                console.log('MenuService::buildNestedMenu/sm:', sm)
                let ret: IMenuRelations = {
                    menuParent: null,
                    menuChildren: null
                };
                if (sm.selectedItem) {
                    const data = sm.selectedItem;
                    this.b.logTimeStamp('MenuService::buildNestedMenu/02')
                    ret = {
                        menuParent: {
                            menuLabel: data.menuLabel,
                            menuId: data.menuId,
                            icon: data.icon,
                            path: data.path,
                            isTitle: data.isTitle,
                            badge: data.badge,
                            menuParentId: data.menuParentId,
                            isLayout: data.isLayout,
                            moduleIsPublic: data.moduleIsPublic,
                            moduleGuid: data.moduleGuid,
                            children: [],
                        },
                        menuChildren: this.getChildren(data.menuId, sm)
                    };
                } else {
                    ret = {
                        menuParent: null,
                        menuChildren: []
                    };
                }
                return ret;
            })
            , tap((m) => {
                this.b.logTimeStamp('MenuService::buildNestedMenu$/03')
            }),
            mergeMap(
                (parentWithChildIds) => forkJoin(
                    [
                        of(parentWithChildIds.menuParent),
                        ...parentWithChildIds.menuChildren.map(childMenu => this.buildNestedMenu(of(childMenu.menuId), moduleMenuData$))
                    ]
                )
            )
            , tap((m) => {
                this.b.logTimeStamp('MenuService::buildNestedMenu$/04')
            }),
            tap(([parent, ...children]) => {
                this.b.logTimeStamp('MenuService::buildNestedMenu$/05')
                if (parent) {
                    parent.children = children;
                }
            }),
            map(([parent,]) => parent)
            , tap((m) => {
                this.b.logTimeStamp('MenuService::buildNestedMenu$/06')
            }),
        );
    }

    getRootMenuId(moduleMenuData$: Observable<MenuViewModel[]>): Observable<number> {
        return moduleMenuData$
            .pipe(
                switchMap((menuData) => {
                    console.log('MenuService::getRootMenuId/menuData:', menuData)
                    const selectedMenu = menuData.filter((m) => {
                        if (m.menuParentId === -1) {
                            return m;
                        }
                    });
                    console.log('MenuService::getRootMenuId/selectedMenu:', selectedMenu)
                    return selectedMenu;
                })
                , switchMap(x => of(x.menuId))
            )

    }

    getMenuItem(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<ISelectedMenu> {
        this.b.logTimeStamp('MenuService::getMenuItem$/01')
        return moduleMenuData$
            .pipe(
                tap((m) => {
                    this.b.logger.logInfo('MenuService::getMenuItem$/m:', m)
                    menuId$.pipe(map((mId) => {
                        this.b.logTimeStamp('MenuService::getMenuItem$/02')
                        return mId;
                    }))
                }),
                mergeMap(
                    (mData: MenuViewModel[]) => forkJoin(
                        {
                            menuData: of(mData),
                            menuId: menuId$
                        }
                    ).pipe(
                        defaultIfEmpty(null)
                    )
                )
                , map(
                    (m) => {
                        if (m) {
                            return m.menuData.filter((menuItem: MenuViewModel) => {
                                if (menuItem.menuId === m.menuId) {
                                    return menuItem;
                                }
                            });
                        } else {
                            return [];
                        }
                    }
                )
                , tap((m) => {
                    // this.b.logTimeStamp('MenuService::getMenuItem$/03')
                })
                , mergeMap(
                    (menuItem: MenuViewModel[]) => forkJoin(
                        {
                            moduleMenuData: moduleMenuData$,
                            selectedItem: of(menuItem[0])
                        }
                    )
                )
                , tap((m) => {
                    // this.b.logTimeStamp('MenuService::getMenuItem$/04')
                }),
            )
    }

    getChildren(menuParentId: number, selectedMenu: ISelectedMenu): MenuViewModel[] {
        // console.log('MenuService::getChildren/01:');
        const moduleMenuData = selectedMenu.moduleMenuData;
        const data = moduleMenuData.filter((m) => {
            if (m.menuParentId === menuParentId) {
                return m;
            }
        });
        return data;
    }

    getMenuCount(req, res) {
        console.log('MenuService::getMenuCount()/reached 1')
        const q = this.b.getQuery(req);
        // console.log('MenuService::getModuleCount/q:', q);
        const serviceInput = {
            serviceModel: MenuViewModel,
            docName: 'MenuService::getMenu$',
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

    getMenuQB(req, res) {
        console.log('MenuService::getMenuCount()/reached 1')
        this.b.entityAdapter.registerMappingFromEntity(MenuViewModel);
        const q = this.b.getQuery(req);
        // console.log('MenuService::getModuleCount/q:', q);
        const serviceInput = {
            serviceModel: MenuViewModel,
            docName: 'MenuService::getMenu$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        
        this.b.readQB$(req, res, serviceInput)
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

    update(req, res) {
        const serviceInput = {
            serviceModel: MenuModel,
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
                this.b.respond(req, res);
            })
    }

    delete(req, res) {
        const serviceInput = {
            serviceModel: MenuModel,
            docName: 'MenuService::delete',
            cmd: {
                action: 'delete',
                query: req.post.dat.f_vals[0].query
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