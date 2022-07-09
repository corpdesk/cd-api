import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { GroupMemberModel } from '../models/group-member.model';
import { GroupMemberService } from '../services/group-member.service';

export class GroupMemberController extends CdController {
    b: BaseService;
    svGroupMember: GroupMemberService;

    constructor() {
        super();
        this.b = new BaseService();
        this.svGroupMember = new GroupMemberService();
    }

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
    //                         "companyName": "/src/CdApi/sys/moduleman",
    //                         "companyTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
    async Create(req, res) {
        try {
            await this.svGroupMember.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'GroupMemberController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "GroupMember",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"companyId": 45763}
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Get(req, res) {
        try {
            await this.svGroupMember.getGroupMember(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'GroupMemberController:Get');
        }
    }

    // async GetType(req, res) {
    //     try {
    //         await this.svGroupMember.getGroupMemberTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'GroupMemberController:Get');
    //     }
    // }

    // /** Pageable request:
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "select":["moduleId","moduleGuid"],
    //                         "where": {},
    //                         "take": 5,
    //                         "skip": 1
    //                         }
    //                 }
    //             ],
    //             "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async GetCount(req, res) {
        try {
            await this.svGroupMember.getGroupMemberCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "GroupMember",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "companyName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "companyId": 45762
    //                         }
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Update(req, res) {
        console.log('GroupMemberController::Update()/01');
        try {
            console.log('GroupMemberController::Update()/02');
            await this.svGroupMember.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "GroupMember",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"companyId": 45763}
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Delete(req, res) {
        try {
            await this.svGroupMember.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

}