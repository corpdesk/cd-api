/**
 * Recursive Tutorial
 * Ref: https://dev.to/krumpet/getting-a-recursive-data-structure-asynchronously-with-rxjs-46b9
 */
import FlatToNested from 'flat-to-nested';
import {
    Observable, map, mergeMap, of, from, expand, bufferCount, tap, forkJoin, take, switchMap, pipe
} from 'rxjs';
import * as Lá from 'lodash';
import { BaseService } from '../../../sys/base/base.service';
import { ModuleService } from '../../../sys/moduleman/services/modules.service';
import { GroupService } from '../../../sys/user/services/group.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { MenuViewModel } from '../../../sys/moduleman/models/menu-view.model';
import { userMenuData } from './userMenuData';
import { userMenuData$ } from './userMenuData$';
import { allowedModules$ } from './allowedModules$';
import { flatMap, merge, zip } from 'lodash';
import { AclModuleViewModel } from '../../../sys/moduleman/models/aclmoduleview.model';
import { IAllowedModules, IMenuRelations, ISelectedMenu } from '../../../sys/base/IBase';

interface Folder {
    id: number;
    name: string;
    children: Folder[];
}

interface ServerData {
    id: number;
    name: string;
    children: number[];
}

interface FlatData {
    guid: string;
    name: string;
    children: number[];
}

const results: ServerData[] = [
    { id: 0, name: 'first', children: [1, 2, 3] },
    { id: 1, name: 'second', children: [4] },
    { id: 2, name: 'third', children: [] },
    { id: 3, name: 'fourth', children: [] },
    { id: 4, name: 'fifth', children: [] }
];

const myFlatData: FlatData[] = [
    { guid: '0', name: 'first', children: [1, 2, 3] },
    { guid: '1', name: 'second', children: [4] },
    { guid: '2', name: 'third', children: [] },
    { guid: '3', name: 'fourth', children: [] },
    { guid: '4', name: 'fifth', children: [] }
];

// interface SelectedMenu {
//     moduleMenuData?: MenuViewModel[],
//     selectedItem: MenuViewModel,
//     selectedId?: number,
// }

interface Module {
    moduleName: string;
    moduleId: number;
    menu: Menu[];
}

interface Menu {
    moduleId: number;
    menuName: string;
    menuData: any[];
}

// interface IAllowedModules{
//     modules$: Observable<AclModuleViewModel[]>;
//     modulesCount: number;
// }

// interface IMenuRelations{
//     menuParent: MenuViewModel;
//     menuChildren: MenuViewModel[];
// }

const modules$: Observable<Module[]> = of([
    {
        moduleName: 'a',
        moduleId: 0,
        menu: []
    },
    {
        moduleName: 'b',
        moduleId: 1,
        menu: []
    },
    {
        moduleName: 'c',
        moduleId: 2,
        menu: []
    },
]);

const menu$: Observable<Menu[]> = of([
    {
        moduleId: 0,
        menuName: 'a-a',
        menuData: [
            {
                itemId: 0,
                itemName: 'd'
            },
            {
                itemId: 1,
                itemName: 'e'
            }
        ]
    },
    {
        moduleId: 2,
        menuName: 'a-b',
        menuData: [
            {
                itemId: 0,
                itemName: 'f'
            },
            {
                itemId: 1,
                itemName: 'g'
            }
        ]
    }
]);

export class RxRecursiveService {
    b: BaseService;
    srvModule: ModuleService;
    srvGroup: GroupService;
    srvSession: SessionService;
    cuid;
    a$ = of([1, 2, 3, 4, 5, 6]);
    b$ = of(['a', 'b', 'c', 'd']);
    c$ = of([{ x: 'x' }, { y: 'y', z: 'z' }]);

    constructor() {
        this.b = new BaseService();
        this.srvGroup = new GroupService();
        this.srvSession = new SessionService();
        this.srvModule = new ModuleService();
    }

    getFromServer(id: number): Observable<ServerData> {
        return of(results[id]);
    }

    getRecursive(id: number): Observable<Folder> {
        return this.getFromServer(id).pipe(
            map(data => ({
                parent: { name: data.name, id: data.id, children: [] },
                childIds: data.children
            })),
            mergeMap(
                parentWithChildIds => forkJoin(
                    [
                        of(parentWithChildIds.parent),
                        ...parentWithChildIds.childIds.map(childId => this.getRecursive(childId))
                    ]
                )
            ),
            tap(([parent, ...children]) => parent.children = children),
            map(([parent,]) => parent)
        );
    }

    /**
     * Adopted
     */
    getMenuItem(menuId: number): Observable<MenuViewModel> {
        // transform menu.children to empty array
        // const flat: any = userMenuData.map((m:MenuViewModel) => {
        //     m.children = [];
        // });

        // extract selected menuItem from moduleMenuData
        const menuItem = userMenuData.filter((m: MenuViewModel) => {
            if (m.menuId === menuId) {
                return m;
            }
        });
        return of(menuItem[0]);
    }

    getMenuItem2(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<ISelectedMenu> {
        // console.log('starting getMenuItem2(moduleId$, moduleMenuData$)');
        return moduleMenuData$
            .pipe(
                mergeMap(
                    (menuData: MenuViewModel[]) => forkJoin(
                        {
                            menuData: of(menuData),
                            menuId: menuId$
                        }
                    )
                )
                , map(
                    (m) => {
                        // console.log('getMenuItem2()/map/m:', m);
                        return m.menuData.filter((menuItem: MenuViewModel) => {
                            // console.log('getMenuItem2()/filter/menuItem.menuParentId:', menuItem.menuParentId);
                            // console.log('getMenuItem2()/filter/m.menuItem:', m.menuItem);
                            if (menuItem.menuId === m.menuId) {
                                // console.log('getMenuItem2()/filter/...matchfound:');
                                return menuItem;
                            }
                        });
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

    // /**
    //  * Adopted
    //  * @param req
    //  * @param res
    //  */
    // buildNestedMenu(menuId: number): Observable<any> {
    //     return this.getMenuItem(menuId).pipe(
    //         map((data: MenuViewModel) => {
    //             const ret = {
    //                 parent: { name: data.menuLabel, guid: data.menuId, children: [] },
    //                 childIds: this.getChildren(menuId)
    //             };
    //             return ret;
    //         }),
    //         mergeMap(
    //             parentWithChildIds => forkJoin(
    //                 [
    //                     of(parentWithChildIds.parent),
    //                     ...parentWithChildIds.childIds.map(childId => this.buildNestedMenu(childId.menuId))
    //                 ]
    //             )
    //         ),
    //         tap(([parent, ...children]) => parent.children = children),
    //         map(([parent,]) => parent)
    //     );
    // }

    buildNestedMenu2(menuId$: Observable<number>, moduleMenuData$: Observable<MenuViewModel[]>): Observable<any> {
        // console.log('starting buildNestedMenu2(req, res)');
        return this.getMenuItem2(menuId$, moduleMenuData$).pipe(
            map((sm: ISelectedMenu) => {
                const data = sm.selectedItem;
                // console.log('buildNestedMenu2/data:', data)
                const ret: IMenuRelations = {
                    menuParent: { menuLabel: data.menuLabel, menuId: data.menuId, children: [] },
                    // childIds: this.getChildren2(data.menuId, sm)
                    menuChildren: this.getChildren2(data.menuId, sm)
                };
                return ret;
            })
            , tap((m) => {
                // console.log('buildNestedMenu2()/tap1/m.length:', m);
            }),
            mergeMap(
                (parentWithChildIds) => forkJoin(
                    [
                        of(parentWithChildIds.menuParent),
                        ...parentWithChildIds.menuChildren.map(childMenu => this.buildNestedMenu2(of(childMenu.menuId), moduleMenuData$))
                    ]
                )
            )
            , tap((m) => {
                // console.log('buildNestedMenu2()/tap2/m.length:', m);
            }),
            tap(([parent, ...children]) => parent.children = children),
            map(([parent,]) => parent)
            , tap((m) => {
                // console.log('buildNestedMenu2()/tap3/m.length:', m);
            }),
        );
    }

    /**
     * Adopted
     */
    getChildren(menuParentId): MenuViewModel[] {
        const data = userMenuData.filter((m) => {
            // console.log('getChildren()/data:', data);
            if (m.menuParentId === menuParentId) {
                return m;
            }
        });
        // console.log('getChildren()/data:', data);
        return data;
    }

    getChildren2(menuParentId: number, selectedMenu: ISelectedMenu): MenuViewModel[] {
        // console.log('starting getChildren2(req, res)');
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

    // /**
    //  * Adopted
    //  * @param req
    //  * @param res
    //  */
    // testRecursive(req, res) {
    //     const moduleMenu$ = this.buildNestedMenu(this.getRootMenuId(userMenuData));
    //     moduleMenu$
    //         .subscribe((menu) => {
    //             console.log('modules:', menu);
    //             this.b.cdResp.data = menu;
    //             this.b.respond(res);
    //         })
    // }

    testRecursive2(req, res) {
        console.log('starting testRecursive2(req, res)');
        const moduleMenu$ = this.buildNestedMenu2(this.getRootMenuId2(userMenuData$), userMenuData$);
        moduleMenu$
            .subscribe((menu) => {
                console.log('modules:', menu);
                this.b.cdResp.data = menu;
                this.b.respond(res);
            })
    }

    /**
     * Adopted
     * @param moduleMenuData : menu data for a given module
     * @returns
     */
    getRootMenuId(moduleMenuData: MenuViewModel[]): number {
        const selectedMenu = moduleMenuData.filter((m) => {
            if (m.menuParentId === -1) {
                return m;
            }
        });
        return selectedMenu[0].menuId;
    }

    getRootMenuId2(moduleMenuData$: Observable<MenuViewModel[]>): Observable<number> {
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

    menuModules$(req, res) {
        return of([
            {
                consumerId: 33,
                cdObjTypeId: 3,
                cdObjId: 43183,
                consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
                moduleId: 44,
                moduleGuid: '8q3khu',
                moduleName: 'comm',
                moduleIsPublic: null,
                isSysModule: 1,
                moduleEnabled: 1,
                groupGuid: 'bdd82014-50bf-4ecc-9f01-543246cb8e32',
                moduleTypeId: 1
            },
            {
                consumerId: 33,
                cdObjTypeId: 3,
                cdObjId: 6370,
                consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
                moduleId: 45,
                moduleGuid: '-dkkm6',
                moduleName: 'user',
                moduleIsPublic: 1,
                isSysModule: 1,
                moduleEnabled: 1,
                groupGuid: '-dkkm6',
                moduleTypeId: 1
            },
            {
                consumerId: 33,
                cdObjTypeId: 3,
                cdObjId: 48560,
                consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
                moduleId: 110,
                moduleGuid: '3C33747C-A25C-5FC3-07DD-21200B5B0384',
                moduleName: 'scheduler',
                moduleIsPublic: 0,
                isSysModule: null,
                moduleEnabled: 1,
                groupGuid: null,
                moduleTypeId: 1
            },
            {
                consumerId: 33,
                cdObjTypeId: 3,
                cdObjId: 63987,
                consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
                moduleId: 195,
                moduleGuid: 'C620F2D8-A0AE-0406-7DB7-7ECE806722AA',
                moduleName: 'cd_geo',
                moduleIsPublic: 1,
                isSysModule: 0,
                moduleEnabled: 1,
                groupGuid: '0C4E937A-B00B-A4E0-F6BC-48DC372E1AF8',
                moduleTypeId: 1
            },
            {
                consumerId: 33,
                cdObjTypeId: 3,
                cdObjId: 92519,
                consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
                moduleId: 357,
                moduleGuid: 'BE1E6690-0DA0-F35B-1E93-7140CFD27C09',
                moduleName: 'InteRact',
                moduleIsPublic: null,
                isSysModule: 1,
                moduleEnabled: 1,
                groupGuid: '36C2CF24-65E5-8410-3E7C-8ACECC591BC2',
                moduleTypeId: 1
            }
        ]);
    }

    // attachMenu$(req, res) {
    //     const fieldName = 'menu';
    //     return this.menuModules$(req, res)
    //         .pipe(
    //             mergeMap((modules) => {
    //                 for (const i in modules) {
    //                     if (modules[i]) {
    //                         modules[i][fieldName] = this.getRecursive(0);
    //                     }
    //                 }
    //                 const menu$ = from(modules)
    //                     .pipe(
    //                         mergeMap((x: any) => {
    //                             console.log('x1:', x);
    //                             return x.menu;
    //                         }),
    //                         bufferCount(1)
    //                     );
    //                 const m$ = from(modules).pipe(bufferCount(1));
    //                 return forkJoin({
    //                     menu: menu$,
    //                     modules: m$
    //                 })
    //             })
    //         )
    //         .pipe(
    //             mergeMap((m: any) => {
    //                 delete m.modules.menu;
    //                 console.log('m1:', m);
    //                 return of(m);
    //             }),
    //             bufferCount(5)
    //         )
    //         .subscribe((menu: any) => {
    //             console.log('menu:', menu);
    //             this.b.cdResp.data = menu;
    //             this.b.respond(res);
    //         })
    // }

    mergeMultiple1() {
        const observables = [this.a$, this.b$, this.c$];
        return new Observable(subscriber => {
            for (const i of observables) {
                subscriber.next(i);
            }
            subscriber.complete();
        }).pipe(
            mergeMap((x: any) => x),
            bufferCount(3)
        )
    }

    getModuleMenu$(req, res, moduleData): Observable<MenuViewModel[]> {
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

    setObservableToArray(req, res) {
        const myArr = [];
        const modules = [
            {
                moduleGuid: 'ueov',
                moduleName: 'mod1',
                menu: null
            },
            {
                moduleGuid: 'ncvfn',
                moduleName: 'mod2',
                menu: null
            }
        ];
        return of(modules)
            .pipe(
                map((module: any) => {
                    module.menu = this.getObservables$(req, res, module);
                })
            )
    }

    getObservables$(req, res, module) {
        of([{
            menuGuid: 'kdlsp',
            menuName: 'm1',
            children: null
        }]);
    }

    expandMenu2() {
        const source = of(2);
        const example = source.pipe(
            expand(val => {
                console.log(`Passed value: ${val}`);
                return of(1 + val);
            }),
            take(5)
        );
    }

    flat2Nested(req, res) {
        const flat = [
            { id: 111, parent: 11 },
            { id: 11, parent: 1 },
            { id: 12, parent: 1 },
            { id: 1 }
        ];
        const flat2Nested = new FlatToNested({
            id: 'id',
            parent: 'parent',
            children: 'children'
        });
        const nested = flat2Nested.convert(flat);
        console.log('nested:', nested);
        this.b.cdResp.data = nested;
        this.b.respond(res);
    }

    flat2Nested2(req, res) {
        const flat: any = userMenuData.map((m) => {
            m.children = [];
        });
        const flat2Nested = new FlatToNested({
            id: 'menuId',
            parent: 'menuParentId',
            children: 'children'
        });
        const nested = flat2Nested.convert(flat);
        console.log('nested:', nested);
        this.b.cdResp.data = nested;
        this.b.respond(res);
    }

    // menu(req, res) {
    //     const allowedModules = this.menuModules$(req, res)
    //         .pipe(
    //             map(m => m),
    //             tap((m) => {
    //                 // console.log('menu(req, res)/from map: m:', m)
    //             }),
    //             switchMap((modules) => {
    //                 return Lá.map(modules, (module: MenuViewModel) => {
    //                     console.log('menu(req, res)/from switchMap/module.menuId:', module);
    //                     const moduleMenuData = this.getModuleMenu$(req, res, module);
    //                     return this.buildNestedMenu(this.getRootMenuId(moduleMenuData));
    //                 });
    //             })
    //             , tap((m) => {
    //                 console.log('menu(req, res)/from switchMap/m:', m)
    //             }),
    //             bufferCount(5)
    //         )
    //         .pipe(
    //             mergeMap((menuList$: any) => {
    //                 return forkJoin(menuList$)
    //             })
    //         )
    //         .subscribe((m: any) => {
    //             console.log('subscribe/m:', m);
    //             this.b.cdResp.data = m;
    //             this.b.respond(res);
    //         });
    // }

    // menu2(req, res) {
    //     const allowedModules = this.menuModules$(req, res)
    //         .pipe(
    //             map(m => m),
    //             tap((m) => {
    //                 // console.log('menu(req, res)/from map: m:', m)
    //             }),
    //             switchMap((modules) => {
    //                 return Lá.map(modules, (module: MenuViewModel) => {
    //                     console.log('menu(req, res)/from switchMap/module.menuId:', module);
    //                     const moduleMenuData$ = this.getModuleMenu$(req, res, module);
    //                     return this.buildNestedMenu(this.getRootMenuId(moduleMenuData$));
    //                 });
    //             })
    //             , tap((m) => {
    //                 console.log('menu(req, res)/from switchMap/m:', m)
    //             }),
    //             bufferCount(5)
    //         )
    //         .pipe(
    //             mergeMap((menuList$: any) => {
    //                 return forkJoin(menuList$)
    //             })
    //         )
    //         .subscribe((m: any) => {
    //             console.log('subscribe/m:', m);
    //             this.b.cdResp.data = m;
    //             this.b.respond(res);
    //         });
    // }

    // menuCollection1(req, res) {
    //     allowedModules$
    //         .pipe(
    //             mergeMap((m) => {
    //                 return m.map(mod => {
    //                     const moduleMenuData$ = this.getModuleMenu$(req, res, mod);
    //                     return forkJoin(
    //                         {
    //                             module: of(mod),
    //                             // menu: this.buildNestedMenu2(this.getRootMenuId2(userMenuData$), userMenuData$).pipe(mergeMap(x => x))// getModuleMenu$(req, res, moduleData)
    //                             menu: this.buildNestedMenu2(this.getRootMenuId2(moduleMenuData$), moduleMenuData$).pipe(mergeMap(x => x))
    //                         }
    //                     ).pipe(
    //                         map(items => items.menu)
    //                     )
    //                 })
    //             })
    //             , bufferCount(3)
    //         )
    //         .subscribe((m: any) => {
    //             console.log('subscribe/m:', m);
    //             this.b.cdResp.data = m;
    //             this.b.respond(res);
    //         });

    // }

    // menuCollection2(req, res) {
    //     const res$ = forkJoin({
    //         modules: modules$,
    //         menu: menu$,
    //     }).pipe(
    //         map(({ menu, modules }) => {
    //             const getMenu = id => {
    //                 return menu.filter(m => m.moduleId === id)
    //             }
    //             return modules.map(m => ({
    //                 ...m,
    //                 menu: getMenu(m.moduleId)
    //             }));
    //         })
    //     )
    //         .subscribe((m: any) => {
    //             console.log('subscribe/modules:', m);
    //             this.b.cdResp.data = m;
    //             this.b.respond(res);
    //         });
    // }

    /**
     * Adopted
     * @param req
     * @param res
     * @param params
     */
    menuCollection3(req, res, params: IAllowedModules) {
        // allowedModules$
        params.modules$
            .pipe(
                mergeMap((m) => {
                    return m.map(mod => {
                        const moduleMenuData$ = this.getModuleMenu$(req, res, mod);
                        return forkJoin({
                            modules: allowedModules$,
                            menu: this.buildNestedMenu2(this.getRootMenuId2(moduleMenuData$), moduleMenuData$),
                        }).pipe(
                            map(({ menu, modules }) => {
                                console.log('menu:', menu);
                                return menu;
                            })
                        )
                    })
                })
                ,mergeMap((m) => {
                    return m.pipe(
                        map((modules) => {
                            console.log('modules:', modules);
                            return modules;
                        })
                    )
                })
                , bufferCount(params.modulesCount)
            )
            .subscribe((m: any) => {
                console.log('subscribe/m:', m);
                this.b.cdResp.data = m;
                this.b.respond(res);
            });

    }

    // tesCollection(req, res) {
    //     const res$ = forkJoin({
    //         parents: parents$,
    //         children: children$,
    //     }).pipe(
    //         map(({ children, parents }) => {
    //             const getChildrenOfParent = id => {
    //                 return children.filter(child => child.parentId === id)
    //             }
    //             return parents.map(parent => ({
    //                 ...parent,
    //                 children: getChildrenOfParent(parent.parentId)
    //             }));
    //         })
    //     )
    //         .subscribe((p: any) => {
    //             console.log('subscribe/parents:', p);
    //             this.b.cdResp.data = p;
    //             this.b.respond(res);
    //         });

    // }

    // getChild$(parentId: number): Observable<Child> {
    //     return children$
    //         .pipe(
    //             mergeMap(c => c.filter(child => {
    //                 if (child.parentId === parentId) {
    //                     return child;
    //                 }
    //             }))
    //         )
    // }



}