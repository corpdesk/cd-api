import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { UserService } from '../services/user.service';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { DocModel } from '../../moduleman/models/doc.model';
import { SessionModel } from '../models/session.model';
import { ISessResp } from '../../base/IBase';

export class UserController extends CdController {
    b: BaseService;
    svUser: UserService;
    svSess: SessionService;
    constructor() {
        super();
        this.b = new BaseService();
        this.svUser = new UserService();
        this.svSess = new SessionService();
    }

    async Login(req, res) {
        const serviceInput = {
            serviceModel: UserModel,
            docModel: DocModel,
            docName: 'UserService::Login',
            cmd: {
                action: 'find',
                filter: { where: { userName: req.post.dat.f_vals[0].data.user_name } }
            },
            dSource: 1,
        }
        const result: UserModel[] = await this.svUser.read(req, res, serviceInput);
        let loginSuccess = null;
        let i = null;
        if (result.length > 0) {
            const guest: UserModel = result[0];
            loginSuccess = await bcrypt.compare(req.post.dat.f_vals[0].data.password, guest.password);
            this.b.err.push('login success');
            if (loginSuccess) {
                await this.svSess.setSession(guest);
                const sessResult: SessionModel = await this.svSess.create(req, res);
                const sessData: ISessResp = {
                    cd_token: sessResult.cdToken,
                    jwt: null,
                    ttl: sessResult.ttl
                };
                i = {
                    messages: this.b.err,
                    code: 'UserController:Login',
                    app_msg: ''
                };
                await this.b.setAppState(true, i, sessData);
                delete guest.password;
                this.b.cdResp.data = guest;
            } else {
                this.b.err.push('login failed');
                i = {
                    messages: this.b.err,
                    code: 'UserController:Login',
                    app_msg: 'Login success'
                };
                await this.b.setAppState(true, i, null);
            }
            await this.b.respond(req, res, null);
        } else {
            this.b.serviceErr(res, 'Login failed', 'UserController:Login')
        }
    }

    async Register(req, res) {
        try {
            await this.svUser.create(req, res);
        } catch (e) {
            this.b.serviceErr(res, e,'UserService:Register');
        }
    }
}