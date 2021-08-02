
import { createConnection, getConnection, } from 'typeorm';
import 'reflect-metadata';
import { BaseService } from '../../base/base.service';
// import { ICdPushEnvelop, ICdResponse, ICommConversationSub, IRespInfo } from '../../base/IBase';
// import { UserModel } from '../../user/models/user.model';
// import { registerNotifTemplate } from '../../user/models/registerNotifTemplate';
import { CdService } from '../../base/cd.service';
import { MailService } from '../../comm/services/mail.service';

export class UserService extends CdService {
    cdToken: string;
    b: BaseService;
    mail: MailService;

    constructor() {
        super();
        this.b = new BaseService();
        this.mail = new MailService();
    }

    /**
     * most doc creation is automated at the base
     * @param req
     * @param res
     */
    async create(req, res): Promise<void> {
        console.log(`Starting create()`);
    }

    async read(req, res): Promise<any> {
        console.log(`Starting read()`);
    }

    update(req, res): Promise<void> {
        console.log(`starting SessionService::update()`);
        return null;
    }

    remove(req, res): Promise<void> {
        console.log(`starting SessionService::remove()`);
        return null;
    }

    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbRemove(): number {
        return 1;
    }

}