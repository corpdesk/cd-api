/**
 * Entity that consumes corpdesk services is refered to as consumer
 * Resources that the consumer has subscribed to are consumerResources
 * An entity can consume resources are root, developer, user etc. These are managed by consumerTypes
 */

//  consumer_resource_id, consumer_resource_guid, doc_id, cd_obj_type_id,
//  consumer_resource_enabled, consumer_id, obj_id, cd_obj_id, consumer_resource_type_id,
//  consumer_guid, obj_guid, cd_obj_guid, consumer_resource_type_guid

import { BaseService } from '../../base/base.service';
import { CdService } from '../../base/cd.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
// import { ModuleModel } from '../models/module.model';
import { CreateIParams, IQuery, IRespInfo, IServiceInput, IUser } from '../../base/IBase';
import { ConsumerResourceModel } from '../models/consumer-resource.model';
// import { ModuleViewModel } from '../models/module-view.model';
import { ConsumerResourceViewModel } from '../models/consumer-resource-view.model';
import { ConsumerResourceTypeModel } from '../models/consumer-resource-type.model';
import { CdObjTypeModel } from '../models/cd-obj-type.model';
import { ConsumerModel } from '../models/consumer.model';
import { CdObjService } from './cd-obj.service';
import { ModuleModel } from '../models/module.model';
import { UserModel } from '../../user/models/user.model';
import { CdObjModel } from '../models/cd-obj.model';
// import { ConsumerResourceViewModel } from '../models/company-view.model';

export class ConsumerResourceService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: ConsumerResourceModel;
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        // required: ['cdObjTypeId', 'consumerId', 'objId'],
        // noDuplicate: ['objId', 'consumerId']
        required: ['consumerGuid', 'cdObjGuid', 'consumerResourceTypeId'],
        noDuplicate: ['consumerGuid', 'cdObjGuid']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new ConsumerResourceModel();
    }

    // /**
    //  * In the example below we are registering booking module as a resource to emp services
    //  * This allows users registered under empservices to access booking module when appropriate privileges are given
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "ConsumerResource",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                          "cd_obj_type_id": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b", // module
    //                          "consumer_id": "B0B3DA99-1859-A499-90F6-1E3F69575DCD", // emp services
    //                          "obj_id": "8D4ED6A9-398D-32FE-7503-740C097E4F1F" // recource (module) id...in this case: booking module
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
        console.log('ConsumerResourceService::create::validateCreate()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: ConsumerResourceModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create company',
                dSource: 1,
            }
            console.log('ConsumerResourceService::create()/serviceInput:', serviceInput)
            console.log('ConsumerResourceService::create()/req.post:', JSON.stringify(req.post))
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new company created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('moduleman/create::validateCreate()/02')
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<ConsumerResourceModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async companyExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: ConsumerResourceModel,
            docName: 'ConsumerResourceService::companyExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        // cRules: any = {
        //     required: ['cd_obj_type_id', 'consumer_id', 'obj_id'],
        //     noDuplicate: ['obj_id', 'consumer_id']
        // };
        // consumer_resource_id, consumer_resource_guid, doc_id, cd_obj_type_id,
        // consumer_resource_enabled, consumer_id, obj_id, cd_obj_id, consumer_resource_type_id,
        // consumer_guid, obj_guid, cd_obj_guid, consumer_resource_type_guid

        // const pl: ConsumerModel = this.b.getPlData(req, res);
        // console.log('moduleman/create::beforeCreate()/this.company:', this.company);
        // this.b.setPlData(req, { key: 'consumerName', value: this.company.companyName });
        // this.b.setPlData(req, { key: 'companyId', value: this.company.companyId });
        // this.b.setPlData(req, { key: 'companyGuid', value: pl.companyGuid });
        // this.b.setPlData(req, { key: 'consumerGuid', value: this.b.getGuid()});
        // this.b.setPlData(req, { key: 'consumerEnabled', value: true });

        console.log('ConsumerResourceService::beforeCreate::validateCreate()/01')
        this.b.setPlData(req, { key: 'consumerResourceGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'consumerResourceEnabled', value: true });

        // get cdObj:
        const cdObjModel = CdObjModel;
        const pl: ConsumerResourceModel = this.b.getPlData(req);
        let q: IQuery = { where: { cdObjGuid: pl.cdObjGuid } };
        const cdObjData: CdObjModel[] = await this.b.get(req, res, cdObjModel, q);
        console.log('ConsumerResourceService::beforeCreate::validateCreate()/02')
        console.log('ConsumerResourceService::beforeCreate::validateCreate()/cdObjData:', cdObjData)
        this.b.setPlData(req, { key: 'consumberResourceName', value: cdObjData[0].cdObjName });
        this.b.setPlData(req, { key: 'cdObjId', value: cdObjData[0].cdObjId});
        // get consumer
        const consumerModel = ConsumerModel;
        q = { select: ['consumerId'], where: { consumerGuid: pl.consumerGuid } };
        const consumerData: ConsumerModel[] = await this.b.get(req, res, consumerModel, q);
        console.log('ConsumerResourceService::beforeCreate::validateCreate()/03')
        this.b.setPlData(req, { key: 'consumerId', value: consumerData[0].consumerId });

        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    update(req, res) {
        // console.log('ConsumerResourceService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: ConsumerResourceModel,
            docName: 'ConsumerResourceService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('ConsumerResourceService::update()/02')
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
        if (q.update.consumerResourceEnabled === '') {
            q.update.consumerResourceEnabled = null;
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
        console.log('moduleman/ConsumerResourceService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: ConsumerResourceModel,
        }
        this.b.i.code = 'ConsumerResourceService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.log('moduleman/ConsumerResourceService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('moduleman/ConsumerResourceService::validateCreate()/03')
                ret = true;
            } else {
                console.log('moduleman/ConsumerResourceService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/ConsumerResourceService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('moduleman/ConsumerResourceService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the cdObjTypeId referenced exists
        const pl: ConsumerResourceModel = this.b.getPlData(req);
        // if ('cdObjTypeGuid' in pl) {
        //     console.log('moduleman/ConsumerResourceService::validateCreate()/07')
        //     console.log('moduleman/ConsumerResourceService::validateCreate()/pl:', pl)
        //     const serviceInput = {
        //         serviceModel: CdObjTypeModel,
        //         docName: 'ConsumerResourceService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { cdObjTypeId: pl.cdObjTypeGuid } }
        //         },
        //         dSource: 1
        //     }
        //     console.log('moduleman/ConsumerResourceService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     console.log('moduleman/ConsumerResourceService::validateCreate()/r:', r)
        //     if (r.length > 0) {
        //         console.log('moduleman/ConsumerResourceService::validateCreate()/08')
        //         ret = true;
        //     } else {
        //         console.log('moduleman/ConsumerResourceService::validateCreate()/10')
        //         ret = false;
        //         this.b.i.app_msg = `cdobj type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //         this.b.setAppState(false, this.b.i, svSess.sessResp);
        //     }
        // } else {
        //     console.log('moduleman/ConsumerResourceService::validateCreate()/11')
        //     // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     // this.b.err.push(this.b.i.app_msg);
        //     //////////////////
        //     this.b.i.app_msg = `cdObjTypeGuid is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        //     this.b.setAppState(false, this.b.i, svSess.sessResp);
        // }
        //////////////////////////////////////////////////////////////////////////
        // 3. confirm the consumerId referenced exists
        if ('consumerGuid' in pl) {
            console.log('moduleman/ConsumerResourceService::validateCreate()/12')
            console.log('moduleman/ConsumerResourceService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: ConsumerModel,
                docName: 'ConsumerResourceService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { consumerGuid: pl.consumerGuid } }
                },
                dSource: 1
            }
            console.log('moduleman/ConsumerResourceService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
            const r: any = await this.b.read(req, res, serviceInput)
            console.log('moduleman/ConsumerResourceService::validateCreate()/r:', r)
            if (r.length > 0) {
                console.log('moduleman/ConsumerResourceService::validateCreate()/13')
                ret = true;
            } else {
                console.log('moduleman/ConsumerResourceService::validateCreate()/14')
                ret = false;
                this.b.i.app_msg = `consumer reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/ConsumerResourceService::validateCreate()/15')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `consumerGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        // //////////////////////////////////////////////////////////////////////////
        // 4. confirm the objGuid referenced exists
        if ('cdObjGuid' in pl) {
            console.log('moduleman/ConsumerResourceService::validateCreate()/16')
            console.log('moduleman/ConsumerResourceService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CdObjModel,
                docName: 'ConsumerResourceService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { cdObjGuid: pl.cdObjGuid } }
                },
                dSource: 1
            }
            console.log('moduleman/ConsumerResourceService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
            const r: any = await this.b.read(req, res, serviceInput)
            console.log('moduleman/ConsumerResourceService::validateCreate()/r:', r)
            if (r.length > 0) {
                console.log('moduleman/ConsumerResourceService::validateCreate()/17')
                ret = true;
            } else {
                console.log('moduleman/ConsumerResourceService::validateCreate()/18')
                ret = false;
                this.b.i.app_msg = `cd-obj reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/ConsumerResourceService::validateCreate()/19')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `cdObjGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        // //////////////////////////////////////////////////////////////////////////
        console.log('ConsumerResourceService::getConsumerResource/20');
        if (this.b.err.length > 0) {
            console.log('moduleman/ConsumerResourceService::validateCreate()/21')
            ret = false;
        }
        return ret;
    }

    async getConsumerResource(req, res) {
        const q = this.b.getQuery(req);
        console.log('ConsumerResourceService::getConsumerResource/f:', q);
        const serviceInput = {
            serviceModel: ConsumerResourceModel,
            docName: 'ConsumerResourceService::getConsumerResource$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('ConsumerResourceService::read$()/r:', r)
                    this.b.i.code = 'ConsumerResourceController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('ConsumerResourceService::read$()/e:', e)
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

    async getConsumerResourceType(req, res) {
        const q = this.b.getQuery(req);
        console.log('ConsumerResourceService::getConsumerResource/f:', q);
        const serviceInput = {
            serviceModel: ConsumerResourceTypeModel,
            docName: 'ConsumerResourceService::getConsumerResourceType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('ConsumerResourceService::read$()/r:', r)
                    this.b.i.code = 'ConsumerResourceController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('ConsumerResourceService::read$()/e:', e)
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

    getConsumerResourceCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('ConsumerResourceService::getConsumerResourceCount/q:', q);
        const serviceInput = {
            serviceModel: ConsumerResourceViewModel,
            docName: 'ConsumerResourceService::getConsumerResourceCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'ConsumerResourceController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getConsumerResourceTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('ConsumerResourceService::getConsumerResourceCount/q:', q);
        const serviceInput = {
            serviceModel: ConsumerResourceTypeModel,
            docName: 'ConsumerResourceService::getConsumerResourceCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'ConsumerResourceController::Get';
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
        console.log('ConsumerResourceService::delete()/q:', q)
        const serviceInput = {
            serviceModel: ConsumerResourceModel,
            docName: 'ConsumerResourceService::delete',
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
}