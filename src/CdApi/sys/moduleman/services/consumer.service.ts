/**
 * Entity that consumes corpdesk services is refered to as consumer
 * Resources that the consumer has subscribed to are consumerResources
 * An entity can consume resources are root, developer, user etc. These are managed by consumerTypes
 */
import { BaseService } from '../../base/base.service';
import { CdService } from '../../base/cd.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
// import { ModuleModel } from '../models/module.model';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../base/IBase';
import { ConsumerModel } from '../models/consumer.model';
// import { ModuleViewModel } from '../models/module-view.model';
import { ConsumerViewModel } from '../models/consumer-view.model';
import { ConsumerTypeModel } from '../models/consumer-type.model';
import { Observable } from 'rxjs';
import { ConsumerResourceViewModel } from '../models/consumer-resource-view.model';
import { CompanyViewModel } from '../models/company-view.model';
import { CompanyModel } from '../models/company.model';
import { CompanyService } from './company.service';
import { Logging } from '../../base/winston.log';
// import { ConsumerViewModel } from '../models/consumer-view.model';

export class ConsumerService extends CdService {
    logger: Logging;
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: ConsumerModel;
    sessModel;
    // moduleModel: ModuleModel;
    company: CompanyModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['companyId'],
        noDuplicate: ['companyId']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.logger = new Logging();
        this.serviceModel = new ConsumerModel();
        // this.moduleModel = new ModuleModel();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Consumer",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "consumerGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
    //                     }
    //                 }
    //             ],
    //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async create(req, res) {
        this.logger.logInfo('ConsumerServices/create::validateCreate()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: ConsumerModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create consumer',
                dSource: 1,
            }
            this.logger.logInfo('ConsumerService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new consumer created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            this.logger.logInfo('moduleman/create::validateCreate()/02')
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<ConsumerModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async consumerExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::consumerExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        const pl: ConsumerModel = this.b.getPlData(req);
        this.logger.logInfo('moduleman/create::beforeCreate()/pl:', pl);
        this.logger.logInfo('moduleman/create::beforeCreate()/this.company:', this.company);
        this.b.setPlData(req, { key: 'consumerName', value: this.company.companyName });
        this.b.setPlData(req, { key: 'companyGuid', value: this.company.companyGuid });
        this.b.setPlData(req, { key: 'companyId', value: pl.companyId });
        this.b.setPlData(req, { key: 'consumerGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'consumerEnabled', value: true });
        return true;
    }

    getCompanyData(req, res, consGuid: string): Promise<CompanyModel[]> {
        this.logger.logInfo('moduleman/create::getCompanyData()/coGuid:', {coGuid:consGuid});
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerModel,
            docName: 'CompanyService::getCompany$',
            cmd: {
                action: 'find',
                query: { where: { consumerGuid: consGuid } }
            },
            dSource: 1
        }
        return this.b.read(req, res, serviceInput)
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    update(req, res) {
        // this.logger.logInfo('ConsumerService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // this.logger.logInfo('ConsumerService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.consumerEnabled === '') {
            q.update.consumerEnabled = null;
        }
        return q;
    }

    async remove(req, res) {
        //
    }

    /**
     * methods for transaction rollback
     */
    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbDelete(): number {
        return 1;
    }

    async validateCreate(req, res) {
        this.logger.logInfo('moduleman/ConsumerService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: ConsumerModel,
        }
        this.b.i.code = 'ConsumerService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                this.logger.logInfo('moduleman/ConsumerService::validateCreate()/03')
                ret = true;
            } else {
                this.logger.logInfo('moduleman/ConsumerService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('moduleman/ConsumerService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // // 2. confirm the consumerTypeGuid referenced exists
        const pl: ConsumerModel = this.b.getPlData(req);
        this.logger.logInfo('moduleman/ConsumerService::validateCreate()/pl:', pl)
        if ('companyId' in pl) {
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/07')
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CompanyModel,
                docName: 'ConsumerService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { companyId: pl.companyId } }
                },
                dSource: 1
            }
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/serviceInput:', serviceInput)
            const r: any = await this.b.read(req, res, serviceInput)
            this.company = r[0];
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/r:', r)
            if (r.length > 0) {
                this.logger.logInfo('moduleman/ConsumerService::validateCreate()/08')
                ret = true;
            } else {
                this.logger.logInfo('moduleman/ConsumerService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `company reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/11')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `companyGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        this.logger.logInfo('ConsumerService::getConsumer/12');
        if (this.b.err.length > 0) {
            this.logger.logInfo('moduleman/ConsumerService::validateCreate()/13')
            ret = false;
        }
        return ret;
    }

    async getConsumer(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('ConsumerService::getConsumer/f:', q);
        const serviceInput = {
            serviceModel: ConsumerViewModel,
            docName: 'ConsumerService::getConsumer$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    this.logger.logInfo('ConsumerService::read$()/r:', r)
                    this.b.i.code = 'ConsumerController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('ConsumerService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getConsumerType(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('ConsumerService::getConsumer/f:', q);
        const serviceInput = {
            serviceModel: ConsumerTypeModel,
            docName: 'ConsumerService::getConsumerType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    this.logger.logInfo('ConsumerService::read$()/r:', r)
                    this.b.i.code = 'ConsumerController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('ConsumerService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    getConsumerCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('ConsumerService::getConsumerCount/q:', q);
        const serviceInput = {
            serviceModel: ConsumerViewModel,
            docName: 'ConsumerService::getConsumerCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'ConsumerController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getConsumerQB(req, res) {
        console.log('ConsumerService::getConsumerQB()/1')
        this.b.entityAdapter.registerMappingFromEntity(ConsumerViewModel);
        const q = this.b.getQuery(req);
        // console.log('MenuService::getModuleCount/q:', q);
        const serviceInput = {
            serviceModel: ConsumerViewModel,
            docName: 'ConsumerService::getConsumerQB',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        
        this.b.readQB$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = serviceInput.docName;
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getConsumerTypeCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('ConsumerService::getConsumerCount/q:', q);
        const serviceInput = {
            serviceModel: ConsumerTypeModel,
            docName: 'ConsumerService::getConsumerCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'ConsumerController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    delete(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('ConsumerService::delete()/q:', q)
        const serviceInput = {
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    getConsumerByGuid$(req, res, consmGuid): Observable<ConsumerModel[]> {
        // this.logger.logInfo('starting getConsumerByGuid(req, res, consmGuid)');
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::getConsumerByGuid',
            cmd: {
                action: 'find',
                query: { where: { consumerGuid: consmGuid } }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput);
    }

    async getConsumerByGuid(req, res, consmGuid): Promise<any> {
        // this.logger.logInfo('starting getConsumerByGuid(req, res, consmGuid)');
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::getConsumerByGuid',
            cmd: {
                action: 'find',
                query: { where: { consumerGuid: consmGuid } }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput);
    }

    async getIDByGuid(consumerGuid) {
        return [{}];
    }

    async isConsumerResource(req, res, params) {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerResourceViewModel,
            docName: 'ConsumerService::isConsumerResource',
            cmd: {
                action: 'count',
                query: { where: params }
            },
            dSource: 1,
        }
        const result = await this.b.read(req, res, serviceInput);
        if (result > 0) {
            return true;
        } else {
            return false;
        }
    }

    getConsumerGuid(req) {
        this.logger.logInfo('ConsumerService::getConsumerGuid()/req.post', req.post)
        return req.post.dat.f_vals[0].data.consumerGuid;
    }

    async consumerGuidIsValid(req, res, consumerGuid: string = null): Promise<boolean> {
        this.logger.logInfo('ConsumerService::consumerGuidIsValid()/01')
        const svConsumer = new ConsumerService()
        let consGuid = null
        if (consumerGuid) {
            this.logger.logInfo('ConsumerService::consumerGuidIsValid()/02')
            const plData = await this.b.getPlData(req)
            consGuid = plData.consumerGuid
        } else {
            this.logger.logInfo('ConsumerService::consumerGuidIsValid()/03')
            consGuid = this.b.getReqToken(req)
        }
        const consumerData: ConsumerModel[] = await svConsumer.getConsumerByGuid(req, res, consGuid)
        if (consumerData.length > 0) {
            this.logger.logInfo('ConsumerService::consumerGuidIsValid()/04')
            return true;
        } else {
            this.logger.logInfo('ConsumerService::consumerGuidIsValid()/05')
            return false;
        }
    }

    async activeCompany(req, res) {
        //use token to get consumer_guid
        const svConsumer = new ConsumerService();
        const svCompany = new CompanyService();
        const svSess = new SessionService();
        const consumerData: ConsumerModel[] = await this.getConsumerGuidByToken(req, res);
        this.logger.logInfo('ConsumerService::activeCompany()/consumerData:', consumerData)
        let companyData = [];
        let companyGuid = null;
        let coId = null;
        if (consumerData.length > 0) {
            this.logger.logInfo('ConsumerService::activeCompany()/consumerData[0].companyId:', {companyId: consumerData[0].companyId})
            coId = consumerData[0].companyId;
            return await svCompany.getCompany(req, res, { where: { companyId: coId } })
        } else {
            return Promise.resolve([])
        }
    }

    async activeConsumer(req, res) {
        //use token to get consumer_guid
        const svConsumer = new ConsumerService();
        const svCompany = new CompanyService();
        const svSess = new SessionService();
        const consumerData: ConsumerModel[] = await this.getConsumerGuidByToken(req, res);
        this.logger.logInfo('ConsumerService::activeCompany()/consumerData:', consumerData)
        let companyData = [];
        let companyGuid = null;
        let coId = null;
        if (consumerData.length > 0) {
            this.logger.logInfo('ConsumerService::activeCompany()/consumerData[0].companyId:', {companyId:consumerData[0].companyId})
            return consumerData
        } else {
            return Promise.resolve([])
        }
    }

    async getConsumerGuidByToken(req, res): Promise<ConsumerModel[]> {
        const svSess = new SessionService()
        const sess = await svSess.getSession(req, res)
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::getConsumerGuidByToken',
            cmd: {
                action: 'find',
                query: { where: { consumerGuid: sess[0].consumerGuid } }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }
}