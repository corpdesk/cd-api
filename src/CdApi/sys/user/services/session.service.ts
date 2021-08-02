import { getConnection } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { IServiceInput } from '../../base/IBase';
import { DocModel } from '../../moduleman/models/doc.model';
import { SessionModel } from '../models/session.model';
import { UserModel } from '../models/user.model';


export class SessionService {
    b: BaseService;
    sessModel: SessionModel;
    constructor() {
        this.b = new BaseService();
        this.sessModel = new SessionModel();
    }

    async create(req, res) {
        try {
            const serviceInput: IServiceInput = {
                serviceModel: SessionModel,
                serviceModelInstance: this.sessModel,
                docModel: DocModel,
                docName: 'Create Session'
            }
            return await this.b.create(req, res, serviceInput);
        } catch (e) {
            this.b.serviceErr(res, e, 'SessionService:create');
        }
    }

    read() {
        console.log(`starting SessionService::read()`);
    }

    update() {
        console.log(`starting SessionService::update()`);
    }

    remove() {
        console.log(`starting SessionService::remove()`);
    }

    async setSession(guest: UserModel) {
        this.sessModel.startTime = await this.b.mysqlNow();
        this.sessModel.cdToken = this.b.getGuid();
        this.sessModel.currentUserId = guest.userId;
        this.sessModel.accTime = await this.b.mysqlNow();
        this.sessModel.ttl = this.getTtl();
        this.sessModel.active = true;
    }

    getTtl() {
        return 600;
    }
}