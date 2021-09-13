import {
    Observable, map, mergeMap, of, distinct, bufferCount, share, forkJoin
} from 'rxjs';
import { GroupMemberService } from '../../user/services/group-member.service';
import { BaseService } from '../../base/base.service';
import { AclModel } from '../models/acl.model';
import { DocModel } from '../models/doc.model';
import { IAclCtx, ICdRequest } from '../../base/IBase';
import { ModuleService } from './modules.service';
import { SessionService } from '../../user/services/session.service';
import { ConsumerService } from './consumer.service';
import { AclUserViewModel } from '../models/acluserview.model';
import { AclModuleViewModel } from '../models/aclmoduleview.model';
import { AclModuleMemberViewModel } from '../models/aclmodulememberview.model';

export class AclService {
    b: BaseService;
    nestedMembers = [];
    aclRet;
    cuid;
    arrDoc;
    moduleIndexName;
    staticModel;
    validated;
    aclCtx;
    currentModule;
    srvSess;
    srvConsumer;
    consumerGuid;
    consumer;
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

    constructor() {
        this.b = new BaseService();
        this.srvSess = new SessionService();
        this.srvConsumer = new ConsumerService();
    }

    // async init(req, res, aclCtx) {
    //     this.aclCtx = aclCtx;
    //     this.consumerGuid = await this.srvSess.getConsumerGuid(req);
    //     this.consumer = await this.srvConsumer.getConsumerByGuid(req, res, this.consumerGuid);
    // }

    // async getAclModuleOld(moduleGroupGuid) {
    //     /*
    //      * get_group_children(check if child is current user)
    //      * for each child, get children(check if child is current user)
    //      */
    //     const srvGroupMember = new GroupMemberService();
    //     const rModuleMembers = srvGroupMember.getGroupMembers(moduleGroupGuid);
    //     this.nestedMembers = this.nestedMembers.concat(rModuleMembers);
    //     rModuleMembers.forEach((rMember: any) => {
    //         if (this.aclRet) { // prevent continuation of nested cycles after postive acl is found
    //             return;
    //         }
    //         if (this.memberIsGroup(rMember)) {
    //             this.getAclModuleOld(rMember.memberGuid);
    //         }
    //         if (this.memberIsUser(rMember)) {
    //             if (this.memberIsCurrentUser(rMember)) {
    //                 this.aclRet = true;
    //             }
    //         }
    //     });
    //     return this.aclRet;
    // }

    // async memberIsGroup(rMember) {
    //     let memberIsGroup = false;
    //     if (rMember.cdObjTypeId === 10) {
    //         memberIsGroup = true;
    //     } else {
    //         memberIsGroup = false;
    //     }
    //     return memberIsGroup;
    // }

    // memberIsUser(rMember) {
    //     let memberIsGroup = false;
    //     if (rMember.cdObjTypeId === 9) {
    //         memberIsGroup = true;
    //     } else {
    //         memberIsGroup = false;
    //     }
    //     return memberIsGroup;
    // }

    // async memberIsCurrentUser(r_member) {
    //     let memberIsCurrentUser = false;
    //     if (r_member.userIdMember === this.cuid) {
    //         memberIsCurrentUser = true;
    //     } else {
    //         memberIsCurrentUser = false;
    //     }
    //     return memberIsCurrentUser;
    // }

    // async assignACL(req, res, aclView) {
    //     this.arrDoc.docName = 'Assign ACL';
    //     this.arrDoc.docTypeId = 104; // This should be queried from doc::getDocTypeByName
    //     if (this.validateAssignACL(req, res, aclView)) {
    //         /*
    //          * NB:
    //          * 1. arrDoc is assigned from this.request_args
    //          * 2. this.moduleIndexName : The primary key for the table for this controller (this.moduleIndexName)
    //          */
    //         this.moduleIndexName = 'acl_id';
    //         this.staticModel.transactDoc(this.arrDoc, this.moduleIndexName);
    //     } else {
    //         //
    //     }
    // }

    // async validateAssignACL(req, res, aclView) {
    //     this.validated = true;
    //     if (this.cuid === 1000) {
    //         this.b.err.push('guest is anonimous');
    //         this.validated = false;
    //     }
    //     /*
    //      * 1. Confirm acl is valid
    //      *      - check that the given group exists
    //      *      - acl mechanism should be the one to stop anon user
    //      */

    //     /*
    //      * 2. Avoid double entry
    //      */

    //     if (this.isMultiEntry(req, res, aclView)) {
    //         this.b.err.push('this group_guid is already associated with the object this.cd_obj_guid');
    //         this.validated = false;
    //     }

    //     return this.validated;
    // }

    // async isMultiEntry(req, res, aclView: any) {
    //     let ret = false;
    //     // const result = this.static_model.select('acl', 'group_guid = 'this.group_guid' and cd_obj_guid = 'this.cd_obj_guid'', '', 'count(acl_id) as count');
    //     const serviceInput = {
    //         serviceModel: AclModel,
    //         docModel: DocModel,
    //         docName: 'AclService: Assign Acl',
    //         cmd: {
    //             action: 'count',
    //             filter: { where: { cd_obj_guid: aclView.cdObjGuid, group_guid: aclView.groupGuid } }
    //         },
    //         dSource: 1,
    //     }
    //     const count = await this.b.read(req, res, serviceInput);

    //     if (count > 0) {
    //         ret = true;
    //     }
    //     return ret;
    // }

    // /*
    //  * 1. Get groups that have acl access to a given 'action'
    //  * 2. Get groups where current user belongs
    //  * 3. Intersect between 1&2
    //  * 4. If the intersection count is greater than 1, then user has ACL privileges.
    //  *
    //  *  select group_guid from acl_view where cd_obj_guid = '765ECE32-5DF7-0378-2E90-35D1C61681FB'
    // INTERSECT
    // select group_guid_parent as group_guid  from membership_view where member_guid = 'fe5b1a9d-df45-4fce-a181-65289c48ea00';
    //  */

    // async validateUserACL(cuid) {
    //     const srvGroupMember = new GroupMemberService();
    //     const userMembership = await srvGroupMember.getMembershipGroups(cuid);
    // }

    // /*
    //  * get groups that have acl right over a given action,controller or module
    //  * sql statement: 'select distinct group_guid,group_name from acl_view where cd_obj_guid = '765ECE32-5DF7-0378-2E90-35D1C61681FB''
    //  * input: action_guid //counld be action, controller or any cd_obj
    //  * output: array of groups that can execute the action
    //  */

    // async getCdObjACL(req, res, cdObjGuid) {
    //     // stmt = 'select distinct group_guid,group_name from acl_view where cd_obj_guid = 'cd_obj_guid'';
    //     const serviceInput = {
    //         serviceModel: AclModel,
    //         docModel: DocModel,
    //         docName: 'AclService: getCdObjACL',
    //         cmd: {
    //             action: 'count',
    //             filter: { where: { cd_obj_guid: cdObjGuid } }
    //         },
    //         dSource: 1,
    //     }
    //     return await this.b.read(req, res, serviceInput);
    // }

    // // setValidationState() {
    // //     if (this.validated) {
    // //         this.success = true;
    // //     } else {
    // //         this.success = false;
    // //     }
    // // }

    // async syncAclData(req, res) {
    //     const pl: ICdRequest = this.b.getPlData(req);
    //     this.arrDoc = pl.args;
    //     this.arrDoc.doc_from = this.cuid;
    // }

    async getAclModule(req, res, params) {
        console.log('AclService::getAclModule(req, res,params)/params:', params)
        const result$ = of(
            this.aclUser$(req, res, { consumerGuid: params.consumerGuid }).pipe(map((u) => { return { useRoles: u } })),
            this.aclModule$(req, res).pipe(map((u) => { return { modules: u } })),
            this.aclModuleMembers$(req, res, params).pipe(map((u) => { return { moduleParents: u } }))
        ).pipe(
            mergeMap((obs$: any) => obs$),
            bufferCount(3)
        );

        result$
            .subscribe((r: any) => {
                const modules = r.filter((m) => {
                    if (typeof (m.modules) === 'object') {
                        return m
                    }
                })

                const moduleParents = r.filter(m => {
                    if (typeof (m.moduleParents) === 'object') {
                        return m
                    }
                })

                console.log('modules[0]:', modules[0]);
                console.log('moduleParents[0]:', moduleParents[0]);
                const matchedObjects = (a, b) => JSON.stringify(a) === JSON.stringify(b);
                const intersect = modules[0].modules.filter((module) => {
                    return moduleParents[0].moduleParents.filter((mp) => {
                        if (JSON.stringify(mp) === JSON.stringify(module)) {
                            return module;
                        }
                    })
                })
                this.b.cdResp = intersect;
                this.b.respond(res);
            });
    }

    aclUser$(req, res, params): Observable<any> {
        this.consumerGuid = params.consumerGuid;

        const serviceInput = {
            serviceModel: AclUserViewModel,
            docName: 'rxTestService::aclUser$',
            cmd: {
                action: 'find',
                filter: { where: {} } // do not filter here. all filters are managed by acl
            },
            dSource: 1,
        }
        const user$ = this.b.read$(req, res, serviceInput)
            .pipe(
                share() // to avoid repeated db round trips
            )
        const isRoot = u => u.userId === 1001;

        const isConsumerRoot = u => u.consumerResourceTypeId === 4
            && u.consumerGuid === this.consumerGuid
            && u.objGuid === params.currentUser.userGuid;

        const isConsumerTechie = u => u.consumerResourceTypeId === 5
            && u.consumerGuid === this.consumerGuid
            && u.objGuid === params.currentUser.userGuid;

        const isConsumerUser = u => u.consumerResourceTypeId === 6
            && u.consumerGuid === this.consumerGuid
            && u.objGuid === params.currentUser.userGuid;

        const isRoot$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isRoot)
                    return ret;
                })
                , distinct()
            );

        const isConsumerRoot$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isConsumerRoot)
                    return ret;
                })
                , distinct()
            );

        const isConsumerTechie$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isConsumerTechie)
                    return ret;
                })
                , distinct()
            );

        const isConsumerUser$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isConsumerUser)
                    return ret;
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

    aclModuleMembers$(req, res, params): Observable<any> {
        const isModuleMember = m => m.memberGuid === params.currentUser.userGuid;

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
                    return mArr;

                })
                , distinct()
            );
    }
}