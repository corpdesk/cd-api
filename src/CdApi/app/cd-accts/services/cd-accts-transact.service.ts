
import { BaseService } from '../../../sys/base/base.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { CdService } from '../../../sys/base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { from, Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { CdAcctsAccountViewModel } from '../models/cd-accts-account-view.model';
import { CdAcctsTransactModel } from '../models/cd-accts-transact.model';
// import { CdAcctsAccountViewModel } from '../models/cdAcctsTransact-view.model';

export class CdAcctsTransactService extends CdService {
    sqliteDb;
    sqliteModels = [];
    err: string[] = []; // error messages
    b: any; // instance of CdAcctsTransactService
    cdToken: string;
    serviceModel: CdAcctsTransactModel;
    sessModel;

    /*
     * create rules
     */
    cRules: any = {
        required: [
            'cdAcctsAccountId',
            'credit', 'debit',
            'cdAcctsTransactStateId',
            'cdAcctsTransactMediaId',
            'cdAcctsCurrencyId',
            'cdAcctsTransactTypeId',
            'companyId',
            'cdAcctsTransactAmount',
            'cdAcctsTransactParentId'],
        noDuplicate: [
            'cdAcctsTransactName',
            'cdAcctsTransactId'
        ]
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdAcctsTransactModel();
    }

    async create(req, res) {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdAcctsTransactModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Transact',
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
    //                         "cdAcctsTransactName": "myBill3",
    //                         "cdAcctsTransactGuid": "qyuiop",
    //                         "cdAcctsTransactDescription": "oiuwah"
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
                serviceModel: CdAcctsTransactModel,
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

    async createI(req, res, createIParams: CreateIParams): Promise<CdAcctsTransactModel | boolean> {
        console.log('CdAcctsIntInvoiceService::createI()/01')
        console.log('CdAcctsIntInvoiceService::createI()/createIParams:', createIParams)
        createIParams.controllerData.cdAcctsTransactGuid = this.b.getGuid();
        console.log('CdAcctsIntInvoiceService::createI()/createIParams2:', createIParams)
        const ret = await this.b.createI(req, res, createIParams)
        console.log('CdAcctsIntInvoiceService::createI()/ret:', ret)
        return ret;
    }

    async cdAcctsTransactExists(req, res, params): Promise<any> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::cdAcctsTransactExists',
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

    /**
     * if invoice transaction,
     * if IsPartialPayment 
     * @returns 
     */
     async getTransactionState(): Promise<number> {
        return 598
    }

    async getTransactionMedia(): Promise<number> {
        return 603
    }

    async getTransactionCurrency(): Promise<number> {
        return 592
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdAcctsTransactGuid', value: this.b.getGuid() });
        return true;
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdAcctsTransactGuid', value: this.b.getGuid() });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsTransactService::getBill/q:', q);
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdAcctsTransactService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsTransactService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsTransactService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsTransactService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsTransactService::getBill/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsTransactService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsTransactService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsTransactService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsTransactService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
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
    //                             "cdAcctsTransactGuid": "azimio3"
    //                         },
    //                         "where": {
    //                             "cdAcctsTransactId": 8
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
        console.log('CdAcctsTransactService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsTransactService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    updateI(req, res, q): Observable<any> {
        console.log('CdAcctsTransactService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsTransactService::update()/02')
        return this.b.update$(req, res, serviceInput)
    }

    updateSL(req, res) {
        console.log('CdAcctsTransactService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsTransactService::update()/02')
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
        if (q.update.cdAcctsTransactEnabled === '') {
            q.update.cdAcctsTransactEnabled = null;
        }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.cdAcctsTransactEnabled === '') {
            q.update.cdAcctsTransactEnabled = null;
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
    //                             "cdAcctsTransactId": 8
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
        console.log('CdAcctsTransactService::getBill/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsTransactService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsTransactService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsTransactService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsTransactService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    async getBillSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsTransactService::getBill/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsTransactService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsTransactService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsTransactService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsTransactService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    // getBillType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdAcctsTransactService::getCompany/f:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsTransactService::getCompanyType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 console.log('CdAcctsTransactService::read$()/r:', r)
    //                 this.b.i.code = 'CompanyController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('CdAcctsTransactService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'CdAcctsTransactService:update',
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
    //                             "cdAcctsTransactName",
    //                             "cdAcctsTransactGuid"
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
        console.log('CdAcctsTransactService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsTransactService::Get';
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
        console.log('CdAcctsTransactService::getViewPaged()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::getViewPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsTransactService::getViewPaged';
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
        console.log('CdAcctsTransactService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsTransactService::Get';
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
    //     console.log('CdAcctsTransactService::getCompanyCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsTransactService::getCompanyCount$',
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
        console.log('CdAcctsTransactService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::delete',
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
        console.log('CdAcctsTransactService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsTransactModel,
            docName: 'CdAcctsTransactService::delete',
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
                serviceModel: CdAcctsTransactModel,
                docName: 'CdAcctsTransactService::getMeta',
                cmd: null,
                dSource: 1
            }
            this.b.cdResp.data = await this.b.getEntityPropertyMapSL(req, res, CdAcctsTransactModel);
            this.b.sqliteConn.close();
            this.b.respond(req, res)
        } catch (e) {
            console.log('CdAcctsTransactService::getMeta()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsTransactService:getMeta',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }
}