import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { Logging } from '../../base/winston.log';
import { UserService } from '../services/user.service';

export class UserController extends CdController {
    logger: Logging;
    b: BaseService;
    svUser: UserService;
    constructor() {
        super();

        this.b = new BaseService();
        this.svUser = new UserService();
        this.logger = new Logging();
    }

    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "Login",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "userName": "jondoo",
                            "password": "iiii",
                            "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
                        }
                    }
                ],
                "token": ""
            },
            "args": null
        }
     * @param req
     * @param res
     */
    async Login(req, res) {
        this.logger.logInfo('starting Login()')
        try {
            await this.svUser.auth(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserService:Login');
        }
    }

    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "Register",
            "dat": {
                "f_vals": [
                    {
                        "data":{
                            "userName": "goremo05",
                            "email":"goremo05@gmail.com",
                            "password": "yrhuiak",
                            "consumerGuid":"B0B3DA99-1859-A499-90F6-1E3F69575DCD" // all clients must have consumer guid which pegs them to a given company
                        }
                    }
                ],
                "token": ""
            },
            "args": {}
        }
     * @param req
     * @param res
     */
    async Register(req, res) {
        try {
            await this.svUser.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserService:Register');
        }
    }

    /**
     * {
          "ctx": "Sys",
          "m": "User",
          "c": "User",
          "a": "ActivateUser",
          "dat": {
              "f_vals": [
                  {
                      "data": {
                          "activationKey": "459bc3d0-c10e-4264-9e37-5175c379b620"
                          "userId": 13,
                          "sid": 23
                      }
                  }
              ],
              "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
          },
          "args": null
      }
     * @param req
     * @param res
     */
    async ActivateUser(req, res) {
        try {
            await this.svUser.activateUser(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserService:Register');
        }
    }



    // {
    //     "ctx": "Sys",
    //     "m": "User",
    //     "c": "User",
    //     "a": "Get",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "where": {
    //                         "userGuid": "86faa6df-358b-4e32-8a66-d133921da9fe"
    //                     }
    //                 }
    //             }
    //         ],
    //         "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //     },
    //     "args": {}
    // }
    async Get(req, res) {
        try {
            await this.svUser.getUser(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController:Get');
        }
    }

    // {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "User",
    //     "a": "GetType",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "where": {}
    //                 }
    //             }
    //         ],
    //         "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //     },
    //     "args": null
    // }
    // async GetType(req, res) {
    //     try {
    //         await this.svUser.getUserTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'UserController:Get');
    //     }
    // }

    // {
    //     "ctx": "Sys",
    //     "m": "User",
    //     "c": "User",
    //     "a": "GetCount",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "select": [
    //                         "userName",
    //                         "userGuid"
    //                     ],
    //                     "where": {},
    //                     "take": 5,
    //                     "skip": 0
    //                 }
    //             }
    //         ],
    //         "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //     },
    //     "args": null
    // }
    async GetCount(req, res) {
        try {
            // await this.svUser.getUserCount(req, res);
            await this.svUser.getUserQB(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController:GetCount');
        }
    }


    async GetUserProfile(req, res) {
        try {
            // await this.svUser.getUserCount(req, res);
            await this.svUser.getUserProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController:getUserProfile');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "User",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "consumer-resourceName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "consumer-resourceId": 45762
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
        console.log('UserController::Update()/01');
        try {
            console.log('UserController::Update()/02');
            await this.svUser.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController:Update');
        }
    }

    /**
     * To test regiser a new user as below the followed by the update of
     * the password in the script that follows the one below:
     * 
     * /////////////////////////////////////////////////////////////////////////////////////////
        // 1. create new user
        /////////////////////////////////////////////////////////////////////////////////////////
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "Register",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "userName": "goremo05",
                            "email": "goremo05@gmail.com",
                            "password": "yrhuiak",
                            "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD" // all clients must have consumer guid which pegs them to a given company
                        }
                    }
                ],
                "token": ""
            },
            "args": {}
        }
                
                
        /////////////////////////////////////////////////////////////////////////////////////////
        // 2. update password
        /////////////////////////////////////////////////////////////////////////////////////////
        There are circumstances that will require old password but in cases of 'forgotPassword',
        some token can be sent to user securely process update without use of 'oldPassword'
        {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "UpdatePassword",
            "dat": {
                "f_vals": [
                    {
                        "forgotPassword":false,
                        "oldPassword": "yrhuiak",
                        "query": {
                            "update": {
                                "password": "emj8a#jul"
                            },
                            "where": {
                                "userId": 1500
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

        // see use case for 'forgotPassword'
        {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "UpdatePassword",
            "dat": {
                "f_vals": [
                    {
                        "forgotPassword": true, // optional: used securely when oldPassword is not avialble (developer option...NOT end user) 
                        "oldPassword": null, // can be set to oldPassword text or set to null by develper to use in case of forgotPassword === true;
                        "query": {
                            "update": {
                                "password": "iiii"
                            },
                            "where": {
                                "userId": 1003
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }
     * @param req 
     * @param res 
     */
    async UpdatePassword(req, res) {
        console.log('UserController::UpdatePassword()/01');
        try {
            console.log('UserController::UpdatePassword()/02');
            await this.svUser.updatePassword(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController:UpdatePassword');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "User",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"consumer-resourceId": 45763}
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
            await this.svUser.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController:Update');
        }
    }

    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "UpdateUserProfile",
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
    async UpdateUserProfile(req, res) {
        console.log('UserController::UpdateUserProfile()/01');
        try {
            console.log('UserController::UpdateUserProfile()/02');
            await this.svUser.updateUserProfile(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'UserController::UpdateUserProfile');
        }
    }
}