import { BaseService } from '../../base/base.service';
import { CdController } from '../../base/cd.controller';
import { IRespInfo } from '../../base/IBase';

export class DocProcessingController extends CdController {
    b: BaseService;
    constructor() {
        super();
        this.b = new BaseService();
        // this.svSess = new Session();
    }

    async Login(req, res) {
        // const ret: User[] = await this.svUser.read(req, res);
        // const loginSuccess = await bcrypt.compare(req.post.dat.f_vals[0].data.password, ret[0].password);
        // this.b.err.push('login success');
        // let i: IRespInfo = {
        //     messages: this.b.err,
        //     code: 'UserService:Login',
        //     app_msg: ''
        // };
        // if (loginSuccess) {
        //     this.svSess.create();
        //     this.b.setAppState(true, i, null);
        //     this.b.cdResp.data = { loginSuccess };
        // } else {
        //     this.b.err.push('login failed');
        //     i = {
        //         messages: this.b.err,
        //         code: 'UserService:Login',
        //         app_msg: ''
        //     };
        //     this.b.setAppState(true, i, null);
        //     this.b.cdResp.data = { loginSuccess };
        // }
        // this.b.respond(req, res, ret);
    }


    async Register(req, res) {
        // await this.svUser.create(req, res);
    }
}