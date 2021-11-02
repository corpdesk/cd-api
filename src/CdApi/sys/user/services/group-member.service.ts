import { getManager } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { IServiceInput } from '../../base/IBase';
import { GroupMemberViewModel } from '../models/group-member-view.model';
import { GroupMemberModel } from '../models/group-member.model';
// import { SessionModel } from '../models/session.model';
import { ISessResp } from '../../base/IBase';
import { SessionService } from './session.service';

export class GroupMemberService{
    b: BaseService;
    srvSess: SessionService;

    /*
     * create rules
     */
    cRules = {
        required: [
            'member_guid',
            'group_guid_parent',
            'cd_obj_type_id',
        ],
        noDuplicate: [
            'member_guid',
            'group_guid_parent'
        ],
    };

    constructor(){
        this.b = new BaseService();
        this.srvSess = new SessionService();
    }

    async create(req, res): Promise<void> {
        if (await this.validateCreate(req, res)) {
            const groupMember = new GroupMemberModel();
            const serviceInput = {
                serviceInstance: this,
                serviceModel: GroupMemberModel,
                serviceModelInstance: groupMember,
                docName: 'Register GroupMember',
                dSource: 1,
            }
            const regResp: any = await this.b.create(req, res, serviceInput);
            this.b.cdResp = await regResp;
            const r = await this.b.respond(res);
        } else {
            const i = {
                messages: this.b.err,
                code: 'GroupMemberService:create',
                app_msg: ''
            };
            await this.b.setAppState(false, i, null);
            const r = await this.b.respond(res);
        }
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        return await this.b.read(req, res, serviceInput);
    }

    getPals(cuid){
        return [{}];
    }

    getGroupMembers(moduleGroupGuid){
        return [{}];
    }

    getMembershipGroups(cuid){
        return [{}];
    }

    async isMember(req, res, params): Promise<boolean>{
        console.log('starting GroupMemberService::isMember(req, res, data)');
        const entityManager = getManager();
        const opts = { where: params};
        const result = await entityManager.count(GroupMemberModel,opts);
        // console.log('GroupMember::isMember()/params:', params);
        // console.log('GroupMember::isMember()/result:', result);
        if(result > 0){
            return true;
        } else {
            return false;
        }
    }

    getActionGroups(menuAction){
        return [{}];
    }

    async getUserGroups(ret){
        //
    }

    async validateCreate(req, res) {
        const params = {
            controllerInstance: this,
            model: GroupMemberModel,
        }
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                return true;
            } else {
                this.b.err.push(`you must provide ${JSON.stringify(this.cRules.required)}`);
                return false;
            }
        } else {
            this.b.err.push(`duplication of ${JSON.stringify(this.cRules.noDuplicate)} not allowed`);
            return false;
        }
    }

}