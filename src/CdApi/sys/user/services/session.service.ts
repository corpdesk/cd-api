// https://www.npmjs.com/package/device-detector-js
import DeviceDetector from 'device-detector-js';
import { BaseService } from '../../base/base.service';
import { IServiceInput, ISessionDataExt, ISessResp } from '../../base/IBase';
import { DocModel } from '../../moduleman/models/doc.model';
// import * as dotenv from 'dotenv';
import { defaultSession, SessionModel } from '../models/session.model';
import { IUserProfile, UserModel } from '../models/user.model';
import { UserService } from './user.service';
import { Logging } from '../../base/winston.log';
import { ConsumerModel } from '../../moduleman/models/consumer.model';
import { CompanyModel } from '../../moduleman/models/company.model';
import { ConsumerService } from '../../moduleman/services/consumer.service';
import { RedisService } from '../../base/redis-service';
import config from '../../../../config';
import { safeStringify } from '../../utils/safe-stringify';
// dotenv.config();


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
    clientId: any;
    private redisService: RedisService;

    currentUserData: UserModel;
    currentUserProfile;
    currentSessData: SessionModel[];
    currentConsumerData: ConsumerModel[];
    currentCompanyData: CompanyModel[];

    constructor() {
        this.b = new BaseService();
        this.logger = new Logging();
        this.sessModel = new SessionModel();
        // Initialize RedisService
        this.redisService = new RedisService();
    }

    async create(req, res, guest) {
        this.logger.logInfo('starting SessionService::create(req, res, guest)');
        try {
            // const session = new SessionModel();
            await this.setSession(req,res, guest);
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

    async setSession(req, res, guest: UserModel) {
        try{
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
            this.logger.logInfo('SessionService::setSession()/this.sessModel:', this.sessModel)
        }catch(e){
            await this.b.serviceErr(req, res, e, 'SessionService:setSession');
        }
    }

    async getSession(req, res): Promise<SessionModel[]> {
        this.logger.logInfo('starting SessionService::getSession()')
        if(this.validateToken(req)){
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
            this.logger.logDebug("SessionService::getSession/req.post.dat.token:", req.post.dat.token)
            this.logger.logDebug("SessionService::getSession/serviceInput:", serviceInput)
            return await this.b.read(req, res, serviceInput);
        } else{
            return await [defaultSession]
        }  
        
    }

    validateToken(req): boolean {
        const token = req?.post?.dat?.token;
      
        // Check existence
        if (!token) {
            this.logger.logWarn("Token missing from request.");
          return false;
        }
      
        // Check type
        if (typeof token !== "string") {
          this.logger.logWarn("Token is not a string.");
          return false;
        }
      
        // Check length
        if (token.length !== 36) {
          this.logger.logWarn("Token does not have a valid length.");
          return false;
        }
      
        // Check UUID v4 format
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidV4Regex.test(token)) {
          this.logger.logWarn("Token is not a valid UUID v4.");
          return false;
        }
      
        return true;
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
        if ('sessData' in req.post) {
            return req.post.sessData.userData;
        }
        if (this.b.isRegisterRequest()) {
            svUser.getAnon(req, res)
        }

    }

    async getSessionDataExt(req, res, ignoreCache: boolean = null): Promise<ISessionDataExt | null> {
        this.logger.logDebug("SessionService::getSessionDataExt()/01")
        let cacheKey

        if (!ignoreCache) {
            this.logger.logDebug("SessionService::getSessionDataExt()/02")
            // Define a unique cache key based on session ID or user-specific identifier
            cacheKey = `session_data_${req.post.dat.token}`;

            // Try to retrieve session data from Redis cache
            let sessionData = await this.redisService.get(cacheKey);

            if (sessionData) {
                this.logger.logDebug("SessionService::getSessionDataExt()/03")
                // Parse cached session data and return it
                return JSON.parse(sessionData);
            }
        }


        // If cache miss, proceed to retrieve data from the database as usual
        const svUser = new UserService();
        const svConsumer = new ConsumerService();

        this.logger.logDebug("SessionService::getSessionDataExt()/04")
        this.currentSessData = await this.getSession(req, res);
        this.logger.logDebug("SessionService::getSessionDataExt()/05")
        this.logger.logDebug("SessionService::getSessionDataExt()/this.currentSessData:", this.currentSessData)
        if(this.currentSessData.length > 0){
            const consumerGuid = this.currentSessData[0].consumerGuid;
            this.logger.logDebug("SessionService::getSessionDataExt()/06")
            this.logger.logDebug("SessionService::getSessionDataExt()/consumerGuid:", consumerGuid)
            const cuid = this.currentSessData[0].currentUserId;
            this.logger.logDebug("SessionService::getSessionDataExt()/07")
            this.logger.logDebug("SessionService::getSessionDataExt()/cuid:", cuid)
            const userData = await svUser.getUserByID(req, res, cuid)
            this.logger.logDebug("SessionService::getSessionDataExt()/08")
            this.logger.logDebug("SessionService::getSessionDataExt()/userData:", userData)
            this.currentUserData = userData[0];
            this.logger.logDebug("SessionService::getSessionDataExt()/09")
            this.logger.logDebug("SessionService::getSessionDataExt()/this.currentUserData:", this.currentUserData)
            this.currentUserProfile = await svUser.existingUserProfile(req, res, cuid);
            this.logger.logDebug("SessionService::getSessionDataExt()/10")
            this.logger.logDebug("SessionService::getSessionDataExt()/this.currentUserProfile:", this.currentUserProfile)
            this.currentConsumerData = await svConsumer.getConsumerI(req, res, { where: { consumerGuid: consumerGuid } });
            this.logger.logDebug("SessionService::getSessionDataExt()/11")
            this.logger.logDebug("SessionService::getSessionDataExt()/this.currentConsumerData:", this.currentConsumerData)
            this.currentCompanyData = await svConsumer.getCompanyData(req, res, consumerGuid);
            this.logger.logDebug("SessionService::getSessionDataExt()/11")
            this.logger.logDebug("SessionService::getSessionDataExt()/this.currentCompanyData:", this.currentCompanyData)
    
            // Compose session data object
            const retSessionData = {
                currentUser: userData[0],
                currentUserProfile: this.currentUserProfile,
                currentSession: this.currentSessData[0],
                currentConsumer: this.currentConsumerData[0],
                currentCompany: this.currentCompanyData[0],
            };
            this.logger.logDebug("SessionService::getSessionDataExt()/12")
            this.logger.logDebug("SessionService::getSessionDataExt()/cuid:", cuid)
    
            if (!ignoreCache) {
                this.logger.logDebug("SessionService::getSessionDataExt()/13")
                // Set the TTL to 1 hour (3600 seconds)
                const ttl = Number(config.cacheTtl)
                // Store the session data in Redis for future requests (set a TTL of 1 hour)
                // await this.redisService.set(cacheKey, JSON.stringify(retSessionData), ttl);
                await this.redisService.set(cacheKey, safeStringify(retSessionData), ttl);
            }
            this.logger.logDebug("SessionService::getSessionDataExt()/14")
            this.logger.logDebug("SessionService::getSessionDataExt()/retSessionData:", retSessionData)
            // Return the freshly fetched session data
            return await retSessionData;
        } else {
            return null;
        }
        
    }
}