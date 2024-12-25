
import { BaseService } from '../../../sys/base/base.service';
import { CdController } from '../../../sys/base/cd.controller';
import { AbcdEfgService } from '../services/abcd-efg.service';

export class AbcdEfgController extends CdController {
    b: BaseService;
    svAbcdEfg: AbcdEfgService;

    constructor() {
        super();
        this.b = new BaseService();
        this.svAbcdEfg = new AbcdEfgService();
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
            await this.svAbcdEfg.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "AbcdEfg",
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
            await this.svAbcdEfg.getAbcdEfg(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:Get');
        }
    }

    async GetAbcdEfgProfile(req, res) {
        try {
            await this.svAbcdEfg.getAbcdEfgProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:GetProfile');
        }
    }

    /**
     * 
     * {
        "ctx": "App",
        "m": "Abcds",
        "c": "AbcdEfg",
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
    async ActivateAbcd(req, res) {
        try {
            await this.svAbcdEfg.activateAbcd(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:ActivateAbcd');
        }
    }

    // async GetType(req, res) {
    //     try {
    //         await this.svAbcdEfg.getAbcdEfgTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'AbcdEfgController:Get');
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
            await this.svAbcdEfg.getAbcdEfgCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:Get');
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
        console.log('AbcdEfgController::Update()/01');
        try {
            console.log('AbcdEfgController::Update()/02');
            await this.svAbcdEfg.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:Update');
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
            await this.svAbcdEfg.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController:Update');
        }
    }

    /**
     * {
            "ctx": "Sys",
            "m": "Abcds",
            "c": "AbcdEfg",
            "a": "UpdateAbcdEfgProfile",
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
    async UpdateAbcdEfgProfile(req, res) {
        console.log('AbcdEfgController::UpdateAbcdEfgProfile()/01');
        try {
            console.log('AbcdEfgController::UpdateAbcdEfgProfile()/02');
            await this.svAbcdEfg.updateAbcdEfgProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdEfgController::UpdateAbcdEfgProfile');
        }
    }

}