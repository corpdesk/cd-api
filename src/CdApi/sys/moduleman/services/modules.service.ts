import { defer, Observable, of, switchMap, from, forkJoin, iif } from 'rxjs';
import { pipe, map, filter, tap, mergeMap } from 'rxjs';
import * as Lá from 'lodash';
import { BaseService } from '../../base/base.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
import { NotificationService } from '../../comm/services/notification.service';
import { MemoService } from '../../comm/services/memo.service';
import { CalendarService } from '../../scheduler/services/calendar.services';
import { GroupMemberService } from '../../user/services/group-member.service';
import { ConsumerService } from '../../moduleman/services/consumer.service';
import { MenuService } from './menu.service';
import { AclService } from './acl.service';
import { GroupService } from '../../user/services/group.service';
import { ModuleModel } from '../models/module.model';
import { IAclCtx } from '../../base/IBase';
import { UserModel } from '../../user/models/user.model';

export class ModuleService {

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
    constructor() {
        this.b = new BaseService();
        // this.srvSess = new SessionService();
        // this.srvUser = new UserService();
        // this.srvMemo = new MemoService();
        // this.srvNotif = new NotificationService();
        // this.srvCalnd = new CalendarService();
        // this.srvGroupMember = new GroupMemberService();
        // this.srvConsumer = new ConsumerService();
    }

    getModulesUserData$(req, res, cUser: UserModel): Observable<any> {
        // console.log('starting getModulesUserData$(req, res, currentUser: UserModel)');
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
        // const cuid = await this.srvSess.getCuid(req);
        const cguid = this.srvConsumer.getConsumerGuid(req);
        // console.log('getModulesUserData$(req, res, currentUser: UserModel)/cguid:', cguid);
        // console.log('ModuleService::getModulesUserData$(req, res, currentUser: UserModel)/001');
        const clientConsumer$ = this.srvConsumer.getConsumerByGuid$(req, res, cguid);
        // console.log('ModuleService::getModulesUserData$(req, res, currentUser: UserModel)/002');
        /*1*/const allowedModules$ = this.getAclModule$(req, res, {currentUser: cUser,consumerGuid: cguid});
        // console.log('ModuleService::getModulesUserData$(req, res, currentUser: UserModel)/003');
        // console.log('ModuleService::getModulesUserData()/modules.length:', modules.length)
        // const userdata = this.srvSess.getCurrentUser(req);
        // console.log('ModuleService::getModulesUserData()/userdata:', userdata);

        // /*2*/const menuData$ = this.srvMenu.getAclMenu(req, res, {modules$: allowedModules$, modulesCount: 11});
        const menuData$ = allowedModules$
            .pipe(
                mergeMap(
                    (am: any[]) => iif(
                        () => {
                            // console.log('ModuleService::getModulesUserData$()/am:', am);
                            return am.length > 0
                        },
                        this.srvMenu.getAclMenu(req, res, { modules$: allowedModules$, modulesCount: am.length }),
                        []
                    )
                )
            )
        // console.log('ModuleService::getModulesUserData$(req, res, currentUser: UserModel)/004');
        // console.log('ModuleService::getModulesUserData()/menudata:', await menudata);
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
            // notifData: notifdata,
            // notifSumm: notifsumm,
            // memoSumm: memosumm,
            // calndSumm: calndsumm,
            // contacts: userContacts,
            // pals: userPals,
            // aCoid: acoid,
        });
        // console.log('ModuleService::getModulesUserData$(req, res, currentUser: UserModel)/005');
        // const regResp: any = await this.b.create(req, res, serviceInput);
        // this.sendEmailNotification(req, res);

        // this.b.cdResp.data = await result;
        // const r = await this.b.respond(req, res, null);
        return result$;
    }

    // consumerGuid(cdToken) {
    //     return '';
    // }

    getModules$(req, res): Observable<any> {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getAll',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        return defer(() => {
            return this.b.read(req, res, serviceInput)
        });
    }

    /**
     *
     * @param req
     * @param res
     * @param f // filter eg { where: {} }
     * @returns
     */
    getModules(req, res, f): Observable<any> {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getAll',
            cmd: {
                action: 'find',
                filter: f
            },
            dSource: 1,
        }
        return defer(() => {
            return this.b.read(req, res, serviceInput)
        });
    }

    /**
     * return modules where user is a member
     * aclCtx = [member_guid,parent_guid,consumer_id]
     */
    async getModuleAcl(req, res) {
        console.log('starting ModuleService::getModuleAcl(req, res, uid)');
        const srvAcl = new AclService();
        const cuid = this.srvSess.getCuid(req);
        let u: any = await this.srvSess.getCurrentUser(req);
        let memberguid;
        if (u) {
            memberguid = u.userGuid;
        } else {
            // switch to anon user
            u = await this.srvUser.getUserByID(req, res, cuid);
            memberguid = u.userGuid;
        }

        // const modules = await this.getAll(req, res,);
        const modules$ = await this.getAll$(req, res,);
        // console.log('ModuleService::getModuleAcl(req, res)/modules.length:', modules.length);
        const aclModules = [];
        let aclCtx: IAclCtx = {
            memberGuid: null,
            moduleGroupGuid: null,
            consumerId: await this.srvConsumer.getConsumerGuid(req),
            moduleName: null,
            currentUser: u,
            module: null,
        };
        await this.srvAcl.init(req, res, aclCtx);
        const am = [];
        /**
         * for each module check if user is a member
         */
        // const allowedModules = await modules.filter(async (mod: any, i: number) => {
        //     const modulename = mod.moduleName;
        //     const grouptypeid = 2; // module
        //     const groupParams = {
        //         groupName: modulename, // module group is named after the module name
        //         groupTypeId: grouptypeid
        //     };
        //     // const m: any = await this.srvGroup.getGroupByName(req, res, groupParams);
        //     const grpData = await this.srvGroup.getModuleGroup(req, res, modulename);
        //     // console.log('ModuleService::getModuleAcl(req, res)/grpData:', grpData);
        //     // console.log('grpData[0].groupGuid:', grpData[0].groupGuid)
        //     // if (m[0]) {
        //     // const parentguid = m[0].groupGuid;
        //     if (grpData.length > 0 && mod.enabled === true) {
        //         aclCtx = {
        //             memberGuid: memberguid,
        //             moduleGroupGuid: grpData[0].groupGuid,
        //             consumerId: await this.srvConsumer.getConsumerGuid(req),
        //             moduleName: modulename,
        //             currentUser: u,
        //             module: mod,
        //         };
        //         // await this.srvAcl.init(req, res, aclCtx);
        //         if (await this.srvAcl.userHasAccess(req, res, aclCtx)) {
        //             am.push(mod);
        //             console.log(console.log('ModuleService::getModuleAcl(req, res)/allowed:', modulename));
        //             return mod;
        //         } else{
        //             console.log(console.log('ModuleService::getModuleAcl(req, res)/Mod_not_allowed:', modulename));
        //             return null;
        //         }
        //     }

        // });
        // console.log('ModuleService::getModuleAcl(req, res)/allowedModules:', await allowedModules);
        // console.log('ModuleService::getModuleAcl(req, res)/am.length:', am.length);
        // return await allowedModules;

        const allowedModules$ = modules$
            .pipe(
                tap(async (mod) => {
                    const modulename = mod.moduleName;
                    const grouptypeid = 2; // module
                    const groupParams = {
                        groupName: modulename, // module group is named after the module name
                        groupTypeId: grouptypeid
                    };
                    const m: any = await this.srvGroup.getGroupByName(req, res, groupParams);
                    const grpData = await this.srvGroup.getModuleGroup(req, res, modulename);
                    // console.log('grpData[0].groupGuid:', grpData[0].groupGuid)
                    if (m[0]) {
                        const parentguid = m[0].groupGuid;
                        aclCtx = {
                            memberGuid: memberguid,
                            moduleGroupGuid: grpData[0].groupGuid,
                            consumerId: await this.srvConsumer.getConsumerGuid(req),
                            moduleName: modulename,
                            currentUser: u,
                            module: mod,
                        };
                        // await this.srvAcl.init(req, res, aclCtx);
                        if (await this.srvAcl.userHasAccess(req, res, aclCtx) && mod.enabled === true) {
                            return mod;
                        }
                    }
                }),
                filter(mod => mod.enabled),
                filter((mod) => {
                    if (this.srvAcl.userHasAccess(req, res, aclCtx)) {
                        return mod;
                    }
                })
            );
        allowedModules$.subscribe((mod) => {
            console.log('ModuleService::getModuleAcl(req, res)/mod.length:', mod.length);
        })
        return allowedModules$;
    }

    getAclModule$(req, res, params): Observable<any> {
        this.consumerGuid = params.consumerGuid;
        // console.log('ModuleService::getAclModule$()/params.consumerGuid:', params.consumerGuid);
        // console.log('starting ModuleService::getAclModule$(req, res)')
        return forkJoin({
            // unfilteredModules: this.getAll$(req, res).pipe(map((m) => { return m })), // for isRoot
            userRoles: this.srvAcl.aclUser$(req, res, params).pipe(map((m) => { return m })),
            consumerModules: this.srvAcl.aclModule$(req, res).pipe(map((m) => { return m })),
            moduleParents: this.srvAcl.aclModuleMembers$(req, res,params).pipe(map((m) => { return m }))
        })
            .pipe(
                map((acl: any) => {
                    // Based on acl result, return appropirate modules
                    // console.log('ret/001:')
                    // console.log('ModuleService::getAclModule$()/acl.userRoles:', acl.userRoles);
                    if (acl.userRoles.isConsumerRoot.length > 0) { // if userIsConsumerRoot then return all consumerModules
                        // console.log('ModuleService::getAclModule$()/ret/002:')
                        // console.log('ModuleService::getAclModule$(req, res, params)/isConsumerRoot');
                        // console.log('ModuleService::getAclModule$(req, res, params)/acl.consumerModules', acl.consumerModules);
                        return acl.consumerModules;
                    }
                    else if (acl.userRoles.isConsumerUser.length > 0) { // if user is registered as consumer user then filter modules
                        // console.log('ModuleService::getAclModule$()/ret/003:')
                        // console.log('ModuleService::getAclModule$()/acl.moduleParents:', acl.moduleParents);
                        // console.log('ModuleService::getAclModule$(req, res, params)/isConsumerUser');
                        return this.b.intersect(acl.consumerModules, acl.moduleParents, 'moduleGuid');
                    }
                    else {  // if is neither of the abobe, return zero modules
                        // console.log('ModuleService::getAclModule$()/ret/004:')
                        // console.log('ModuleService::getAclModule$(req, res, params)/isGuest');
                        return [];
                    }
                    // console.log('ret/005:')
                    // console.log('ret:', ret);
                    // return ret;
                })
            );
    }

    async aclMenu(req, res, modules) {
        console.log('starting aclMenu(req, res, modules)');
        // console.log('modules.length:', modules.length);
        // console.log('ModulesController::aclMenu/modules:', modules);
        return await this.srvMenu.getMenu(req, res, modules);
    }

    async getModuleByName(req, res, mName) {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getModuleByName',
            cmd: {
                action: 'find',
                filter: { where: { moduleName: mName } }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }

    async getIDByName(moduleName) {
        return [{}];
    }

    async getAll(req, res,) {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getAll',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }

    async getAll$(req, res,) {
        const serviceInput = {
            serviceModel: ModuleModel,
            docName: 'ModuleService::getAll',
            cmd: {
                action: 'find',
                filter: { where: {} }
            },
            dSource: 1,
        }
        return await this.b.read$(req, res, serviceInput);
    }

}