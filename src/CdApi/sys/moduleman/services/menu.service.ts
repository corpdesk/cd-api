import { Cache, CacheContainer } from 'node-ts-cache';
import { MemoryStorage } from 'node-ts-cache-storage-memory';
import {
    Observable, map, mergeMap, of, from, expand, bufferCount, tap, forkJoin, take, switchMap, pipe, defaultIfEmpty
} from 'rxjs';
import * as Lá from 'lodash';
import { SessionService } from '../../user/services/session.service';
import { AclService } from './acl.service';
import config from '../../../../config';
import { GroupMemberService } from '../../user/services/group-member.service';
import { BaseService } from '../../base/base.service';
import { GroupService } from '../../user/services/group.service';
import { MenuViewModel } from '../models/menu-view.model';
import { IAllowedModules, IMenuRelations, ISelectedMenu } from '../../base/IBase';

const menuCache = new CacheContainer(new MemoryStorage())

export class MenuService {
    b: BaseService;
    srvGroup: GroupService;
    srvGroupMember: GroupMemberService;
    srvAcl: AclService;
    cuid;
    userGroupsArr = [];
    moduleName;
    menuArrDb = [];

    constructor() {
        this.b = new BaseService();
        this.srvGroupMember = new GroupMemberService();
        this.srvAcl = new AclService();
    }

    /////////////////////////////////
    // getAclMenu(req, res, modules$: Observable<any>) {
    //     modules$
    //         .pipe(
    //             map((moduleData) => {
    //                 return this.getModuleMenu$(req, res, moduleData);
    //             })
    //         )
    // }
    getAclMenu(req, res, params: IAllowedModules): Observable<any> {
        // console.log('starting MenuService::getAclMenu$(req, res, params)')
        return params.modules$
            .pipe(
                mergeMap((m) => {
                    console.log('ModuleService::getModulesUserData$()/am:', m);
                    return m.map(mod => {
                        const moduleMenuData$ = this.getModuleMenu$(req, res, mod);
                        return forkJoin({
                            modules: params.modules$,
                            menu: this.buildNestedMenu(this.getRootMenuId(moduleMenuData$), moduleMenuData$),
                        }).pipe(
                            map(({ menu, modules }) => {
                                // console.log('menu:', menu);
                                return menu;
                            })
                        )
                    })
                })
                , mergeMap((m) => {
                    return m.pipe(
                        map((modules) => {
                            // console.log('modules:', modules);
                            return modules;
                        })
                    )
                })
                , bufferCount(params.modulesCount)
            )
        // .subscribe((m: any) => {
        //     console.log('subscribe/m:', m);
        //     this.b.cdResp.data = m;
        //     this.b.respond(res);
        // });
    }

    getModuleMenu$(req, res, moduleData): Observable<MenuViewModel[]> {
        // console.log('starting MenuService::getModuleMenu$(req, res, moduleData)')
        // console.log('MenuService::getModuleMenu$(req, res, moduleData)/moduleData.moduleGuid:', moduleData.moduleGuid)
        const serviceInput = {
            serviceModel: MenuViewModel,
            docName: 'MenuService::getModuleMenu$',
            cmd: {
                action: 'find',
                filter: { where: { moduleGuid: moduleData.moduleGuid } }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput)
        // .subscribe((menu: any) => {
        //     console.log('menu:', menu);
        //     this.b.cdResp.data = menu;
        //     this.b.respond(res);
        // });
    }

    buildNestedMenu(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<any> {
        // console.log('starting MenuService::buildNestedMenu(req, res)');
        return this.getMenuItem(menuId$, moduleMenuData$).pipe(
            map((sm: ISelectedMenu) => {
                // console.log('buildNestedMenu/sm:', sm)
                let ret: IMenuRelations = {
                    menuParent: null,
                    menuChildren: null
                };
                if (sm.selectedItem) {
                    const data = sm.selectedItem;
                    // console.log('buildNestedMenu/data:', data)
                    ret = {
                        menuParent: { menuLable: data.menuLable, menuId: data.menuId, children: [] },
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
                // console.log('buildNestedMenu2()/tap1/m.length:', m);
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
                // console.log('buildNestedMenu2()/tap2/m.length:', m);
            }),
            tap(([parent, ...children]) => {
                // console.log('parent:', parent);
                if (parent) {
                    parent.children = children;
                }
            }),
            map(([parent,]) => parent)
            , tap((m) => {
                // console.log('buildNestedMenu2()/tap3/m.length:', m);
            }),
        );
    }

    getRootMenuId(moduleMenuData$: Observable<MenuViewModel[]>): Observable<number> {
        // console.log('starting MenuService::getRootMenuId(moduleMenuData$: Observable<MenuViewModel[]>)')
        return moduleMenuData$
            .pipe(
                switchMap((menuData) => {
                    const selectedMenu = menuData.filter((m) => {
                        if (m.menuParentId === -1) {
                            return m;
                        }
                    });
                    // return selectedMenu$[0].menuId;
                    return selectedMenu;
                })
                , switchMap(x => of(x.menuId))
            )

    }

    getMenuItem(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<ISelectedMenu> {
        // console.log('starting MenuService::getMenuItem(moduleId$, moduleMenuData$)');
        return moduleMenuData$
            .pipe(
                tap((m) => {
                    // console.log('getMenuItem()/tap3/m:', m);
                    menuId$.pipe(map((mId) => {
                        console.log('mId:', mId);
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
                        // defaultIfEmpty({menuData:[],menuId:0}),
                        defaultIfEmpty(null)
                    )
                )
                , map(
                    (m) => {
                        // console.log('getMenuItem()/map/m:', m);
                        if (m) {
                            return m.menuData.filter((menuItem: MenuViewModel) => {
                                // console.log('getMenuItem2()/filter/menuItem.menuParentId:', menuItem.menuParentId);
                                // console.log('getMenuItem2()/filter/m.menuItem:', m.menuItem);
                                if (menuItem.menuId === m.menuId) {
                                    // console.log('getMenuItem()/filter/...matchfound:');
                                    return menuItem;
                                }
                            });
                        } else {
                            return [];
                        }
                    }
                )
                , tap((m) => {
                    // console.log('getMenuItem2()/tap1/m.length:', m.length);
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
                    // console.log('getMenuItem2()/tap2/m.length:', m.length);
                }),
            )
    }

    getChildren(menuParentId: number, selectedMenu: ISelectedMenu): MenuViewModel[] {
        // console.log('starting MenuService::getChildren(req, res)');
        // console.log('getChildren2/menuParentId:', menuParentId)
        const moduleMenuData = selectedMenu.moduleMenuData;
        // console.log('getChildren2/moduleMenuData:', moduleMenuData)
        const data = moduleMenuData.filter((m) => {
            if (m.menuParentId === menuParentId) {
                return m;
            }
        });
        // console.log('getChildren2()/data:', data);
        return data;
    }

    /////////////////////////////////

    // getModuleMenu$(req, res, moduleData) {
    //     //
    // }

    async getMenu(req, res, modules) {
        // console.log('starting getMenu(req, modules)')
        const srvSess = new SessionService();
        const srvAcl = new AclService();
        const menuArrDb = [];
        // let menuData = [];
        // console.log('modules:', modules);
        // return await Promise.all(modules.map(async (module) => {
        //     this.cuid = srvSess.getCuid(req);
        //     srvAcl.cuid = this.cuid;
        //     if (module.moduleName.length > 0) {
        //         const menuCacheKey = `${module.moduleName}_${module.isSysModule}_${this.cuid}`;
        //         const cachedMenu = await menuCache.getItem<string[]>(menuCacheKey);
        //         const paramObj = {
        //             modArr: module,
        //             menuArr: menuArrDb
        //         };
        //         let menuItemArr;
        //         if (cachedMenu) {
        //             menuItemArr = cachedMenu;
        //         } else {
        //             try {
        //                 menuItemArr = await this.getModuleMenu(req, res, paramObj);
        //                 // console.log('MenuService::getMenu()/menuItemArr:', await menuItemArr);
        //                 await menuCache.setItem(menuCacheKey, menuItemArr, { ttl: config.cache.ttl });
        //                 return await menuItemArr;
        //             } catch (e) {
        //                 console.log(`MenuService::getMenu/Error with the module: ${module.moduleName}, \n ErrorDetails:${e}`);
        //             }
        //         }
        //     }
        // }));
        // console.log('MenuService::getMenu/menuData:', await menuData);
        // return await this.validateMenuData(menuData);

    }

    async validateMenuData(menuData) {
        console.log('MenuService::validateMenuData()/menuData:', menuData);
        return await menuData;
    }

    async getModuleMenu(req, res, paramObj) {
        // console.log('starting getModuleMenu(req, res, paramObj)')
        // console.log('MenuService::getModuleMenu/paramObj:', paramObj);
        // console.log('MenuService::getModuleMenu/paramObj:', paramObj);
        // console.log('MenuService::getModuleMenu/001');
        const module = paramObj.modArr;
        const moduleName = module.moduleName;
        const moduleGroupGuid = module.groupGuid;
        let countAcl;
        if (moduleGroupGuid) {
            this.srvAcl.currentModule = moduleName;
        } else {
            countAcl = 0;
        }
        // console.log('MenuService::getModuleMenu/002');
        countAcl = 1;
        const userGroups = [];
        let moduleMenu;
        if (countAcl > 0) {
            // console.log('MenuService::getModuleMenu/005');
            moduleMenu = await this.buildMenu(req, res, paramObj);
        } else {
            // console.log('MenuService::getModuleMenu/006');
            moduleMenu = [];
        }
        // console.log('MenuService::getModuleMenu/007');
        return moduleMenu;
    }

    async buildMenu(req, res, paramObj) {
        // console.log('starting MenuService::buildMenu(req, res, paramObj)')
        // console.log('MenuService::buildMenu/paramObj:', paramObj);
        // console.log('MenuService::this.buildMenu/moduleName:', moduleName);
        const moduleName = paramObj.modArr.moduleName;
        // console.log('MenuService::buildMenu/001');
        if (moduleName) {
            // console.log('MenuService::buildMenu/002');
            this.moduleName = moduleName;
            paramObj = await this.setMenuArrDb(req, res, paramObj);
            const menuRoot = await this.getMenuRoot(paramObj);
            // console.log('MenuService::this.buildMenu/menuRoot:', JSON.stringify(menuRoot));
            const menuChildren = await this.getMenuChildren(paramObj, menuRoot);
            return await this.attachChildren(paramObj, menuRoot, menuChildren);
            return [];
        }
    }

    async setMenuArrDb(req, res, paramObj) {
        // console.log('starting MenuService::setMenuArrDb()');
        // console.log('MenuService::this.menuArrDb:', await this.menuArrDb);
        const serviceInput = {
            serviceModel: MenuViewModel,
            docName: 'MenuService::getModuleMenu',
            cmd: {
                action: 'find',
                filter: { where: { moduleName: paramObj.modArr.moduleName } }
            },
            dSource: 1,
        }
        paramObj.menuArr = await this.b.read(req, res, serviceInput);
        paramObj.menuArr = await this.setActions(paramObj);
        // console.log('MenuService::setMenuArrDb/paramObj:', await paramObj);
        return await paramObj;
    }

    async getMenuRoot(paramObj) {
        // console.log('starting MenuService::getMenuRoot()');
        const menuArrDb = paramObj.menuArr;
        // console.log('MenuService::getMenuRoot()/this.menuArrDb:', menuArrDb)
        return await menuArrDb.filter(async (menuItem) => {
            if (menuItem.menu_parent_id === -1) {
                return menuItem;
            }
        });
    }

    async getMenuChildren(paramObj, parent) {
        const children = [];
        await Promise.all(paramObj.menuArr.forEach(async (child) => {
            try {
                if (child.menuParentId === parent.menuId) {
                    children.push(child);
                }
            } catch (e) {
                // this.b.err.push(e);
                // const i = {
                //     messages: this.b.err,
                //     code: 'MenuController:getMenuChildren',
                //     app_msg: ''
                // };
                // await this.b.setAppState(true, i, null);
                console.log(`MenuService::getMenuChildren()/Error: ${e}`);
            }
        }));
        return await children;
    }

    async getMenuGrChildren(paramObj, parent) {
        const children = [];
        await Promise.all(paramObj.menuArr.forEach(async (child) => {
            if (child.menuParentId === parent.menuId) {
                children.push(child);
            }
        }));
        return children;
    }

    /*
     * sets how the gui file is initialized
     * In the case using angular, we have initCmd field at the db.
     * the initCmd will be json string used to fetch dater from the back end during initialization
     */
    // async setActions(paramObj) {
    //     console.log('starting MenuService::setActions()');
    //     // console.log('MenuService::this.menuArrDb:', await this.menuArrDb)
    //     paramObj.menuArr = await paramObj.menuArr.map(async (menuItem, i) => {
    //         const actionArr = {
    //             module: paramObj.modArr.moduleName,
    //             controller: '',
    //             action: menuItem.cdObjName,
    //             fields: [],
    //             f_vals: [],
    //             args: 'guig',
    //             menu_url: null,
    //             privileged_groups: ['Everyone'],
    //         };
    //         paramObj.menuArr[i].menuAction = await actionArr;
    //         paramObj.menuArr[i].children = [];
    //         return await paramObj.menuArr;
    //     });
    // }

    async setActions(paramObj) {
        console.log('starting MenuService::setActions()');
        // console.log('MenuService::this.menuArrDb:', await this.menuArrDb)
        return await paramObj.menuArr.map(async (menuItem, i) => {
            const actionArr = {
                module: paramObj.modArr.moduleName,
                controller: '',
                action: menuItem.cdObjName,
                fields: [],
                f_vals: [],
                args: 'guig',
                menu_url: null,
                privileged_groups: ['Everyone'],
            };
            paramObj.menuArr[i].menuAction = await actionArr;
            paramObj.menuArr[i].children = [];
            return await paramObj.menuArr;
        });
    }

    async filterByAcl(req, res) {
        this.menuArrDb.forEach(async (menuItem, i) => {
            const validAcl = await this.validateMenuAcl(req, res, menuItem);
            if (validAcl === false) {
                delete (this.menuArrDb[i]); // drop menu items that are not acl compliant
            }
        });
    }

    async attachChildren(paramObj, parent, children) {
        children.forEach(async (child) => {
            const grChildren = await this.getMenuGrChildren(paramObj, child);
            grChildren.forEach(async (val) => {
                child = this.attachGrChildren(child, grChildren);
            });
            parent.children.push(child);
        });
        return parent;
    }

    async attachGrChildren(parent, grChildren) {
        parent.children = [];
        grChildren.forEach(async (grChild) => {
            parent.children.push(grChild);
        });
        return await parent;
    }

    async validateMenuAcl(req, res, newMenuItemArr) {
        const menuAction = newMenuItemArr.menuAction.action;
        const actionGrp_Arr = await this.srvGroupMember.getActionGroups(menuAction);
        const objColName = 'member_guid';
        const objArr = actionGrp_Arr;
        const userColName = 'group_guid_parent';
        const userArr = this.userGroupsArr;
        const moduleName = newMenuItemArr.moduleName;
        const rModuleGroup: any = this.srvGroup.getModuleGroup(req, res, moduleName);
        let countAcl;
        if (rModuleGroup.length > 0) {
            const moduleGroupGuid = rModuleGroup[0].group_guid;
            this.srvAcl.currentModule = moduleName;
            countAcl = this.srvAcl.getAclModuleOld(moduleGroupGuid);
        } else {
            countAcl = 0;
        }

        let validatedAcl = false;
        countAcl = 1;
        if (countAcl > 0) {
            validatedAcl = true;
        }
        return validatedAcl;
    }

    // ////////END MENU ITEMS///////////////////

    // actionRemoveModuleMenu(Request request)
    // {
    //     if (this.b.valid(request)) {
    //         ret = this.removeModuleMenu(request);
    //         affectedRows = ['affectedRows' : ret];
    //         this.b.setResult(affectedRows);
    //         sess_arr = lib\CDSession::getSessArr();
    //         this.b.setAppState(1, '', 0, sess_arr);
    //         return this.b.processResponse();
    //     } else {
    //         sess_arr = lib\CDSession::getSessArr();
    //         this.setAppState(0, '', 0, sess_arr);
    //         return this.processResponse();
    //     }
    // }

    // removeModuleMenu(Request request)
    // {
    //     moduleName = request.input('dat.f_vals.0.data.moduleName');
    //     ret = mModule::moduleByName(moduleName);
    //     module_id = ret[0].module_id;
    //     return this.removeByModuleID(module_id);
    // }

    // actionRemoveByID(Request request)
    // {
    //     if (this.b.valid(request)) {
    //         ret = this.removeByID(request);
    //         affectedRows = ['affectedRows' : ret];
    //         this.b.setResult(affectedRows);
    //         sess_arr = lib\CDSession::getSessArr();
    //         this.b.setAppState(1, '', 0, sess_arr);
    //         return this.b.processResponse();
    //     } else {
    //         sess_arr = lib\CDSession::getSessArr();
    //         this.setAppState(0, '', 0, sess_arr);
    //         return this.processResponse();
    //     }
    // }

    // removeByID(Request request)
    // {
    //     menu_id = request.input('dat.f_vals.0.data.menu_id');
    //     return this.removeByModuleID(menu_id);
    // }

    // actionRemoveByModuleID(Request request)
    // {
    //     if (this.b.valid(request)) {
    //         ret = this.removeByModuleID(request);
    //         affectedRows = ['affectedRows' : ret];
    //         this.b.setResult(affectedRows);
    //         sess_arr = lib\CDSession::getSessArr();
    //         this.b.setAppState(1, '', 0, sess_arr);
    //         return this.b.processResponse();
    //     } else {
    //         sess_arr = lib\CDSession::getSessArr();
    //         this.setAppState(0, '', 0, sess_arr);
    //         return this.processResponse();
    //     }
    // }

    // removeByModuleID(Request request)
    // {
    //     module_id = request.input('dat.f_vals.0.data.module_id');
    //     return this.removeByModuleID(module_id);
    // }

    // // /**
    // //  * {
    // //         'ctx': 'Sys',
    // //         'm': 'Moduleman',
    // //         'c': 'MenuController',
    // //         'a': 'actionGetAll',
    // //         'dat': {
    // //             'token': 'C64AC158-80F7-5AA7-D3A6-240E399B1A0A'
    // //         },
    // //         'args': null
    // //     }
    // //  */
    // actionGetAll(Request request){
    //     // dd(request.input('dat.f_vals.0.data.client_app_id'));
    //     if(request.has('dat.f_vals.0.data.client_app_id')){
    //         clientAppId = request.input('dat.f_vals.0.data.client_app_id');
    //         ret = this.getAll(clientAppId);
    //     }
    //     else{
    //         ret = this.getAll();
    //     }

    //     this.b.setResult(ret);
    //     sess_arr = lib\CDSession::getSessArr();
    //     this.b.setAppState(1, '', 0, sess_arr);
    //     return this.b.processResponse();
    // }

    // buildNestedMenu(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<any> {
    //     console.log('starting buildNestedMenu2(req, res)');
    //     return this.getMenuItem(menuId$, moduleMenuData$).pipe(
    //         map((sm: ISelectedMenu) => {
    //             const data = sm.selectedItem;
    //             // console.log('buildNestedMenu2/data:', data)
    //             const ret = {
    //                 parent: { name: data.menuLable, guid: data.menuId, children: [] },
    //                 childIds: this.getChildren(data.menuId, sm)
    //             };
    //             return ret;
    //         })
    //         , tap((m) => {
    //             // console.log('buildNestedMenu2()/tap1/m.length:', m);
    //         }),
    //         mergeMap(
    //             (parentWithChildIds) => forkJoin(
    //                 [
    //                     of(parentWithChildIds.parent),
    //                     ...parentWithChildIds.childIds.map(childId => this.buildNestedMenu(of(childId.menuId), moduleMenuData$))
    //                 ]
    //             )
    //         )
    //         , tap((m) => {
    //             // console.log('buildNestedMenu2()/tap2/m.length:', m);
    //         }),
    //         tap(([parent, ...children]) => parent.children = children),
    //         map(([parent,]) => parent)
    //         , tap((m) => {
    //             // console.log('buildNestedMenu2()/tap3/m.length:', m);
    //         }),
    //     );
    // }

    // getMenuItem(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<ISelectedMenu> {
    //     console.log('starting getMenuItem2(moduleId$, moduleMenuData$)');
    //     return moduleMenuData$
    //         .pipe(
    //             mergeMap(
    //                 (menuData: MenuViewModel[]) => forkJoin(
    //                     {
    //                         menuData: of(menuData),
    //                         menuId: menuId$
    //                     }
    //                 )
    //             )
    //             , map(
    //                 (m) => {
    //                     // console.log('getMenuItem2()/map/m:', m);
    //                     return m.menuData.filter((menuItem: MenuViewModel) => {
    //                         console.log('getMenuItem2()/filter/menuItem.menuParentId:', menuItem.menuParentId);
    //                         // console.log('getMenuItem2()/filter/m.menuItem:', m.menuItem);
    //                         if (menuItem.menuId === m.menuId) {
    //                             console.log('getMenuItem2()/filter/...matchfound:');
    //                             return menuItem;
    //                         }
    //                     });
    //                 }
    //             )
    //             , tap((m) => {
    //                 console.log('getMenuItem2()/tap1/m.length:', m.length);
    //             })
    //             , mergeMap(
    //                 (menuItem: MenuViewModel[]) => forkJoin(
    //                     {
    //                         moduleMenuData: moduleMenuData$,
    //                         selectedItem: of(menuItem[0])
    //                     }
    //                 )
    //             )
    //             , tap((m) => {
    //                 // console.log('getMenuItem2()/tap2/m.length:', m.length);
    //             }),
    //         )
    // }

    // getChildren(menuParentId: number, selectedMenu: ISelectedMenu): MenuViewModel[] {
    //     console.log('starting getChildren2(req, res)');
    //     console.log('getChildren2/menuParentId:', menuParentId)
    //     const moduleMenuData = selectedMenu.moduleMenuData;
    //     // console.log('getChildren2/moduleMenuData:', moduleMenuData)
    //     const data = moduleMenuData.filter((m) => {
    //         if (m.menuParentId === menuParentId) {
    //             return m;
    //         }
    //     });
    //     // console.log('getChildren2()/data:', data);
    //     return data;
    // }

    // getRootMenuId(moduleMenuData$: Observable<MenuViewModel[]>): Observable<number> {
    //     return moduleMenuData$
    //         .pipe(
    //             switchMap((menuData) => {
    //                 const selectedMenu = menuData.filter((m) => {
    //                     if (m.menuParentId === -1) {
    //                         return m;
    //                     }
    //                 });
    //                 // return selectedMenu$[0].menuId;
    //                 return selectedMenu;
    //             })
    //             , switchMap(x => of(x.menuId))
    //         )
    // }

    testMenu(req, res, userMenuData$: Observable<MenuViewModel[]>) {
        console.log('starting testRecursive2(req, res)');
        const moduleMenu$ = this.buildNestedMenu(this.getRootMenuId(userMenuData$), userMenuData$);
        moduleMenu$
            .subscribe((menu) => {
                console.log('modules:', menu);
                this.b.cdResp.data = menu;
                this.b.respond(res);
            })
    }

}