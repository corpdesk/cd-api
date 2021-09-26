import { flatMap, flatten, merge, partition, takeWhile } from 'lodash';
import * as Lá from 'lodash';
import { mergeAll } from 'ramda';
import {
    filter, Observable, bindCallback, map, mergeMap, concatMap, of, from,
    distinct, toArray, buffer, throttleTime, expand, bufferCount,
    last, combineLatestAll, finalize, defer, iif, switchMap, tap, mapTo, share, forkJoin, take
} from 'rxjs';
import { serialize } from 'v8';
import { BaseService } from '../../../sys/base/base.service';
import { AclModuleMemberViewModel } from '../../../sys/moduleman/models/aclmodulememberview.model';
import { AclModuleViewModel } from '../../../sys/moduleman/models/aclmoduleview.model';
import { AclUserViewModel } from '../../../sys/moduleman/models/acluserview.model';
import { ModuleModel } from '../../../sys/moduleman/models/module.model';
import { ModuleService } from '../../../sys/moduleman/services/module.service';
import { GroupService } from '../../../sys/user/services/group.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { UserService } from '../../../sys/user/services/user.service';

export class RxTestService {
    b: BaseService;
    srvModule: ModuleService;
    srvGroup: GroupService;
    srvSession: SessionService;
    cuid;
    consumerGuid = 'B0B3DA99-1859-A499-90F6-1E3F69575DCD';
    // consumerGuid = 'AFFDA1E9-9EB0-E4BB-773B-14D14A477CE0';
    isRoot;
    isNotRoot;
    isConsumerRoot;
    isConsumerUser;
    isPublicModule = m => m.moduleIsPublic;
    trimmedModule = m => {
        return {
            moduleGuid: m.moduleGuid,
            moduleEnabled: m.moduleEnabled,
            moduleIsPublic: m.moduleIsPublic,
            moduleId: m.moduleId,
            moduleName: m.moduleName,
            isSysModule: m.isSysModule,
            moduleTypeId: m.moduleTypeId,
            groupGuid: m.groupGuid,
        };
    }

    a$ = of([1, 2, 3, 4, 5, 6]);
    b$ = of(['a', 'b', 'c', 'd']);
    c$ = of([{ x: 'x' }, { y: 'y', z: 'z' }]);

    constructor() {
        this.b = new BaseService();
        this.srvGroup = new GroupService();
        this.srvSession = new SessionService();
        this.srvModule = new ModuleService();
    }

    getModules$(req, res) {
        return this.getAll$(req, res)
            .pipe(
                map((m) => {
                    return m.filter((module) => {
                        if (module.enabled === true) {
                            return module;
                        }
                    })
                })
            )
        // .subscribe(
        //     (result: any) => {
        //         console.log('result.length:', result.length);
        //         console.log('result:', result);

        //         // this.b.cdResp = result;
        //         // this.b.respond(res);
        //         // modules.push(result);
        //     }
        //     ,(err) => {
        //         console.log('Error', err);
        //         this.b.err.push(err.toString());
        //         const i = {
        //             messages: this.b.err,
        //             code: 'RxTestService:create',
        //             app_msg: ''
        //         };
        //         this.b.setAppState(false, i, null);
        //         // this.b.respond(res);
        //     },
        //     () => {
        //         console.log('request completed.');
        //         this.b.err.push('request completed');
        //         // console.log('modules.length:', modules.length);
        //         const i = {
        //             messages: this.b.err,
        //             code: 'RxTestService:create',
        //             app_msg: 'request completed.'
        //         };
        //         this.b.setAppState(false, i, null);
        //         this.b.respond(res);
        //     }
        // );
    }

    getAll$(req, res): Observable<any> {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getAll',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput);
    }

    getConsumerModules$(req, res): Observable<any> {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getAll',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput);
    }

    /**
     * Adopted
     * preset the appropriate userGuid and consumerGuid
     * @param req
     * @param res
     */
    getAclModule2(req, res) {

        const acl$ = forkJoin({
            // unfilteredModules: this.getAll$(req, res).pipe(map((m) => { return m })),
            userRoles: this.aclUser$(req, res).pipe(map((m) => { return m })),
            consumerModules: this.aclModule$(req, res).pipe(map((m) => { return m })),
            moduleParents: this.aclModuleMembers$(req, res).pipe(map((m) => { return m }))
        })
            .pipe(
                map((acl: any) => {
                    if (acl.userRoles.isConsumerRoot.length > 0) {
                        return acl.consumerModules;
                    }
                    else if (acl.userRoles.isConsumerUser.length > 0) {
                        return this.b.intersect(acl.consumerModules, acl.moduleParents, 'moduleGuid');;
                    }
                    else {
                        return [{}];
                    }
                })
            );

        acl$
            .subscribe((modules: any) => {
                console.log('modules:', modules);
                this.b.cdResp.data = modules;
                this.b.respond(res);
            })
    }

    // getAclModule1(req, res) {
    //     const result$ = of(
    //         this.aclUser$(req, res).pipe(map((u) => { return { useRoles: u } })),
    //         this.aclModule$(req, res).pipe(map((u) => { return { modules: u } })),
    //         this.aclModuleMembers$(req, res).pipe(map((u) => { return { moduleParents: u } }))
    //     ).pipe(
    //         mergeMap((obs$: any) => obs$),
    //         bufferCount(3)
    //     );

    //     result$
    //         .subscribe((r: any) => {

    //             const modules = r.filter((m) => {
    //                 if (typeof (m.modules) === 'object') {
    //                     return m
    //                 }
    //             })

    //             const moduleParents = r.filter(m => {
    //                 if (typeof (m.moduleParents) === 'object') {
    //                     return m
    //                 }
    //             })

    //             const result: any = this.b.intersect(modules[0].modules, moduleParents[0].moduleParents, 'moduleGuid');
    //             console.log('Lá/result:', result);

    //             this.b.cdResp = result;
    //             this.b.respond(res);
    //         });

    // }

    aclUser$(req, res): Observable<any> {
        const serviceInput = {
            serviceModel: AclUserViewModel,
            docName: 'rxTestService::aclUser$',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        const user$ = this.b.read$(req, res, serviceInput)
            .pipe(
                share() // to avoid repeated db round trips
            )
        const isRoot = u => u.userId === 1001;
        const isConsumerRoot = u => u.consumerResourceTypeId === 4 && u.consumerGuid === this.consumerGuid;
        const isConsumerTechie = u => u.consumerResourceTypeId === 5 && u.consumerGuid === this.consumerGuid;
        const isConsumerUser = u => u.consumerResourceTypeId === 6 && u.consumerGuid === this.consumerGuid;

        const isRoot$ = user$
            .pipe(
                map((u) => {
                    return u.filter(isRoot)
                })
                , distinct()
            );

        const isConsumerRoot$ = user$
            .pipe(
                map((u) => {
                    return u.filter(isConsumerRoot)
                })
                , distinct()
            );

        const isConsumerTechie$ = user$
            .pipe(
                map((u) => {
                    return u.filter(isConsumerTechie)
                })
                , distinct()
            );

        const isConsumerUser$ = user$
            .pipe(
                map((u) => {
                    return u.filter(isConsumerUser)
                })
                , distinct()
            );

        return forkJoin(
            {
                isRoot: isRoot$.pipe(map((u) => { return u })),
                isConsumerRoot: isConsumerRoot$.pipe(map((u) => { return u })),
                isConsumerUser: isConsumerUser$.pipe(map((u) => { return u }))
            }
        )
        // .pipe(
        //     mergeMap((obs$: any) => obs$),
        //     bufferCount(3)
        // );
    }

    aclModule$(req, res) {
        const isEnabled = m => m.moduleEnabled;
        const isPublicModule = m => m.moduleIsPublic;
        const isConsumerResource = m => m.moduleIsPublic || m.consumerGuid === this.consumerGuid
        const serviceInput = {
            serviceModel: AclModuleViewModel,
            docName: 'rxTestService::aclModule$',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput)
            .pipe(
                share()
            )
            .pipe(
                map((m) => {
                    return m.filter(isEnabled)
                }),
                map((m) => {
                    return m.filter(isConsumerResource)
                })
                , distinct()
            )
            .pipe(
                map(modules => {
                    // console.log('aclModuleMembers/modules:', modules);
                    const mArr = [];
                    modules.forEach((m) => {
                        m = {
                            moduleGuid: m.moduleGuid,
                            moduleEnabled: m.moduleEnabled,
                            moduleIsPublic: m.moduleIsPublic,
                            moduleId: m.moduleId,
                            moduleName: m.moduleName,
                            isSysModule: m.isSysModule,
                            moduleTypeId: m.moduleTypeId,
                            groupGuid: m.groupGuid,
                        };
                        mArr.push(m);
                    });
                    // console.log('aclModuleMembers/mArr:', mArr);
                    return mArr;

                })
                , distinct()
            )
    }

    aclModuleMembers$(req, res): Observable<any> {
        const isModuleMember = m => m.memberGuid === 'fe5b1a9d-df45-4fce-a181-65289c48ea00';

        const serviceInput = {
            serviceModel: AclModuleMemberViewModel,
            docName: 'rxTestService::aclUser$',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        const modules$ = this.b.read$(req, res, serviceInput)
            .pipe(
                share() // to avoid repeated db round trips
            )
        return modules$
            .pipe(
                map((m) => {
                    if (this.isPublicModule) {
                        return m; // waive filtering if the module is public
                    } else {
                        return m.filter(isModuleMember)
                    }
                })
                , distinct()
            )
            .pipe(
                map(modules => {
                    // console.log('aclModuleMembers/modules:', modules);
                    const mArr = [];
                    modules.forEach((m) => {
                        m = {
                            moduleGuid: m.moduleGuid,
                            moduleEnabled: m.moduleEnabled,
                            moduleIsPublic: m.moduleIsPublic,
                            moduleId: m.moduleId,
                            moduleName: m.moduleName,
                            isSysModule: m.isSysModule,
                            moduleTypeId: m.moduleTypeId,
                            groupGuid: m.groupGuid,
                        };
                        mArr.push(m);
                    });
                    // console.log('aclModuleMembers/mArr:', mArr);
                    return mArr;

                })
                , distinct()
            );
    }

    deferStream() {
        const source = defer(() => {
            const stream = (x, y) => x + y;
            let lastState = { x: 'er', y: 'pt' };
            const steam1$ = this.oddNumers$();
            return steam1$.pipe(
                switchMap(request => stream(request, lastState)),
                tap((state: any) => lastState = state)
            );
        });
    }

    oddNumers$() {
        return of([1, 3, 5, 7]);
    }

    conditionalStream$(req, res) {
        return this.aclUser$(req, res)
            .pipe(
                mergeMap(
                    u => iif(
                        this.isRoot, // if isRoot == true
                        this.aclRoot$(req, res), // ... then use the aclRoot$ stream
                        this.aclUser$(req, res) // ...else check the access level for the user
                    )
                )
            )
    }

    aclRoot$(req, res) {
        return this.getAll$(req, res);
    }

    aclConsumerRoot$(req, res) {
        return this.getConsumerModules$(req, res);
    }

    aclConsumerUser$(req, res) {
        return this.getConsumerModules$(req, res);
    }

    switchFromPromise(req, res) {
        const promiseModule = (aclUser) => {
            const f = { where: {} };
            return this.srvModule.getModules(req, res, f);
        }
        const source$ = this.aclUser$(req, res);
        source$
            .pipe(
                switchMap(
                    aclUser => promiseModule(aclUser)
                )
            )
    }

    mergePromises(req, res): Observable<any> {
        return of(
            this.a$.pipe(map((x) => { return { numbers: x } })),
            this.b$.pipe(map((x) => { return { chars: x } })),
            this.c$.pipe(map((x) => { return { objects: x } })))
            .pipe(
                mergeMap((obs$: any) => obs$),
                bufferCount(3)
            );
        /**
         *
         * Expected Result:
         *
         *  [
         *       { numbers:[ 1, 2, 3, 4, 5, 6 ] },
         *       { chars:[ 'a', 'b', 'c', 'd' ] },
         *       { objects:[ { x: 'x' }, { y: 'y', z: 'z' } ] }
         *   ]
         */
    }

    async getUsers(req, res) {
        const serviceInput = {
            serviceModel: UserService,
            docName: 'GroupService::getGroupByName',
            cmd: {
                action: 'find',
                filter: { where: { userName: 'goremo' } }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }

    mergeMultiple() {
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

        /**
         *
         * Expected Result:
         *
         *  [
         *       [ 1, 2, 3, 4, 5, 6 ],
         *       [ 'a', 'b', 'c', 'd' ],
         *       [ { x: 'x' }, { y: 'y', z: 'z' } ]
         *   ]
         */
    }

    doRecursive() {
        const source$ = of(2);
        const example = source$.pipe(
            // recursively call supplied function
            expand(val => {
                // 2,3,4,5,6
                console.log(`Passed value: ${val}`);
                // 3,4,5,6
                return of(1 + val);
            }),
            // call 5 times
            take(5)
        );
    }

}