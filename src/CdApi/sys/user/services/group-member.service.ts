import { getManager } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { CreateIParams, IQuery, IServiceInput } from '../../base/IBase';
import { GroupMemberViewModel } from '../models/group-member-view.model';
import { GroupMemberModel } from '../models/group-member.model';
import { SessionService } from './session.service';
import { CdService } from '../../base/cd.service';
import { GroupModel } from '../models/group.model';
import { CdObjTypeModel } from '../../moduleman/models/cd-obj-type.model';
import { UserModel } from '../models/user.model';

export class GroupMemberService extends CdService {
    b: BaseService;
    cdToken: string;
    serviceModel: GroupMemberModel;
    srvSess: SessionService;

    /*
     * create rules
     */
    cRules = {
        required: [
            'memberGuid',
            'groupGuidParent',
            'cdObjTypeId',
        ],
        noDuplicate: [
            'memberGuid',
            'groupGuidParent'
        ],
    };

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new GroupMemberModel();
        this.srvSess = new SessionService();
    }

    ///////////////
    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "GroupMember",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "group-memberName": "/src/CdApi/sys/moduleman",
    //                         "group-memberTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
    //                         "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b"
    //                     }
    //                 }
    //             ],
    //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async create(req, res) {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = { serviceModel: GroupMemberModel, serviceModelInstance: this.serviceModel, docName: 'Create group-member', dSource: 1 };
            this.b.cdResp.data = await this.b.create(req, res, serviceInput);
            console.log('GroupMemberService::create()/this.b.cdResp.data:', this.b.cdResp.data)
            await this.b.setAlertMessage('new group-member created', svSess,true);
            await this.b.respond(req, res);
        } else {
            await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<GroupMemberModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async groupMemberExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: GroupMemberModel,
            docName: 'GroupMemberService::group-memberExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'groupMemberGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'groupMemberEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    update(req, res) {
        // console.log('GroupMemberService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: GroupMemberModel,
            docName: 'GroupMemberService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('GroupMemberService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.groupMemberEnabled === '') {
            q.update.groupMemberEnabled = null;
        }
        return q;
    }

    async remove(req, res) {
        //
    }

    /**
     * methods for transaction rollback
     */
    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbDelete(): number {
        return 1;
    }

    async validateCreate(req, res) {
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: GroupMemberModel,
        }
        this.b.i.code = 'GroupMemberService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                ret = true;
            } else {
                ret = false;
                this.b.setAlertMessage(`the required fields ${this.b.isInvalidFields.join(', ')} is missing`, svSess, true);
            }
        } else {
            ret = false;
            this.b.setAlertMessage(`duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`, svSess, false);
        }
        ///////////////////////////////////////////////////////////////////
        // // 2. confirm the consumerTypeGuid referenced exists
        const pl: GroupMemberModel = await this.b.getPlData(req);
        let cdObjType: CdObjTypeModel[];
        if ('cdObjTypeId' in pl) {
            cdObjType = await this.b.get(req, res, CdObjTypeModel, { where: { cdObjTypeId: pl.cdObjTypeId } })
            ret = await this.b.validateInputRefernce(`cdobj type reference is invalid`, cdObjType, svSess)
        } else {
            this.b.setAlertMessage(`groupGuidParent is missing in payload`, svSess, false);
        }
        if ('memberGuid' in pl) {
            if (cdObjType[0].cdObjTypeName === 'group') {
                const group: GroupModel[] = await this.b.get(req, res, GroupModel, { where: { groupGuid: pl.memberGuid } });
                ret = await this.b.validateInputRefernce(`member reference is invalid`, group, svSess)
            }
            if (cdObjType[0].cdObjTypeName === 'user') {
                const user: UserModel[] = await this.b.get(req, res, UserModel, { where: { userGuid: pl.memberGuid } });
                if (user.length > 0) {
                    this.b.setPlData(req, { key: 'userIdMember', value: user[0].userId });
                    ret = await this.b.validateInputRefernce(`member reference is invalid`, user, svSess)
                } else {
                    ret = await this.b.validateInputRefernce(`member reference is invalid`, user, svSess)
                }
            }
        } else {
            console.log('moduleman/GroupMemberService::validateCreate()/11')
            this.b.setAlertMessage(`memberGuid is missing in payload`, svSess, false);
        }
        if ('groupGuidParent' in pl) {
            const q: IQuery = { where: { groupGuid: pl.groupGuidParent } };
            const r: GroupModel[] = await this.b.get(req, res, GroupModel, q);
            ret = await this.b.validateInputRefernce(`parent reference is invalid`, r, svSess)
        } else {
            this.b.setAlertMessage(`groupGuidParent is missing in payload`, svSess, false);
        }
        if (this.b.err.length > 0) {
            ret = false;
        }
        return ret;
    }

    getGroupMember(req, res) {
        const q = this.b.getQuery(req);
        console.log('GroupMemberService::getGroupMember/f:', q);
        const serviceInput = {
            serviceModel: GroupMemberViewModel,
            docName: 'GroupMemberService::getGroupMember$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('GroupMemberService::read$()/r:', r)
                    this.b.i.code = 'GroupMemberController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('GroupMemberService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    getGroupMemberCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('GroupMemberService::getGroupMemberCount/q:', q);
        const serviceInput = {
            serviceModel: GroupMemberViewModel,
            docName: 'GroupMemberService::getGroupMemberCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'GroupMemberController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    delete(req, res) {
        const q = this.b.getQuery(req);
        console.log('GroupMemberService::delete()/q:', q)
        const serviceInput = {
            serviceModel: GroupMemberModel,
            docName: 'GroupMemberService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }
        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    getPals(cuid) {
        return [{}];
    }

    getGroupMembers(moduleGroupGuid) {
        return [{}];
    }

    getMembershipGroups(cuid) {
        return [{}];
    }

    async isMember(req, res, params): Promise<boolean> {
        console.log('starting GroupMemberService::isMember(req, res, data)');
        const entityManager = getManager();
        const opts = { where: params };
        const result = await entityManager.count(GroupMemberModel, opts);
        if (result > 0) {
            return true;
        } else {
            return false;
        }
    }

    getActionGroups(menuAction) {
        return [{}];
    }

    async getUserGroups(ret) {
        //
    }

}