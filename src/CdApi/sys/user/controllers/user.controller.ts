import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { IRespInfo } from '../../base/IBase';
import { UserService } from '../services/user.service';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { Session } from 'inspector';

export class UserController extends CdController {
    b: BaseService;
    svUser: UserService;
    svSess: SessionService;
    constructor() {
        super();
        this.b = new BaseService();
        this.svUser = new UserService();
        // this.svSess = new Session();
    }

    async Login(req, res) {
        const ret: UserModel[] = await this.svUser.read(req, res);
        const loginSuccess = await bcrypt.compare(req.post.dat.f_vals[0].data.password, ret[0].password);
        this.b.err.push('login success');
        let i: IRespInfo = {
            messages: this.b.err,
            code: 'UserService:Login',
            app_msg: ''
        };
        if (loginSuccess) {
            this.svSess.create();
            this.b.setAppState(true, i, null);
            this.b.cdResp.data = { loginSuccess };
        } else {
            this.b.err.push('login failed');
            i = {
                messages: this.b.err,
                code: 'UserService:Login',
                app_msg: ''
            };
            this.b.setAppState(true, i, null);
            this.b.cdResp.data = { loginSuccess };
        }
        this.b.respond(req, res, ret);
    }


    async Register(req, res) {
        try {
            await this.svUser.create(req, res);
        } catch (e) {
            console.log('e', e);
        }
    }

    async bRead(req, res) {
        // const repeated = await this.b.read(this, {user_name: 'goremo'});
        // console.log('repeated:', repeated);
        await this.svUser.bRead(req, res);
    }
}