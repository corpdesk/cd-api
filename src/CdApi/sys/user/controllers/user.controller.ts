import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { UserService } from '../services/user.service';

export class UserController extends CdController {
    b: BaseService;
    svUser: UserService;
    constructor() {
        super();
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
        try {
            await this.svUser.auth(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'UserService:Login');
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
            this.b.serviceErr(res, e,'UserService:Register');
        }
    }
}