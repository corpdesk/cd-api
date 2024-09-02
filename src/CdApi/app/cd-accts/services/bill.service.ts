
import { BaseService } from '../../../sys/base/base.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { CdService } from '../../../sys/base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { BillModel } from '../models/bill.model';
import { from, Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { BillViewModel } from '../models/bill-view.model';
import { CdAcctsIntInvoiceModel } from '../models/cd-accts-int-invoice.model';
import { CdAcctsIntInvoiceService } from './cd-accts-int-invoice.service';
import { CdAcctsAccountService } from './cd-accts-account.service';

export class BillService extends CdService {
    sqliteDb;
    sqliteModels = [];
    err: string[] = []; // error messages
    b: any; // instance of BillService
    cdToken: string;
    serviceModel: BillModel;
    sessModel;
    isInitial; // the first time a bill is created other than being amended

    /*
     * create rules
     */
    cRules: any = {
        required: [
            'billName',
            'billRate',
            'billUnit',
            'billType',
            'clientId',
            'vendorId',
            'billDate',
            'billTax',
            'billCost'
        ],
        noDuplicate: ['billName', 'billId']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new BillModel();
    }

    /**
     * {
             "ctx": "App",
             "m": "cd-accts",
             "c": "Bill",
             "a": "Create",
             "dat": {
                 "f_vals": [
                     {
                         "data": {
                             "billName": "myBill9",
                             "billDescription": "vzkle",
                             "billRate": 30, 
                             "billUnit": 14, 
                             "billType": 3,
                             "clientId": 85, 
                             "vendorId": 111162, 
                             "billDate": "2022-03-25 00:00:00",
                             "billTax": 0.18,
                             "billDiscount": 0.1, 
                             "billCost": 2020
                         }
                     }
                 ],
                 "token": "fc735ce6-b52f-4293-9332-0181a49231c4"
             },
             "args": {}
         }
     *  - check if vendor & client has acct/account while creating bill
        - set vendor/acct-account as parent while creating bill
        - set client/acct-account as child
        - create account while creating bill with client/acct-account as hiearchial parent
        - create accts/invoice while creating a bill
     * @param req 
     * @param res 
     */
    async create(req, res) {
        console.log('BillService::create()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            const account = await this.beforeCreate(req, res);
            console.log('BillService::create()/account:', account)
            const serviceInput = {
                serviceInstance: this,
                serviceModel: BillModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Bill',
                dSource: 1,
            }
            const result = await this.b.create(req, res, serviceInput)
            console.log('BillService::create()/afterResult:', result)
            const afterResult = await this.afterCreate(req, res, result)
            console.log('BillService::create()/afterResult:', afterResult)
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = afterResult;
            const r = await this.b.respond(req, res);
        } else {
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<BillModel | boolean> {
        console.log('BillService::createI()/createI()/01')
        if (await this.validateCreateI(req, res, createIParams)) {
            console.log('BillService::createI()/02')
            const account = await this.beforeCreateI(req, res, createIParams);
            console.log('BillService::createI()/account:', account)
            const result = this.b.createI(req, res, createIParams)
            const afterResult = await this.afterCreate(req, res, result)
            console.log('BillService::createI()/afterResult:', afterResult)
            return afterResult;
        } else {
            const r = await this.b.respond(req, res);
        }
    }

    async validateCreateI(req, res, createIParams) {
        console.log('BillService::validateCreateI()/01')
        let countInvalid = 0;
        // const validRequired = await this.b.validateRequired(req, res, this.cRules)
        // console.log('BillService::validateCreateI()/validRequired:', validRequired)

        // confirm that controllerData conforms to this.cRules
        this.cRules.required.forEach((fieldName) => {
            if (!(fieldName in createIParams.controllerData)) { // required field is missing
                countInvalid++;
            }
        })
        if (countInvalid > 0) {
            return true;
        } else {
            return false;
        }
    }

    async beforeCreateI(req, res, createIParams: CreateIParams): Promise<any> {
        console.log('BillService::beforeCreate()/01')
        // this.b.setPlData(req, { key: 'billGuid', value: this.b.getGuid() });
        /**
         *  - check if vendor & client has acct/account while creating bill
            - set vendor/acct-account as parent while creating bill
            - set client/acct-account as child
            - create account while creating bill with client/acct-account as hiearchial parent
            - create accts/invoice while creating a bill
         */
        const pl = createIParams.controllerData;
        console.log('BillService::beforeCreate()/pl:', pl)
        const vendorId = pl.vendorId;
        const clientId = pl.clientId;
        let countInvalid = 0;
        const svAccount = new CdAcctsAccountService();
        const account = await svAccount.validateAccounts(req, res, vendorId, clientId)
        console.log('BillService::beforeCreate()/account:', account)
        return account;
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
    //                         "billName": "myBill3",
    //                         "billGuid": "qyuiop",
    //                         "billDescription": "oiuwah"
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
                serviceModel: BillModel,
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

    async billExists(req, res, params): Promise<any> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: BillModel,
            docName: 'BillService::billExists',
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
        this.b.setPlData(req, { key: 'billGuid', value: this.b.getGuid() });
        return true;
    }

    async beforeCreate(req, res): Promise<any> {
        console.log('BillService::beforeCreate()/01')
        this.b.setPlData(req, { key: 'billGuid', value: this.b.getGuid() });
        /**
         *  - check if vendor & client has acct/account while creating bill
            - set vendor/acct-account as parent while creating bill
            - set client/acct-account as child
            - create account while creating bill with client/acct-account as hiearchial parent
            - create accts/invoice while creating a bill
         */
        const pl = this.b.getPlData(req);
        const vendorId = pl.vendorId;
        const clientId = pl.clientId;
        let countInvalid = 0;
        const svAccount = new CdAcctsAccountService();
        const account = await svAccount.validateAccounts(req, res, vendorId, clientId)
        console.log('BillService::beforeCreate()/account:', account)
        return account;
    }

    /**
     * sync bill with cd-invoice
     * @param req 
     * @param res 
     * @param createResult 
     * @returns 
     */
    async afterCreate(req, res, newBill: BillModel): Promise<any> {
        console.log('BillService::afterCreate()/01')
        console.log('BillService::afterCreate()/newBill:', await newBill)
        const nb = await newBill;
        /**
         *  - confirm bill is not double entry on invoice
         *  - create or update accts/invoice while creating a bill
         */
        const invoice: CdAcctsIntInvoiceModel = {
            cdAcctsIntInvoiceName: nb.billName,
            cdAcctsIntInvoiceDescription: nb.billDescription,
            cdAcctsIntInvoiceGuid: this.b.getGuid(),
            vendorId: nb.vendorId,
            clientId: nb.clientId,
            cdAcctsIntInvoiceTax: nb.billTax,
            cdAcctsIntInvoiceDiscount: nb.billDiscount,
            cdAcctsIntInvoiceCost: nb.billCost
        }
        console.log('BillService::afterCreate()/invoice:', invoice)
        const svInvoice = new CdAcctsIntInvoiceService();
        const si = {
            serviceInstance: svInvoice,
            serviceModel: CdAcctsIntInvoiceModel,
            serviceModelInstance: svInvoice.serviceModel,
            docName: 'BillService/afterCreate',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: invoice
        }
        console.log('BillService::afterCreate()/02')
        const invoiceData: any = await svInvoice.createI(req, res, createIParams)
        console.log('BillService::afterCreate()/invoiceData:', await invoiceData)
        const update = await this.setInvoiceId(req, res, await invoiceData[0], nb)
        console.log('BillService::afterCreate()/update:', update)

        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: BillModel,
            docName: 'BillService::billExists',
            cmd: {
                action: 'find',
                query: { where: { billId: nb.billId } }
            },
            dSource: 1,
        }
        console.log('BillService::afterCreate/serviceInput:', serviceInput);
        const ret = await this.b.read(req, res, serviceInput)
        console.log('BillService::afterCreate/ret:', ret);
        return ret;
    }

    async setInvoiceId(req, res, invoiceData:CdAcctsIntInvoiceModel, newBill) {
        console.log('BillService::getBill/01');
        if(invoiceData){
            const invoice = invoiceData;
            const q = {
                update: {
                    cdAcctsIntInvoiceId: invoice.cdAcctsIntInvoiceId
                },
                where: {
                    billId: newBill.billId
                }
            }
            console.log('BillService::setInvoiceId/q:', q);
            return await this.updateI(req, res, q);
        } else {
            const e = 'could not get invoice data'
            this.b.err.push(e);
            const i = {
                messages: this.b.err,
                code: 'BillService:setInvoiceId',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
        
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillService::getBill/q:', q);
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('BillService::read$()/r:', r)
                    this.b.i.code = 'BillService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillService::getBill/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('BillService::read$()/r:', r)
                    this.b.i.code = 'BillService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillService:update',
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
    //                             "billGuid": "azimio3"
    //                         },
    //                         "where": {
    //                             "billId": 8
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
        console.log('BillService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('BillService::update()/02')
        this.b.updateSL$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    async updateI(req, res, q): Promise<any> {
        console.log('BillService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('BillService::update()/02')
        return this.b.update(req, res, serviceInput)
    }

    updateSL(req, res) {
        console.log('BillService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('BillService::update()/02')
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
        if (q.update.billEnabled === '') {
            q.update.billEnabled = null;
        }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.billEnabled === '') {
            q.update.billEnabled = null;
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
        console.log('BillService::validateCreate()/01')
        const validRequired = await this.b.validateRequired(req, res, this.cRules)
        console.log('BillService::validateCreate()/validRequired:', validRequired)
        return validRequired;
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
    //                             "billId": 8
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
        console.log('BillService::getBill/q:', q);
        const serviceInput = {
            serviceModel: BillViewModel,
            docName: 'BillService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('BillService::read$()/r:', r)
                    this.b.i.code = 'BillService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getBillSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillService::getBill/q:', q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('BillService::read$()/r:', r)
                    this.b.i.code = 'BillService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // getBillType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('BillService::getCompany/f:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'BillService::getCompanyType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 console.log('BillService::read$()/r:', r)
    //                 this.b.i.code = 'CompanyController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('BillService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'BillService:update',
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
    //                             "billName",
    //                             "billGuid"
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
        console.log('BillService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'BillService::Get';
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
        console.log('BillService::getViewPaged()/q:', q);
        const serviceInput = {
            serviceModel: BillViewModel,
            docName: 'BillService::getViewPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'BillService::getViewPaged';
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
        console.log('BillService::getBillCount()/q:', q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::getBillCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'BillService::Get';
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
    //     console.log('BillService::getCompanyCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'BillService::getCompanyCount$',
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
        console.log('BillService::delete()/q:', q)
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::delete',
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
        console.log('BillService::delete()/q:', q)
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillService::delete',
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
                serviceModel: BillModel,
                docName: 'BillService::getMeta',
                cmd: null,
                dSource: 1
            }
            this.b.cdResp.data = await this.b.getEntityPropertyMapSL(req, res, BillModel);
            this.b.sqliteConn.close();
            this.b.respond(req, res)
        } catch (e) {
            console.log('BillService::getMeta()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillService:getMeta',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }
}