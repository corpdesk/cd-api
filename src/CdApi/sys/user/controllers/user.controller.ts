import { CdController } from '../../base/cd.controller';
import { UserService } from '../services/user.service';

export class UserController extends CdController {
    svUser: UserService;
    constructor() {
        super();
        this.svUser = new UserService();
    }
    Login(req, res) {
        console.log('');
    }

    Register(req, res) {
        this.svUser.create(req,res);
        console.log('');
    }
}