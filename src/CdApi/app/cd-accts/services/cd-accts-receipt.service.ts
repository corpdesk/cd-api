
import { BaseService } from '../../../sys/base/base.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { CdService } from '../../../sys/base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { CdAcctsReceiptModel } from '../models/cd-accts-receipt.model';
import { from, Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { CdAcctsAccountViewModel } from '../models/cd-accts-account-view.model';
import { CdAcctsTransactModel } from '../models/cd-accts-transact.model';
import { CdAcctsTransactService } from './cd-accts-transact.service';
import { CdAcctsAccountService } from './cd-accts-account.service';
import { CdAcctsAccountModel } from '../models/cd-accts-account.model';
import { CdAcctsIntInvoiceService } from './cd-accts-int-invoice.service';
import { CdAcctsIntInvoiceModel } from '../models/cd-accts-int-invoice.model';
// import { CdAcctsAccountViewModel } from '../models/cdAcctsReceipt-view.model';

export class CdAcctsReceiptService extends CdService {
    sqliteDb;
    sqliteModels = [];
    err: string[] = []; // error messages
    b: any; // instance of CdAcctsReceiptService
    cdToken: string;
    serviceModel: CdAcctsReceiptModel;
    sessModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cdAcctsReceiptName', 'cdAcctsReceiptRate', 'cdAcctsReceiptUnit', 'cdAcctsReceiptType'],
        noDuplicate: ['cdAcctsReceiptName', 'cdAcctsReceiptId']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdAcctsReceiptModel();
    }

    async create(req, res) {
        console.log('CdAcctsReceipt::create()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdAcctsReceiptModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Receipt',
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
    //                         "cdAcctsReceiptName": "myBill3",
    //                         "cdAcctsReceiptGuid": "qyuiop",
    //                         "cdAcctsReceiptDescription": "oiuwah"
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
                serviceModel: CdAcctsReceiptModel,
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

    async createI(req, res, createIParams: CreateIParams): Promise<CdAcctsReceiptModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async cdAcctsReceiptExists(req, res, params): Promise<any> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::cdAcctsReceiptExists',
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
        this.b.setPlData(req, { key: 'cdAcctsReceiptGuid', value: this.b.getGuid() });
        return true;
    }

    async beforeCreate(req, res): Promise<any> {
        console.log('CdAcctsReceipt::beforeCreate()/01')
        const svTransact = new CdAcctsTransactService()
        console.log('CdAcctsReceipt::beforeCreate()/02')
        await this.b.setPlData(req, { key: 'cdAcctsReceiptGuid', value: this.b.getGuid() });
        console.log('CdAcctsReceipt::beforeCreate()/03')
        // get invoice details
        const transactI = new CdAcctsTransactService();
        const invoiceI = new CdAcctsIntInvoiceService()
        const invoiceId = await this.b.getPlData(req).cdAcctsIntInvoiceId 
        const receiptAmount = await this.b.getPlData(req).cdAcctsReceiptAmount 
        const q = { where: { cdAcctsIntInvoiceId: invoiceId } }
        const invoiceArr: CdAcctsIntInvoiceModel[] = await invoiceI.getIntInvoiceI(req, res, q)
        const invoice = invoiceArr[0]
        // get account id of vendor from vendorId
        const svAccount = new CdAcctsAccountService()
        const qVendor = { where: { vendorId: invoice.vendorId, clientId: -1 } }
        console.log('CdAcctsReceiptService::beforeCreate()/qVendor:', qVendor)
        const accountVendor: CdAcctsAccountModel[] = await svAccount.getAccount(req, res, qVendor)
        console.log('CdAcctsReceiptService::beforeCreate()/accountVendor:', accountVendor)
        
        // get acccount id of client from clientId
        const qClient = { where: { vendorId: invoice.vendorId, clientId: invoice.clientId } }
        console.log('CdAcctsReceiptService::beforeCreate()/qClient:', qClient)
        const accountClient: CdAcctsAccountModel[] = await svAccount.getAccount(req, res, qClient)
        console.log('CdAcctsReceiptService::beforeCreate()/accountClient:', accountClient)

        // set cdAcctsTransactName for vendor
        await this.b.setPlData(req, { key: 'cdAcctsTransactName', value: invoice.cdAcctsIntInvoiceName }, 'CdAcctsTransactVendor');
        // set cdAcctsTransactName for client
        await this.b.setPlData(req, { key: 'cdAcctsTransactName', value: invoice.cdAcctsIntInvoiceName }, 'CdAcctsTransactClient');

        //////////
        // currentBalance = get total paid against this invoice so far
        // this payment
        //////////////

        // set cdAcctsTransactDescription for vendor
        await this.b.setPlData(req, { key: 'cdAcctsTransactDescription', value: invoice.cdAcctsIntInvoiceDescription }, 'CdAcctsTransactVendor');
        // set cdAcctsTransactDescription for client
        await this.b.setPlData(req, { key: 'cdAcctsTransactDescription', value: invoice.cdAcctsIntInvoiceDescription }, 'CdAcctsTransactClient');

        // set cdAcctsIntInvoiceId for vendor
        await this.b.setPlData(req, { key: 'cdAcctsIntInvoiceId', value: invoiceId }, 'CdAcctsTransactVendor');
        // set cdAcctsIntInvoiceId for client
        await this.b.setPlData(req, { key: 'cdAcctsIntInvoiceId', value: invoiceId }, 'CdAcctsTransactClient');

        // "credit": false,
        await this.b.setPlData(req, { key: 'credit', value: false}, 'CdAcctsTransactVendor');
        // "debit": true
        await this.b.setPlData(req, { key: 'debit', value: true}, 'CdAcctsTransactVendor');

        // "credit": true,
        await this.b.setPlData(req, { key: 'credit', value: true}, 'CdAcctsTransactClient');
        // "debit": false
        await this.b.setPlData(req, { key: 'debit', value: false}, 'CdAcctsTransactClient');

        // set cdAcctsTransactAmount for vendor
        await this.b.setPlData(req, { key: 'cdAcctsTransactAmount', value: receiptAmount }, 'CdAcctsTransactVendor');
        // set cdAcctsTransactAmount for client
        await this.b.setPlData(req, { key: 'cdAcctsTransactAmount', value: receiptAmount }, 'CdAcctsTransactClient');

        // set cdAcctsAccountId for vendor
        await this.b.setPlData(req, { key: 'cdAcctsAccountId', value: accountVendor[0].cdAcctsAccountId }, 'CdAcctsTransactVendor');
        // set cdAcctsAccountId for client
        await this.b.setPlData(req, { key: 'cdAcctsAccountId', value: accountClient[0].cdAcctsAccountId }, 'CdAcctsTransactClient');

        // set cdAcctsTransactStateId for client
        const transactState = await transactI.getTransactionState(593, 'CdAcctsReceiptService::beforeCreate')
        console.log('CdAcctsReceiptService::beforeCreate()/transactState:', transactState)
        await this.b.setPlData(req, { key: 'cdAcctsTransactStateId', value: transactState }, 'CdAcctsTransactVendor');
        // set cdAcctsTransactStateId for client
        await this.b.setPlData(req, { key: 'cdAcctsTransactStateId', value: transactState }, 'CdAcctsTransactClient');

        // set cdAcctsCurrencyId for vendor
        await this.b.setPlData(req, { key: 'cdAcctsCurrencyId', value: await transactI.getTransactionCurrency() }, 'CdAcctsTransactVendor');
        // set cdAcctsCurrencyId for client
        await this.b.setPlData(req, { key: 'cdAcctsCurrencyId', value: await transactI.getTransactionCurrency() }, 'CdAcctsTransactClient');

        // set companyId for vendor
        await this.b.setPlData(req, { key: 'companyId', value: accountVendor[0].companyId }, 'CdAcctsTransactVendor');
        // set companyId for client
        await this.b.setPlData(req, { key: 'companyId', value: accountVendor[0].companyId }, 'CdAcctsTransactClient');

        // set cdAcctsIntInvoiceParentId for vendor
        await this.b.setPlData(req, { key: 'cdAcctsTransactParentId', value: -1 }, 'CdAcctsTransactVendor');
        await this.b.setPlData(req, { key: 'cdAcctsTransactParentId', value: -1 }, 'CdAcctsTransactClient');

        // transact vendor
        const tVendor: CdAcctsTransactModel = await svTransact.transactReceipt(req, res, req.post.dat.f_vals[0].CdAcctsTransactVendor)
        // set transaction ref for vendor
        await this.b.setPlData(req, { key: 'cdAcctsTransactVendorId', value: tVendor.cdAcctsTransactId });
        // transact client
        const tClient: CdAcctsTransactModel = await svTransact.transactReceipt(req, res, req.post.dat.f_vals[0].CdAcctsTransactClient)
        // set transaction ref for client
        await this.b.setPlData(req, { key: 'cdAcctsTransactClientId', value: tClient.cdAcctsTransactId });

        console.log('CdAcctsReceiptService::beforeCreate()/req.post.dat.f_vals[0]:', req.post.dat.f_vals[0])

        return {
            transactVendor: tVendor,
            transactClient: tClient
        }
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsReceiptService::getBill/q:', q);
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdAcctsReceiptService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsReceiptService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsReceiptService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsReceiptService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsReceiptService::getBill/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsReceiptService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsReceiptService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsReceiptService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsReceiptService:update',
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
    //                             "cdAcctsReceiptGuid": "azimio3"
    //                         },
    //                         "where": {
    //                             "cdAcctsReceiptId": 8
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
        console.log('CdAcctsReceiptService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsReceiptService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    updateI(req, res, q): Observable<any> {
        console.log('CdAcctsReceiptService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsReceiptService::update()/02')
        return this.b.update$(req, res, serviceInput)
    }

    updateSL(req, res) {
        console.log('CdAcctsReceiptService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsReceiptService::update()/02')
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
        if (q.update.cdAcctsReceiptEnabled === '') {
            q.update.cdAcctsReceiptEnabled = null;
        }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.cdAcctsReceiptEnabled === '') {
            q.update.cdAcctsReceiptEnabled = null;
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
    //                             "cdAcctsReceiptId": 8
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
    async getReceipt(req, res) {
        const q = this.b.getQuery(req);
        console.log('CdAcctsReceiptService::getBill/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsReceiptService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsReceiptService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsReceiptService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsReceiptService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getBillSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsReceiptService::getBill/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsReceiptService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsReceiptService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsReceiptService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsReceiptService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // getBillType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdAcctsReceiptService::getCompany/f:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsReceiptService::getCompanyType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 console.log('CdAcctsReceiptService::read$()/r:', r)
    //                 this.b.i.code = 'CompanyController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('CdAcctsReceiptService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'CdAcctsReceiptService:update',
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
    //                             "cdAcctsReceiptName",
    //                             "cdAcctsReceiptGuid"
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
        console.log('CdAcctsReceiptService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsReceiptService::Get';
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
        console.log('CdAcctsReceiptService::getViewPaged()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::getViewPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsReceiptService::getViewPaged';
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
        console.log('CdAcctsReceiptService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsReceiptService::Get';
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
    //     console.log('CdAcctsReceiptService::getCompanyCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsReceiptService::getCompanyCount$',
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
        console.log('CdAcctsReceiptService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::delete',
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
        console.log('CdAcctsReceiptService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsReceiptModel,
            docName: 'CdAcctsReceiptService::delete',
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
                serviceModel: CdAcctsReceiptModel,
                docName: 'CdAcctsReceiptService::getMeta',
                cmd: null,
                dSource: 1
            }
            this.b.cdResp.data = await this.b.getEntityPropertyMapSL(req, res, CdAcctsReceiptModel);
            this.b.sqliteConn.close();
            this.b.respond(req, res)
        } catch (e) {
            console.log('CdAcctsReceiptService::getMeta()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsReceiptService:getMeta',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }
}