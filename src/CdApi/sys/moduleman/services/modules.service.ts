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
    }

    getModulesUserData$(req, res, cUser: UserModel): Observable<any> {
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

}