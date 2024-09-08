// https://www.npmjs.com/package/device-detector-js
import DeviceDetector from 'device-detector-js';
import { BaseService } from '../../base/base.service';
import { IServiceInput, ISessionDataExt, ISessResp } from '../../base/IBase';
import { DocModel } from '../../moduleman/models/doc.model';
import { SessionModel } from '../models/session.model';
import { UserModel } from '../models/user.model';
import { UserService } from './user.service';
import { Logging } from '../../base/winston.log';
import { ConsumerModel } from '../../moduleman/models/consumer.model';
import { CompanyModel } from '../../moduleman/models/company.model';
import { ConsumerService } from '../../moduleman/services/consumer.service';


export class SessionService {
    logger: Logging;
    b: BaseService;
    sessModel: SessionModel;
    sessIsSet = false;
    sessData = {
        cuid: 1000,
        cdToken: '',
        consumerGuid: '',
        deviceNetId: null,
        userData: null,
    };

    sessResp: ISessResp = {
        cd_token: '',
        jwt: null,
        ttl: 600
    };

    currentUserData: UserModel[];
    currentSessData: SessionModel[];
    currentConsumerData: ConsumerModel[];
    currentCompanyData: CompanyModel[];
    
    constructor() {
        this.b = new BaseService();
        this.logger = new Logging();
        this.sessModel = new SessionModel();
    }

    async create(req, res, guest) {
        this.logger.logInfo('starting SessionService::create(req, res, guest)');
        try {
            // const session = new SessionModel();
            await this.setSession(req, guest);
            const serviceInput: IServiceInput = {
                serviceInstance: this,
                serviceModel: SessionModel,
                serviceModelInstance: this.sessModel,
                dSource: 1,
                docName: 'Create Session',
                data: this.sessModel
            }
            const sessData: SessionModel = await this.b.create(req, res, serviceInput);
            req.post.dat.token = sessData.cdToken
            this.logger.logInfo('SessionService::create/02/sessData:', sessData);
            return sessData;
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'SessionService:create');
        }
    }

    read() {
        this.logger.logInfo(`starting SessionService::read()`);
    }

    update() {
        this.logger.logInfo(`starting SessionService::update()`);
    }

    remove() {
        this.logger.logInfo(`starting SessionService::remove()`);
    }

    async setSession(req, guest: UserModel) {
        this.sessData.cuid = guest.userId;
        this.sessData.cdToken = this.b.getGuid();
        this.sessData.consumerGuid = req.post.dat.f_vals[0].data.consumerGuid;
        this.sessData.deviceNetId = await this.getDeviceNetId(req);
        this.sessData.userData = guest;
        this.sessModel.startTime = await this.b.mysqlNow();
        this.sessModel.cdToken = this.sessData.cdToken;
        this.sessModel.currentUserId = guest.userId;
        this.sessModel.accTime = await this.b.mysqlNow();
        this.sessModel.ttl = this.getTtl();
        this.sessModel.active = true;
        this.sessModel.deviceNetId = this.sessData.deviceNetId;
        this.sessModel.consumerGuid = this.sessData.consumerGuid;
        req.post.sessData = this.sessData;
        this.sessIsSet = true;
    }

    async getSession(req, res): Promise<SessionModel[]> {
        this.logger.logInfo('starting SessionService::getSession()')
        // this.logger.logInfo('SessionService::getSession()/req.post:', req.post)
        // this.logger.logInfo('SessionService::getSession()/req.post.dat.token:', req.post.dat.token)
        const serviceInput = {
            serviceInstance: this,
            serviceModel: SessionModel,
            docName: 'SessionService::getSession',
            cmd: {
                action: 'find',
                query: {
                    // get requested user and 'anon' data/ anon data is used in case of failure
                    where: [
                        { cdToken: req.post.dat.token },
                    ]
                }
            },
            dSource: 1,
        }
        console.log("SessionService::getSession/req.post.dat.token:", req.post.dat.token)
        console.log("SessionService::getSession/serviceInput:", serviceInput)
        return await this.b.read(req, res, serviceInput);
    }

    getTtl() {
        return 600;
    }

    // Based on: https://www.npmjs.com/package/device-detector-js
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

    getIP(req) {
        return req.ip;
    }

    // async getConsumerGuid(req) {
    //     return await req.post.sessData.consumerGuid;
    // }

    async getCuid(req) {
        return req.post.sessData.cuid;
    }

    async getCurrentUser(req, res) {
        const svUser = new UserService()
        if('sessData' in req.post){
            return req.post.sessData.userData;
        }
        if(this.b.isRegisterRequest()){
            svUser.getAnon(req, res)
        }
        
    }

    async getSessionDataExt(req, res): Promise<ISessionDataExt> {
        const svUser = new UserService();
        const svConsumer = new ConsumerService();
        // const sessionData = await this.getSession(req, res);
        this.currentSessData = await this.getSession(req, res);
        console.log('SessionService::getSessionDataExt()/this.currentSessData:', this.currentSessData)
        const consumerGuid = this.currentSessData[0].consumerGuid;
        const cuid = this.currentSessData[0].currentUserId;
        console.log('SessionService::getSessionDataExt()/cuid:', cuid)
        this.currentUserData = await svUser.getUserByID(req, res, cuid);
        console.log('SessionService::getSessionDataExt()/consumerGuid:', consumerGuid)
        console.log('SessionService::getSessionDataExt()/consumerGuid:', consumerGuid)
        this.currentConsumerData = await svConsumer.getConsumerI(req, res, {where:{consumerGuid:consumerGuid}});
        console.log('SessionService::getSessionDataExt()/this.currentConsumerData:', this.currentConsumerData)
        this.currentCompanyData = await svConsumer.getCompanyData(req, res, consumerGuid);
        console.log('SessionService::getSessionDataExt()/this.currentCompanyData:', this.currentCompanyData)
        return {
            currentUser: this.currentUserData[0],
            currentSession: this.currentSessData[0],
            currentConsumer: this.currentConsumerData[0],
            currentCompany: this.currentCompanyData[0],
        }
    }
}