import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { UserService } from '../services/user.service';

export class UserController extends CdController {
    b: BaseService;
    svUser: UserService;
    constructor() {
        super();
        this.b = new BaseService();
        this.svUser = new UserService();
    }

    /**
     * {
     *   "ctx": "Sys",
     *   "m": "User",
     *   "c": "User",
     *   "a": "Login",
     *   "dat": {
     *       "f_vals": [
     *           {
     *               "data": {
     *                   "user_name": "goremo2",
     *                   "password": "ekzo3lxm",
     *                   "consumer_guid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
     *               }
     *           }
     *       ],
     *       "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
     *   },
     *   "args": null
     * }
     * @param req
     * @param res
     */
    async Login(req, res) {
        console.log('starting Login()')
        try {
            await this.svUser.auth(req,res);
        } catch (e) {
            this.b.serviceErr(req, res, e,'UserService:Login');
        }
    }

    /**
     * {
     *   "ctx": "Sys",
     *   "m": "User",
     *   "c": "User",
     *   "a": "Login",
     *   "dat": {
     *       "f_vals": [
     *           {
     *               "data": {
     *                   "f_name": "George",
     *                   "l_name": "Oremo",
     *                   "email": "george.oremo@corpdesk.io",
     *                   "user_name": "goremo2",
     *                   "password": "ekzo3lxm",
     *                   "consumer_guid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
     *               }
     *           }
     *       ],
     *       "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
     *   },
     *   "args": null
     * }
     * @param req
     * @param res
     */
    async Register(req, res) {
        try {
            await this.svUser.create(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e,'UserService:Register');
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
            this.b.serviceErr(req, res, e, 'UserController:Get');
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
            await this.svUser.getUserCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'UserController:Get');
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
            this.b.serviceErr(req, res, e, 'UserController:Update');
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
            this.b.serviceErr(req, res, e, 'UserController:Update');
        }
    }
}