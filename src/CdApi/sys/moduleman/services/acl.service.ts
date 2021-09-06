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
    // srvGroup: GroupService;
    // srvGroupMember: GroupMemberService;
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

    async init(req, res, aclCtx) {
        this.aclCtx = aclCtx;
        this.consumerGuid = await this.srvSess.getConsumerGuid(req);
        this.consumer = await this.srvConsumer.getConsumerByGuid(req, res, this.consumerGuid);
    }

    async getAclModuleOld(moduleGroupGuid) {
        /*
         * get_group_children(check if child is current user)
         * for each child, get children(check if child is current user)
         */
        const srvGroupMember = new GroupMemberService();
        const rModuleMembers = srvGroupMember.getGroupMembers(moduleGroupGuid);
        this.nestedMembers = this.nestedMembers.concat(rModuleMembers);
        rModuleMembers.forEach((rMember: any) => {
            if (this.aclRet) { // prevent continuation of nested cycles after postive acl is found
                return;
            }
            if (this.memberIsGroup(rMember)) {
                this.getAclModuleOld(rMember.memberGuid);
            }
            if (this.memberIsUser(rMember)) {
                if (this.memberIsCurrentUser(rMember)) {
                    this.aclRet = true;
                }
            }
        });
        return this.aclRet;
    }

    async memberIsGroup(rMember) {
        let memberIsGroup = false;
        if (rMember.cdObjTypeId === 10) {
            memberIsGroup = true;
        } else {
            memberIsGroup = false;
        }
        return memberIsGroup;
    }

    memberIsUser(rMember) {
        let memberIsGroup = false;
        if (rMember.cdObjTypeId === 9) {
            memberIsGroup = true;
        } else {
            memberIsGroup = false;
        }
        return memberIsGroup;
    }

    async memberIsCurrentUser(r_member) {
        let memberIsCurrentUser = false;
        if (r_member.userIdMember === this.cuid) {
            memberIsCurrentUser = true;
        } else {
            memberIsCurrentUser = false;
        }
        return memberIsCurrentUser;
    }

    async assignACL(req, res, aclView) {
        this.arrDoc.docName = 'Assign ACL';
        this.arrDoc.docTypeId = 104; // This should be queried from doc::getDocTypeByName
        if (this.validateAssignACL(req, res, aclView)) {
            /*
             * NB:
             * 1. arrDoc is assigned from this.request_args
             * 2. this.moduleIndexName : The primary key for the table for this controller (this.moduleIndexName)
             */
            this.moduleIndexName = 'acl_id';
            this.staticModel.transactDoc(this.arrDoc, this.moduleIndexName);
        } else {
            //
        }
    }

    async validateAssignACL(req, res, aclView) {
        this.validated = true;
        if (this.cuid === 1000) {
            this.b.err.push('guest is anonimous');
            this.validated = false;
        }
        /*
         * 1. Confirm acl is valid
         *      - check that the given group exists
         *      - acl mechanism should be the one to stop anon user
         */

        /*
         * 2. Avoid double entry
         */

        if (this.isMultiEntry(req, res, aclView)) {
            this.b.err.push('this group_guid is already associated with the object this.cd_obj_guid');
            this.validated = false;
        }

        return this.validated;
    }

    async isMultiEntry(req, res, aclView: any) {
        let ret = false;
        // const result = this.static_model.select('acl', 'group_guid = 'this.group_guid' and cd_obj_guid = 'this.cd_obj_guid'', '', 'count(acl_id) as count');
        const serviceInput = {
            serviceModel: AclModel,
            docModel: DocModel,
            docName: 'AclService: Assign Acl',
            cmd: {
                action: 'count',
                filter: { where: { cd_obj_guid: aclView.cdObjGuid, group_guid: aclView.groupGuid } }
            },
            dSource: 1,
        }
        const count = await this.b.read(req, res, serviceInput);

        if (count > 0) {
            ret = true;
        }
        return ret;
    }

    /*
     * 1. Get groups that have acl access to a given 'action'
     * 2. Get groups where current user belongs
     * 3. Intersect between 1&2
     * 4. If the intersection count is greater than 1, then user has ACL privileges.
     *
     *  select group_guid from acl_view where cd_obj_guid = '765ECE32-5DF7-0378-2E90-35D1C61681FB'
    INTERSECT
    select group_guid_parent as group_guid  from membership_view where member_guid = 'fe5b1a9d-df45-4fce-a181-65289c48ea00';
     */

    async validateUserACL(cuid) {
        const srvGroupMember = new GroupMemberService();
        const userMembership = await srvGroupMember.getMembershipGroups(cuid);
    }

    /*
     * get groups that have acl right over a given action,controller or module
     * sql statement: 'select distinct group_guid,group_name from acl_view where cd_obj_guid = '765ECE32-5DF7-0378-2E90-35D1C61681FB''
     * input: action_guid //counld be action, controller or any cd_obj
     * output: array of groups that can execute the action
     */

    async getCdObjACL(req, res, cdObjGuid) {
        // stmt = 'select distinct group_guid,group_name from acl_view where cd_obj_guid = 'cd_obj_guid'';
        const serviceInput = {
            serviceModel: AclModel,
            docModel: DocModel,
            docName: 'AclService: getCdObjACL',
            cmd: {
                action: 'count',
                filter: { where: { cd_obj_guid: cdObjGuid } }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }

    // setValidationState() {
    //     if (this.validated) {
    //         this.success = true;
    //     } else {
    //         this.success = false;
    //     }
    // }

    async syncAclData(req, res) {
        const pl: ICdRequest = this.b.getPlData(req);
        this.arrDoc = pl.args;
        this.arrDoc.doc_from = this.cuid;
    }



    /**
     * verify that the user is a member of a object group
     * eg user is member of 'booking module' group.
     *
     * acl considerations
     * 1. root users
     * 2. public apps
     * 3. system apps
     * 4. controller level access
     * 5. action level access
     * 6. consumer(active company) filtering
     *
     *  aclCtx = [
     *       'member_guid' => member_guid,
     *       'parent_guid' => parent_guid,
     *       'consumer_guid' => consumer_guid,
     *   ];
     *
     * consumerMember = mGroupMember::isMember(member_guid,parent_guid);
     */
    async userHasAccess(req, res, aclCtx: IAclCtx) {
        console.log('starting AclService::userHasAccess(req, res, cuid)');
        console.log('AclService::userHasAccess(req, res, aclCtx)/001');
        // console.log('AclService::userHasAccess(req, res, aclCtx)/aclCtx:', aclCtx);
        const cuid = aclCtx.currentUser.userId;
        /**
         * exempt consumer root users
         * check if user is in consumer root group
         */
        // let ret = false;
        if (await this.isRoot(cuid)) {
            return true;
        }

        /**
         * exempt public modules
         * - can be accessed by anon/guest
         * anon/guest does not require login
         */
        console.log('AclService::userHasAccess(req, res, cuid)/002');
        if (await this.isPublicMod(req, res, aclCtx)) {
            return true;
        }

        /**
         * filter consumer by policy
         * check if module can be accessed by the current consumer
         */
        console.log('AclService::userHasAccess(req, res, cuid)/003');
        if (await this.consumerModuleAccess(req, res, aclCtx)) {
            // ret = true;

            /**
             * exempt root user
             */
            console.log('AclService::userHasAccess(req, res, cuid)/004');
            if (await this.isConsumerRoot(cuid)) {
                return true;
            }
            /**
             * exempt web-master users
             * check if user is in web-master group
             * load all modules for allowed by consumer
             */
            console.log('AclService::userHasAccess(req, res, cuid)/005');
            if (await this.isWebMaster()) {
                return true;
            }

            /**
             * filter by module group
             * check if user is in module group
             */
            console.log('AclService::userHasAccess(req, res, cuid)/006');
            if (await this.moduleMember(req, res, aclCtx)) {
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }
    }

    // isRoot(cuid) {
    //     if (cuid === 1001) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    async isRoot(cuid) {
        if (cuid === 1001) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * user is registered as consumer root
     * - has full access to all consumer resources
     * - to implement
     * @returns
     */
    async isConsumerRoot(cuid) {
        return false;
    }

    /**
     * if module is public: can be used by anon/guest
     */
    async isPublicMod(req, res, aclCtx): Promise<boolean> {
        console.log('starting isPublicMod(req, res)');
        const srvModule = new ModuleService();
        const moduleName = aclCtx.moduleName;
        const moduleData: any = await srvModule.getModuleByName(req, res, moduleName);
        // console.log('AclService::isPublicMod()/aclCtx:', aclCtx);
        console.log('AclService::isPublicMod()/moduleName:', moduleName);
        // console.log('AclService::isPublicMod()/moduleData:', moduleData);
        if (moduleData[0].isPublic) {
            console.log('AclService::isPublicMod()/ret:true');
            return true;
        } else {
            console.log('AclService::isPublicMod()/ret:false');
            return false;
        }
    }

    /**
     * filter consumer by policy
     * check if module can be accessed by the current consumer
     * consumer is the company under which the current user is accessing the facility
     * consumer identification must be available in the request
     */
    async consumerModuleAccess(req, res, aclCtx: IAclCtx) {
        console.log('starting consumerModuleAccess(req, res, aclCtx: IAclCtx)');
        // const srvSess = new SessionService();
        const srvConsumer = new ConsumerService();
        // const srvModule = new ModuleService();
        const consrGuid = await srvConsumer.getConsumerGuid(req);
        console.log('consumerModuleAccess(req, res, aclCtx: IAclCtx)/consrGuid:', consrGuid);
        // const consumerId = srvConsumer.getIDByGuid(consumerGuid);
        // const moduleName = this.aclCtx.module_name;
        // const moduleId = srvModule.getIDByName(moduleName);

        const params = {
            objGuid: aclCtx.module.moduleGuid,
            cdObjTypeId: 3, // module
            consumerGuid: consrGuid // moduleGuid
        }
        console.log('consumerModuleAccess(req, res, aclCtx: IAclCtx)/params1:', params);
        const result = await srvConsumer.isConsumerResource(req, res, params);
        console.log('consumerModuleAccess(req, res, aclCtx: IAclCtx)/params2:', params);
        console.log('consumerModuleAccess(req, res, aclCtx: IAclCtx)/result:', result);
        return result;
    }

    isWebMaster() {
        return false;
    }

    /**
     * check if user is member of consumer group
     */
    async consumerResource(req, res, module) {
        console.log('starting AclService::consumerResource(req, res, cuid)');
        console.log('AclService::consumerResource(req, res, cuid)/001');
        const params = {
            consumerId: this.consumer[0].consumerId,
            cdObjTypeId: 3, // module
            consumerResourceGuid: module.moduleGuid // moduleGuid
        }
        if (await this.srvConsumer.isConsumerResource(req, res, params)) {
            console.log('AclService::consumerResource(req, res, cuid)/002');
            return true;
        } else {
            console.log('AclService::consumerResource(req, res, cuid)/003');
            return false;
        }
    }

    async moduleMember(req, res, aclCtx: IAclCtx) {
        console.log('starting moduleMember(req, res)');
        console.log('AclService::moduleMember(req, res)/aclCtx.module.moduleName:', aclCtx.module.moduleName);
        const userId = aclCtx.currentUser.userId;
        const pGuid = aclCtx.moduleGroupGuid;
        const srvGroupMember = new GroupMemberService();
        const params = {
            userIdMember: userId,
            groupGuidParent: pGuid
        }
        console.log('AclService::moduleMember(req, res)/params:', params);
        return await srvGroupMember.isMember(req, res, params);
    }

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
        // console.log('starting AclService::aclUser$(req, res)')
        // console.log('AclService::aclUser$(req, res, params)/params:', params)
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

        const isConsumerTechie = u =>   u.consumerResourceTypeId === 5
                                        && u.consumerGuid === this.consumerGuid
                                        && u.objGuid === params.currentUser.userGuid;

        const isConsumerUser = u => u.consumerResourceTypeId === 6
                                    && u.consumerGuid === this.consumerGuid
                                    && u.objGuid === params.currentUser.userGuid;

        const isRoot$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isRoot)
                    // console.log('isRoot$/ret:', ret);
                    // console.log('isRoot$/ret.length:', ret.length);
                    return ret;
                })
                , distinct()
            );

        const isConsumerRoot$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isConsumerRoot)
                    // console.log('isConsumerRoot$/ret.length:', ret.length);
                    // console.log('isConsumerRoot$/u:', u);
                    // console.log('isConsumerRoot$/this.consumerGuid:', this.consumerGuid);
                    // console.log('isConsumerRoot$/ret:', ret);
                    return ret;
                })
                , distinct()
            );

        const isConsumerTechie$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isConsumerTechie)
                    // console.log('isConsumerTechie$/ret:', ret);
                    // console.log('isConsumerTechie$/ret.length:', ret.length);
                    return ret;
                })
                , distinct()
            );

        const isConsumerUser$ = user$
            .pipe(
                map((u) => {
                    const ret = u.filter(isConsumerUser)
                    // console.log('isConsumerUser$/ret', ret);
                    console.log('isConsumerUser$/ret.length:', ret.length);
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
        // console.log('AclService::starting aclModuleMembers$(req, res, params)')
        // const isModuleMember = m => m.memberGuid === '86faa6df-358b-4e32-8a66-d133921da9fe';
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
                    // console.log('aclModuleMembers/mArr:', mArr);
                    return mArr;

                })
                , distinct()
            );
    }
}