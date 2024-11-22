
import { BaseService } from '../../../sys/base/base.service';
import { CdController } from '../../../sys/base/cd.controller';
import { CoopMemberService } from '../services/coop-member.service';

export class CoopMemberController extends CdController {
    b: BaseService;
    svCoopMember: CoopMemberService;

    constructor() {
        super();
        this.b = new BaseService();
        this.svCoopMember = new CoopMemberService();
    }

    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "CoopMember",
            "a": "Create",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "userIdMember": "1010",
                            "memberGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
                            "groupGuidParent": "D7FF9E61-B143-D083-6130-A51058AD9630",
                            "cdObjTypeId": "9"
                        }
                    },
                    {
                        "data": {
                            "userIdMember": "1015",
                            "memberGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
                            "groupGuidParent": "2cdaba03-5121-11e7-b279-c04a002428aa",
                            "cdObjTypeId": "9"
                        }
                    }
                ],
                "token": "6E831EAF-244D-2E5A-0A9E-27C1FDF7821D"
            },
            "args": null
        }
     * @param req
     * @param res
     */
    async Create(req, res) {
        try {
            await this.svCoopMember.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CoopMember",
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
            await this.svCoopMember.getCoopMember(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:Get');
        }
    }

    async GetMemberProfile(req, res) {
        try {
            await this.svCoopMember.getCoopMemberProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:GetProfile');
        }
    }

    /**
     * 
     * {
        "ctx": "App",
        "m": "Coops",
        "c": "CoopMember",
        "a": "ActivateCoop",
        "dat": {
            "f_vals": [
            {
                "data": {
                "coopId": 3
                }
            }
            ],
            "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": {}
        }
     * @param req 
     * 
     * @param res 
     */
    async ActivateCoop(req, res) {
        try {
            await this.svCoopMember.activateCoop(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:ActivateCoop');
        }
    }

    // async GetType(req, res) {
    //     try {
    //         await this.svCoopMember.getCoopMemberTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'CoopMemberController:Get');
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
            await this.svCoopMember.getCoopMemberCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:Get');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CoopMember",
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
        console.log('CoopMemberController::Update()/01');
        try {
            console.log('CoopMemberController::Update()/02');
            await this.svCoopMember.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:Update');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CoopMember",
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
            await this.svCoopMember.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController:Update');
        }
    }

    /**
     * {
            "ctx": "Sys",
            "m": "Coops",
            "c": "CoopMember",
            "a": "UpdateCoopMemberProfile",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": null,
                            "where": {
                                "userId": 1010
                            }
                        },
                        "jsonUpdate": [
                            {
                                "path": [
                                    "fieldPermissions",
                                    "userPermissions",
                                    [
                                        "userName"
                                    ]
                                ],
                                "value": {
                                    "userId": 1010,
                                    "field": "userName",
                                    "hidden": false,
                                    "read": true,
                                    "write": false,
                                    "execute": false
                                }
                            },
                            {
                                "path": [
                                    "fieldPermissions",
                                    "groupPermissions",
                                    [
                                        "userName"
                                    ]
                                ],
                                "value": {
                                    "groupId": 0,
                                    "field": "userName",
                                    "hidden": false,
                                    "read": true,
                                    "write": false,
                                    "execute": false
                                }
                            }
                        ]
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }
     * @param req 
     * @param res 
     */
    //  * @param req
    //  * @param res
    //  */
    async UpdateCoopMemberProfile(req, res) {
        console.log('CoopMemberController::UpdateCoopMemberProfile()/01');
        try {
            console.log('CoopMemberController::UpdateCoopMemberProfile()/02');
            await this.svCoopMember.updateCoopMemberProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CoopMemberController::UpdateCoopMemberProfile');
        }
    }

}