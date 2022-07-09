
import { BaseService } from '../../../sys/base/base.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { CdService } from '../../../sys/base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { CdAcctsAccountModel } from '../models/cd-accts-account.model';
import { from, Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { CdAcctsAccountViewModel } from '../models/cd-accts-account-view.model';
import { CdAcctsTransactModel } from '../models/cd-accts-transact.model';
import { CdAcctsTransactService } from './cd-accts-transact.service';
import { CompanyService } from '../../../sys/moduleman/services/company.service';
// import { CompanyViewModel } from '../../../sys/moduleman/models/company-view.model';
import { CompanyModel } from '../../../sys/moduleman/models/company.model';
import { CdAcctsAccountTypeModel } from '../models/cd-accts-account-type.model';
// import { CdAcctsAccountViewModel } from '../models/cdAcctsAccount-view.model';

export class CdAcctsAccountService extends CdService {
    sqliteDb;
    sqliteModels = [];
    err: string[] = []; // error messages
    b: any; // instance of CdAcctsAccountService
    cdToken: string;
    serviceModel: CdAcctsAccountModel;
    sessModel;

    /*
     * create rules
     */
    cRules: any = {
        required: [
            'cdAcctsAccountName',
            'parentId',
            'cdAcctsAccountTypeId',
            'companyId',
            'clientId',
            'vendorId'
        ],
        noDuplicate: [
            'cdAcctsAccountName',
            'cdAcctsAccountId'
        ]
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdAcctsAccountModel();
    }

    async create(req, res) {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdAcctsAccountModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Account',
                dSource: 1,
            }
            const result = await this.b.create(req, res, serviceInput)
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = result;
            const r = await this.b.respond(req, res);
        } else {
            const r = await this.b.respond(req, res);
        }
    }



    // /**
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "Bill",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "cdAcctsAccountName": "myBill3",
    //                         "cdAcctsAccountGuid": "qyuiop",
    //                         "cdAcctsAccountDescription": "oiuwah"
    //                     }
    //                 }
    //             ],
    //             "token": "fc735ce6-b52f-4293-9332-0181a49231c4"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async createSL(req, res) {
        const svSess = new SessionService();
        await this.b.initSqlite(req, res)
        if (await this.validateCreateSL(req, res)) {
            await this.beforeCreateSL(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdAcctsAccountModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Bill',
                dSource: 1,
            }
            const result = await this.b.createSL(req, res, serviceInput)
            this.b.sqliteConn.close();
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = result;
            const r = await this.b.respond(req, res);
        } else {
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<CdAcctsAccountModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async cdAcctsAccountExists(req, res, params): Promise<any> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::cdAcctsAccountExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput)
        // if (ret.length > 0){
        //     return true;
        // } else {
        //     return false;
        // }
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdAcctsAccountGuid', value: this.b.getGuid() });
        return true;
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdAcctsAccountGuid', value: this.b.getGuid() });
        const cdAcctsTransactQuery = req.post.dat.f_vals[0].cdAcctsTransact;
        const svCdAcctsTransact = new CdAcctsTransactService();
        const si = {
            serviceInstance: svCdAcctsTransact,
            serviceModel: CdAcctsTransactModel,
            serviceModelInstance: svCdAcctsTransact.serviceModel,
            docName: 'CdAcctsAccountService::beforeCreate',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: cdAcctsTransactQuery
        }
        let ret = false;
        const cdAcctsTransactData: any = await svCdAcctsTransact.createI(req, res, createIParams)
        if (cdAcctsTransactData) {
            console.log('CdAcctsAccountService::beforeCreate()/cdAcctsTransactData:', cdAcctsTransactData)
            this.b.setPlData(req, { key: 'cdAcctsTransactId', value: cdAcctsTransactData.cdAcctsTransactId });
            ret = true;
        } else {
            this.b.i.app_msg = `duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`
            this.b.err.push(this.b.i.app_msg);
            ret = false;
        }
        return ret;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getBill/q:', q);
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdAcctsAccountService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsAccountService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsAccountService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsAccountService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getBill/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsAccountService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsAccountService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsAccountService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsAccountService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // /**
    //  *
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "Bill",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "cdAcctsAccountGuid": "azimio3"
    //                         },
    //                         "where": {
    //                             "cdAcctsAccountId": 8
    //                         }
    //                     }
    //                 }
    //             ],
    //             "token": "fc735ce6-b52f-4293-9332-0181a49231c4"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    update(req, res) {
        console.log('CdAcctsAccountService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsAccountService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    updateI(req, res, q): Observable<any> {
        console.log('CdAcctsAccountService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsAccountService::update()/02')
        return this.b.update$(req, res, serviceInput)
    }

    updateSL(req, res) {
        console.log('CdAcctsAccountService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsAccountService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
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
        if (q.update.cdAcctsAccountEnabled === '') {
            q.update.cdAcctsAccountEnabled = null;
        }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.cdAcctsAccountEnabled === '') {
            q.update.cdAcctsAccountEnabled = null;
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
        return true;
    }

    async validateCreateSL(req, res) {
        return true;
    }

    // /**
    //  *
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "Bill",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {
    //                             "cdAcctsAccountId": 8
    //                         }
    //                     }
    //                 }
    //             ],
    //             "token": "fc735ce6-b52f-4293-9332-0181a49231c4"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async getBill(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getBill/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsAccountService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsAccountService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsAccountService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsAccountService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getCdAcctsAccountI(req, res, q) {
        const serviceInput: IServiceInput = {
            serviceInstance: new CdAcctsAccountModel(),
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsIntInvoiceService::getAccountIdByVendorId',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput)
    }

    async getBillSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getBill/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsAccountService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsAccountService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsAccountService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsAccountService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    // getBillType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdAcctsAccountService::getCompany/f:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsAccountService::getCompanyType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 console.log('CdAcctsAccountService::read$()/r:', r)
    //                 this.b.i.code = 'CompanyController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('CdAcctsAccountService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'CdAcctsAccountService:update',
    //             app_msg: ''
    //         };
    //         this.b.serviceErr(req, res, e, i.code)
    //         this.b.respond(req, res)
    //     }
    // }

    // /**
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "Bill",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "select": [
    //                             "cdAcctsAccountName",
    //                             "cdAcctsAccountGuid"
    //                         ],
    //                         "where": {},
    //                         "take": 5,
    //                         "skip": 0
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    getPaged(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsAccountService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    // /**
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "Bill",
    //         "a": "BillViewPaged",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {},
    //                         "take": 5,
    //                         "skip": 0
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    getViewPaged(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getViewPaged()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::getViewPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsAccountService::getViewPaged';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getPagedSL(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsAccountService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    // getCompanyTypeCount(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdAcctsAccountService::getCompanyCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsAccountService::getCompanyCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'CompanyController::Get';
    //             const svSess = new SessionService();
    //             svSess.sessResp.cd_token = req.post.dat.token;
    //             svSess.sessResp.ttl = svSess.getTtl();
    //             this.b.setAppState(true, this.b.i, svSess.sessResp);
    //             this.b.cdResp.data = r;
    //             this.b.respond(req, res)
    //         })
    // }

    delete(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.deleteSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    deleteSL(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsAccountService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.deleteSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    async getMeta(req, res) {
        try {
            const serviceInput = {
                serviceModel: CdAcctsAccountModel,
                docName: 'CdAcctsAccountService::getMeta',
                cmd: null,
                dSource: 1
            }
            this.b.cdResp.data = await this.b.getEntityPropertyMapSL(req, res, CdAcctsAccountModel);
            this.b.sqliteConn.close();
            this.b.respond(req, res)
        } catch (e) {
            console.log('CdAcctsAccountService::getMeta()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsAccountService:getMeta',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async vendorHasAccount(req, res, vId) {
        console.log('CdAcctsAccountSerice::vendorHasAccount()/01')
        const q = { where: { vendorId: vId } };
        console.log('CdAcctsAccountService::vendorHasAccount/f:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::vendorHasAccount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        const accountArr: CdAcctsAccountModel[] = await this.b.read(req, res, serviceInput)
        if (accountArr.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    async clientIsRegisteredAccount(req, res, vId, cId) {
        console.log('CdAcctsAccountSerice::clientIsRegisteredAccount()/01')
        const q = { where: { vendorId: vId, clientId: cId } };
        console.log('CdAcctsAccountService::clientIsRegisteredAccount/f:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::clientIsRegisteredAccount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        const accountArr: CdAcctsAccountModel[] = await this.b.read(req, res, serviceInput)
        if (accountArr.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * - vendor must have a registered account
     * - client must be registered as vendor child
     * - there should not be multiple registrations
     * @param vendorId 
     * @param clientId 
     * @returns 
     */
    async validateAccounts(req, res, vId, cId) {
        console.log('CdAcctsAccountSerice::beforeCreate()/01')
        let countInvalid = 0;
        const account = {
            client: null,
            vendor: null
        }
        if (await this.vendorHasAccount(req, res, vId) === false) {
            account.vendor = await this.registerAccount(req, res, vId, -1, 'vendor')
        } else {
            const q = { where: { vendorId: vId, clientId: -1 } }
            account.vendor = await this.getAccount(req, res, q)
        }
        if (await this.clientIsRegisteredAccount(req, res, vId, cId) === false) {
            account.client = await this.registerAccount(req, res, vId, cId, 'client')
        } else {
            const q = { where: { vendorId: vId, clientId: cId } }
            account.client = await this.getAccount(req, res, q)
        }
        console.log('CdAcctsAccountSerice::beforeCreate()/account:', account)
        return account;
    }

    async registerAccount(req, res, vId, cId, accountTypeName) {
        console.log('CdAcctsAccountSerice::registerAccount()/01')
        let filter = {};
        let pId = -1; // parentId
        let cr = null
        let dt = null
        switch (accountTypeName) {
            case 'vendor':
                filter = { companyId: vId }
                // cId = -1;
                pId = -1;
                break;
            case 'client':
                filter = { companyId: cId }
                pId = vId;
                break;
        }
        // get vendor details
        const q = { where: filter };
        console.log('CdAcctsAccountService::registerVendor/f:', q);
        const serviceInput = {
            serviceModel: CompanyModel,
            docName: 'CdAcctsAccountService::registerVendor$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        const companyArr: CompanyModel[] = await this.b.read(req, res, serviceInput)
        const accountTypeArr = await this.getAccountTypeByName(req, res, accountTypeName)
        const accountTypeId = accountTypeArr[0].cdAcctsAccountTypeId
        // new Error().lineNumber
        console.log('CdAcctsAccountService::registerVendor/companyArr:', companyArr);
        console.log('CdAcctsAccountService::registerVendor/companyArr.length:', companyArr.length);
        if (companyArr.length > 0) {
            console.log('CdAcctsAccountSerice::registerAccount()/02')
            // register vendor as account
            const accountQuery: CdAcctsAccountModel = {
                cdAcctsAccountGuid: this.b.getGuid(),
                cdAcctsAccountDescription: '',
                cdAcctsCoaId:-1,
                credit: cr,
                debit: dt,
                cdAcctsAccountName: companyArr[0].companyName,
                parentId: pId,
                cdAcctsAccountTypeId: accountTypeId,
                companyId: vId,
                clientId: cId,
                vendorId: vId
            };
            const si = {
                serviceInstance: this,
                serviceModel: CdAcctsAccountModel,
                serviceModelInstance: this.serviceModel,
                docName: 'CdAcctsAccountService::beforeCreate',
                dSource: 1,
            }
            const createIParams: CreateIParams = {
                serviceInput: si,
                controllerData: accountQuery
            }
            let ret = false;
            return await this.createI(req, res, createIParams)
        } else {
            // accountTypeName
            console.log('CdAcctsAccountSerice::registerAccount()/03')
            console.log('CdAcctsAccountSerice::registerAccount()/q2:', q)
            console.log('CdAcctsAccountSerice::registerAccount()/companyArr:', companyArr)
            console.log('CdAcctsAccountSerice::registerAccount()/accountTypeName:', accountTypeName)
            await this.b.serviceErr(req, res, 'the client or vendor is invalid', 'BillController:Create');
        }

    }

    async getAccountTypeByName(req, res, accountTypeName): Promise<CdAcctsAccountTypeModel[]> {
        console.log('CdAcctsAccountSerice::getAccountTypeByName()/01')
        const q = { where: { cdAcctsAccountTypeName: accountTypeName } };
        console.log('CdAcctsAccountService::getAccountTypeByName/f:', q);
        // const serviceInput = {
        //     serviceModel: CdAcctsAccountTypeModel,
        //     docName: 'CdAcctsAccountService::getAccountTypeByName',
        //     cmd: {
        //         action: 'find',
        //         query: q
        //     },
        //     dSource: 1
        // }
        return await this.getAccountType(req, res, q)
    }

    async getAccount(req, res, q): Promise<CdAcctsAccountModel[]> {
        console.log('CdAcctsAccountSerice::getAccount()/01')
        console.log('CdAcctsAccountService::getAccount/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountModel,
            docName: 'CdAcctsAccountService::getAccount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        let ret;
        try{
            ret = await this.b.read(req, res, serviceInput)
            console.log('CdAcctsAccountService::getAccount/ret:', ret);
            return ret;
        } catch(e){
            await this.b.serviceErr(req, res, 'encountered a problem reading accounts', 'CdAcctsAccountService:getAccount');
        }
        
    }

    async getAccountType(req, res, q): Promise<CdAcctsAccountTypeModel[]> {
        console.log('CdAcctsAccountSerice::getAccountType()/01')
        // const q = { where: { cdAcctsAccountTypeName: accountTypeName } };
        console.log('CdAcctsAccountService::getAccountType/f:', q);
        const serviceInput = {
            serviceModel: CdAcctsAccountTypeModel,
            docName: 'CdAcctsAccountService::getAccountType',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        return await this.b.read(req, res, serviceInput)
    }

}