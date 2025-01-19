
import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { CdDevProjectService } from '../services/cd-dev-project.service';

export class CdDevProjectController extends CdController {
    b: BaseService;
    svCdDevProject: CdDevProjectService;

    constructor() {
        super();
        this.b = new BaseService();
        this.svCdDevProject = new CdDevProjectService();

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
            await this.svCdDevProject.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdDevProject",
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
            await this.svCdDevProject.getCdDevProject(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:Get');
        }
    }


    // async GetCdDevProjectProfile(req, res) {
    //     try {
    //         await this.svCdDevProject.getCdDevProjectProfile(req, res);
    //     } catch (e) {
    //         await this.b.serviceErr(req, res, e, 'CdDevProjectController:GetProfile');
    //     }
    // }

    /**
     * 
     * {
        "ctx": "App",
        "m": "Abcds",
        "c": "CdDevProject",
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
    //         await this.svCdDevProject.activateAbcd(req, res);
    //     } catch (e) {
    //         await this.b.serviceErr(req, res, e, 'CdDevProjectController:ActivateAbcd');
    //     }
    // }

    // async GetType(req, res) {
    //     try {
    //         await this.svCdDevProject.getCdDevProjectTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'CdDevProjectController:Get');
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
            await this.svCdDevProject.getCdDevProjectCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:GetCount');
        }
    }

    /**
     * curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "Sys",
        "m": "CdDev",
        "c": "CdDevProject",
        "a": "GetTypeCount",
        "dat": {
            "f_vals": [
            {
                "query": {"where":{}}
            }
            ],
            "token": "d33bb2d3-f4d5-42b4-8e31-44fed3e29826"
        },
        "args": null
        }' https://localhost:3001/api -v | jq '.'
     * @param req 
     * @param res 
     */
    async GetTypeCount(req, res) {
        try {
            await this.svCdDevProject.getCdDevProjectTypeCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:GetTypeCount');
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
        console.log('CdDevProjectController::Update()/01');
        try {
            console.log('CdDevProjectController::Update()/02');
            await this.svCdDevProject.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:Update');
        }
    }

    /**
     * curl -k -X POST -H 'Content-Type: application/json' -d '{
        "ctx": "Sys",
        "m": "CdDev",
        "c": "CdDevProject",
        "a": "UpdateCdDevProject",
        "dat": {
            "f_vals": [
            {
                "query": {
                "update": null,
                "where": {
                    "userId": 1010,
                    "cdDevProjectId": 2
                }
                },
                "jsonUpdate": [
                {
                    "modelField": "cdDevProjectData",
                    "path": [
                    "cdVault",
                    "[0]",
                    "encryptedVaue"
                    ],
                    "value": "123456abcdefgABC"
                },
                {
                    "modelField": "cdDevProjectData",
                    "path": [
                    "cdVault",
                    "[0]",
                    "EncryptionMeta"
                    ],
                    "value": {
                    "iv": "1a94d8c6b7e8...sample..901f",
                    "encoding": "hex",
                    "algorithm": "aes-256-cbc",
                    "encryptedToken": "3a94d8c6b7...e04a"
                    }
                }
                ]
            }
            ],
            "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
        },
        "args": {}
        }' https://localhost:3001/api -v | jq '.'
     * @param req 
     * @param res 
     */
    async UpdateCdDevProject(req, res) {
        console.log('CdDevProjectController::UpdateCdDevProject()/01');
        try {
            console.log('CdDevProjectController::UpdateCdDevProject()/02');
            await this.svCdDevProject.updateCdDevProject(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:UpdateCdDevProject');
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
            await this.svCdDevProject.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdDevProjectController:Update');
        }
    }

    /**
     * {
            "ctx": "Sys",
            "m": "Abcds",
            "c": "CdDevProject",
            "a": "UpdateCdDevProjectProfile",
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
    // async UpdateCdDevProjectProfile(req, res) {
    //     console.log('CdDevProjectController::UpdateCdDevProjectProfile()/01');
    //     try {
    //         console.log('CdDevProjectController::UpdateCdDevProjectProfile()/02');
    //         await this.svCdDevProject.updateCdDevProjectProfile(req, res);
    //     } catch (e) {
    //         await this.b.serviceErr(req, res, e, 'CdDevProjectController::UpdateCdDevProjectProfile');
    //     }
    // }

}