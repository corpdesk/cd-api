
import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { CdCliProfileService } from '../services/cd-cli-profile.service';

export class CdCliProfileController extends CdController {
    b: BaseService;
    svCdCliProfile: CdCliProfileService;

    constructor() {
        super();
        this.b = new BaseService();
        this.svCdCliProfile = new CdCliProfileService();
    }

    /**
     * curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Abcds",
        "c": "AbcdRef",
        "a": "Create",
        "dat": {
            "f_vals": [
            {
                "data": {
                "abcdRefName": "DemoRef:28:11:2024:11:55",
                "abcdRefDescription": "test create"
                }
            }
            ],
            "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": {}
        }' https://localhost:3001/api -v | jq '.'\
     * @param req
     * @param res
     */
    async Create(req, res) {
        try {
            await this.svCdCliProfile.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdCliProfileController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdCliProfile",
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
            await this.svCdCliProfile.getCdCliProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdCliProfileController:Get');
        }
    }

    // async GetCdCliProfileProfile(req, res) {
    //     try {
    //         await this.svCdCliProfile.getCdCliProfileProfile(req, res);
    //     } catch (e) {
    //         await this.b.serviceErr(req, res, e, 'CdCliProfileController:GetProfile');
    //     }
    // }

    /**
     * 
     * {
        "ctx": "App",
        "m": "Abcds",
        "c": "CdCliProfile",
        "a": "ActivateAbcd",
        "dat": {
            "f_vals": [
            {
                "data": {
                "abcdId": 3
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
    // async ActivateAbcd(req, res) {
    //     try {
    //         await this.svCdCliProfile.activateAbcd(req, res);
    //     } catch (e) {
    //         await this.b.serviceErr(req, res, e, 'CdCliProfileController:ActivateAbcd');
    //     }
    // }

    // async GetType(req, res) {
    //     try {
    //         await this.svCdCliProfile.getCdCliProfileTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'CdCliProfileController:Get');
    //     }
    // }

    /** Pageable request:
    curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Abcds",
        "c": "AbcdRef",
        "a": "GetCount",
        "dat": {
          "f_vals": [
            {
              "query": {
                "select": [
                  "abcdRefId",
                  "abcdRefName"
                ],
                "where": {}
              }
            }
          ],
          "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": null
      }' https://localhost:3001/api -v | jq '.'
    //  * @param req
    //  * @param res
    //  */
    async GetCount(req, res) {
        try {
            await this.svCdCliProfile.getCdCliProfileCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdCliProfileController:Get');
        }
    }

    /**
    curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Abcds",
        "c": "AbcdRef",
        "a": "Update",
        "dat": {
          "f_vals": [
            {
              "query": {
                "update": {
                  "abcdRefDescription": "updated version"
                },
                "where": {
                  "abcdRefId": 114
                }
              }
            }
          ],
          "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": null
      }' https://localhost:3001/api -v | jq '.'
    //  * @param req
    //  * @param res
    //  */
    async Update(req, res) {
        console.log('CdCliProfileController::Update()/01');
        try {
            console.log('CdCliProfileController::Update()/02');
            await this.svCdCliProfile.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdCliProfileController:Update');
        }
    }

    /**
    //  * curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "App",
        "m": "Abcds",
        "c": "AbcdRef",
        "a": "Delete",
        "dat": {
            "f_vals": [
            {
                "query": {
                "where": {
                    "abcdRefId": 114
                }
                }
            }
            ],
            "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": null
        }' https://localhost:3001/api -v | jq '.'
    //  * @param req
    //  * @param res
    //  */
    async Delete(req, res) {
        try {
            await this.svCdCliProfile.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdCliProfileController:Update');
        }
    }

    /**
     * {
            "ctx": "Sys",
            "m": "Abcds",
            "c": "CdCliProfile",
            "a": "UpdateCdCliProfileProfile",
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
    // async UpdateCdCliProfileProfile(req, res) {
    //     console.log('CdCliProfileController::UpdateCdCliProfileProfile()/01');
    //     try {
    //         console.log('CdCliProfileController::UpdateCdCliProfileProfile()/02');
    //         await this.svCdCliProfile.updateCdCliProfileProfile(req, res);
    //     } catch (e) {
    //         await this.b.serviceErr(req, res, e, 'CdCliProfileController::UpdateCdCliProfileProfile');
    //     }
    // }

}