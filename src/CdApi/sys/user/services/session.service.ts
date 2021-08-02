// https://www.npmjs.com/package/device-detector-js
import DeviceDetector from 'device-detector-js';
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

    async setSession(req, guest: UserModel) {
        this.sessModel.startTime = await this.b.mysqlNow();
        this.sessModel.cdToken = this.b.getGuid();
        this.sessModel.currentUserId = guest.userId;
        this.sessModel.accTime = await this.b.mysqlNow();
        this.sessModel.ttl = this.getTtl();
        this.sessModel.active = true;
        this.sessModel.deviceNetId = await this.getDeviceNetId(req);
    }

    getTtl() {
        return 600;
    }

    // https://www.npmjs.com/package/device-detector-js
    async getDeviceNetId(req): Promise<JSON> {
        const deviceDetector = new DeviceDetector();
        const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36`;
        const resultStr = JSON.stringify(deviceDetector.parse(userAgent));
        const ip4 = this.getIP(req);
        const resultJ = JSON.parse(resultStr);
        resultJ.net = {
            ip: ip4
        }
        return resultJ;
    }

    getIP(req){
        return req.ip;
    }
}