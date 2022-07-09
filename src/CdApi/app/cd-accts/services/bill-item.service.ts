
import { BaseService } from '../../../sys/base/base.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { CdService } from '../../../sys/base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { BillItemModel } from '../models/bill-item.model';
import { from, Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { BillItemViewModel } from '../models/bill-item-view.model';
import { BillModel } from '../models/bill.model';
import { BillService } from './bill.service';
import { exists } from 'fs';
import { CdAcctsIntInvoiceModel } from '../models/cd-accts-int-invoice.model';
import { CdAcctsIntInvoiceService } from './cd-accts-int-invoice.service';
import { CdAcctsTransactService } from './cd-accts-transact.service';
import { CdAcctsTransactModel } from '../models/cd-accts-transact.model';
import { CdAcctsAccountService } from './cd-accts-account.service';
import { CdAcctsAccountModel } from '../models/cd-accts-account.model';

export class BillItemService extends CdService {
    sqliteDb;
    sqliteModels = [];
    err: string[] = []; // error messages
    b: any; // instance of BillItemService
    cdToken: string;
    serviceModel: BillItemModel;
    sessModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['billName', 'billRate', 'billUnit', 'billType'],
        noDuplicate: ['billName', 'billId']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new BillItemModel();
    }

    // // /**
    // //  *
    // //  * {
    //         "ctx": "App",
    //         "m": "cd-accts",
    //         "c": "BillItem",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "bill": {
    //                         "billId": null,
    //                         "billGuid": "",
    //                         "billName": "jolanx",
    //                         "billDescription": "mkln",
    //                         "clientId": "12",
    //                         "vendorId": 111162,
    //                         "billDate": "2022-03-17 00:00:00",
    //                         "billTax": "1260",
    //                         "billDiscount": "0",
    //                         "billCost": "8260",
    //                         "companyName": "",
    //                         "postalAddress": "",
    //                         "email": "",
    //                         "action": ""
    //                     },
    //                     "data": {
    //                         "billItemId": null,
    //                         "billItemGuid": "",
    //                         "billItemName": "jukg",
    //                         "billItemDescription": "",
    //                         "billItemDate": "2022-04-03 00:00:00",
    //                         "docId": -1,
    //                         "billRateId": "2",
    //                         "billUnitId": "3",
    //                         "billTypeId": -1,
    //                         "billId": -1,
    //                         "billRateAmount": "1000",
    //                         "billUnitName": -1,
    //                         "clientId": -1,
    //                         "companyName": "",
    //                         "postalAddress": "",
    //                         "physicalLocation": "",
    //                         "email": "",
    //                         "units": "7",
    //                         "billUnitShort": -1,
    //                         "billUnitRate": -1,
    //                         "billRateShort": -1,
    //                         "cost": "7000"
    //                     }
    //                 }
    //             ],
    //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //         },
    //         "args": {}
    //     }
    // //  * @param req
    // //  * @param res
    // //  */
    async create(req, res) {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: BillItemModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create BillItem',
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
    //         "c": "BillItem",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "billName": "myBillItem3",
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
                serviceModel: BillItemModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create BillItem',
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

    async createI(req, res, createIParams: CreateIParams): Promise<BillItemModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async billExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: BillItemModel,
            docName: 'BillItemService::billExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreateSL(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'billGuid', value: this.b.getGuid() });
        return true;
    }

    async beforeCreate(req, res): Promise<any> {
        let ret = false;
        const billQuery: BillModel = req.post.dat.f_vals[0].bill;
        if (this.isInitial(req, res)) {
            console.log('BillItemsService::beforeCreate/isInitial = true;')
            const billData = await this.createBillI(req, res, billQuery);
            console.log('BillItemService::beforeCreate()/billData1:', billData)
            if (billData) {
                console.log('BillItemService::beforeCreate()/billData:', billData)
                console.log('BillItemService::beforeCreate()/billData[0].billId:', billData[0].billId)
                this.b.setPlData(req, { key: 'billId', value: billData[0].billId });
                this.b.setPlData(req, { key: 'billGuid', value: billData[0].billGuid });
                ret = true;
            } else {
                this.b.i.app_msg = `duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`
                this.b.err.push(this.b.i.app_msg);
                ret = false;
            }

        } else {
            console.log('BillItemsService::beforeCreate/isInitial = false;')
            const svBill = new BillService();
            const params = { filter: { billGuid: req.post.dat.f_vals[0].bill.billGuid } }
            const reqBill = req.post.dat.f_vals[0].bill
            const dbBillData = await svBill.billExists(req, res, params)
            if (dbBillData.length > 0) {
                console.log('BillItemService::beforeCreate()/dbBillData:', dbBillData)
                console.log('BillItemService::beforeCreate()/req.post:', JSON.stringify(req.post))
                console.log('BillItemService::beforeCreate()/req.post.dat.f_vals[0].bill.billGuid:', req.post.dat.f_vals[0].bill.billGuid)
                console.log('BillItemService::beforeCreate()/value: req.post.dat.f_vals[0].bill.billGuid:', req.post.dat.f_vals[0].bill.billGuid)
                this.b.setPlData(req, { key: 'billGuid', value: reqBill.billGuid });
                this.b.setPlData(req, { key: 'billId', value: dbBillData[0].billId });
                const updateBill = await this.updateBill(req, res, reqBill)
                console.log('BillItemService::beforeCreate()/updateBill:', updateBill)
                const updateInvoice = await this.updateInvoice(req, res, reqBill)
                console.log('BillItemService::beforeCreate()/updateInvoice:', updateInvoice)
                const updateTransaction = await this.updateTransaction(req, res, reqBill)
                console.log('BillItemService::beforeCreate()/updateTransaction:', updateTransaction)
            } else {
                await this.b.serviceErr(req, res, 'billGuid is invalid', 'BillItemService:beforeCreate')
            }
        }
        return ret;
    }

    async createBillI(req, res, billQuery) {
        billQuery.billGuid = this.b.getGuid();
        const svBill = new BillService();
        const si = {
            serviceInstance: svBill,
            serviceModel: BillModel,
            serviceModelInstance: svBill.serviceModel,
            docName: 'beforeCreate/beforeCreate',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: billQuery
        }
        return await svBill.createI(req, res, createIParams)
    }

    async getBillData(req, res, filter) {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: BillModel,
            docName: 'BillService::billExists',
            cmd: {
                action: 'find',
                query: filter
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput)
    }

    isInitial(req, res) {
        let ret = false;
        const billData: BillModel = req.post.dat.f_vals[0].bill;
        if (this.b.isEmpty(billData.billGuid)) {
            ret = true;
        }
        return ret;
    }

    async updateBill(req, res, reqBill) {
        const svBill = new BillService();
        const qBill = {
            update: {
                billName: reqBill.billName,
                billDescription: reqBill.billDescription,
                clientId: reqBill.clientId,
                vendorId: reqBill.vendorId,
                billDate: reqBill.billDate,
                billTax: reqBill.billTax,
                billDiscount: reqBill.billDiscount,
                billCost: reqBill.billCost
            },
            where: {
                billGuid: reqBill.billGuid
            }
        }
        return await svBill.updateI(req, res, qBill)
    }

    async getBill(req, res, q): Promise<BillModel[]> {
        console.log('BillItemSerice::getBill()/01')
        // const q = { where: { cdAcctsAccountTypeName: accountTypeName } };
        console.log('BillItemSerice::getBill/f:', q);
        const serviceInput = {
            serviceModel: BillModel,
            docName: 'BillItemSerice::getBill',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        return await this.b.read(req, res, serviceInput)
    }

    async getInvoice(req, res, filter) {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'BillService::getInvoice',
            cmd: {
                action: 'find',
                query: filter
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput)
    }

    async getTransact(req, res, filter) {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdAcctsTransactModel,
            docName: 'BillService::getTransact',
            cmd: {
                action: 'find',
                query: filter
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput)
    }

    async updateInvoice(req, res, reqBill) {
        const svInvoice = new CdAcctsIntInvoiceService()
        const filter = { where: { billGuid: reqBill.billGuid } }
        console.log('BillItemService::beforeCreate()/filter:', filter)
        const existingBill = await this.getBillData(req, res, filter)
        console.log('BillItemService::beforeCreate()/existingBill:', existingBill)
        const qInvoice = {
            update: {
                cdAcctsIntInvoiceName: reqBill.billName,
                cdAcctsIntInvoiceDescription: reqBill.billDescription,
                vendorId: reqBill.vendorId,
                clientId: reqBill.clientId,
                cdAcctsIntInvoiceTax: reqBill.billTax,
                cdAcctsIntInvoiceDiscount: reqBill.billDiscount,
                cdAcctsIntInvoiceCost: reqBill.billCost
            },
            where: {
                cdAcctsIntInvoiceId: existingBill[0].cdAcctsIntInvoiceId
            }
        }
        const updatedRet = await svInvoice.updateI(req, res, qInvoice)
        console.log('BillItemService::beforeCreate()/updatedRet:', updatedRet)
    }

    async updateTransaction(req, res, reqBill: BillModel) {
        console.log('BillItemService::updateTransaction()/reqBill:', reqBill)
        // get latest bill by guid
        const billArr: BillModel[] = await this.getBill(req, res, { where: { billGuid: reqBill.billGuid } })
        if (billArr.length > 0) {
            reqBill = billArr[0]
            console.log('BillItemService::updateTransaction()/reqBill2:', reqBill)
            // get invoice data
            const invoiceFilter = { where: { cdAcctsIntInvoiceId: reqBill.cdAcctsIntInvoiceId } }
            const invoiceArr: CdAcctsIntInvoiceModel[] = await this.getInvoice(req, res, invoiceFilter)
            console.log('BillItemService::updateTransaction()/invoiceArr:', invoiceArr)
            const invoice = invoiceArr[0];
            // get vendor account
            const svAccount = new CdAcctsAccountService()
            const qVendor = { where: { vendorId: invoice.vendorId, clientId: -1 } }
            console.log('BillItemService::updateTransaction()/qVendor:', qVendor)
            const accountVendor: CdAcctsAccountModel[] = await svAccount.getAccount(req, res, qVendor)
            console.log('BillItemService::updateTransaction()/accountVendor:', accountVendor)
            const qClient = { where: { vendorId: invoice.vendorId, clientId: invoice.clientId } }
            console.log('BillItemService::updateTransaction()/qClient:', qClient)
            const accountClient: CdAcctsAccountModel[] = await svAccount.getAccount(req, res, qClient)
            console.log('BillItemService::updateTransaction()/accountClient:', accountClient)

            const mediaId = '', 
            action = ''

            // update vendor transation
            const svTransact = new CdAcctsTransactService()
            let q = {
                update: {
                    cdAcctsTransactName: invoice.cdAcctsIntInvoiceName,
                    cdAcctsTransactDescription: invoice.cdAcctsIntInvoiceDescription,
                    cdAcctsAccountId: accountVendor[0].cdAcctsAccountId,
                    cdAcctsTransactMediaId: await svTransact.getTransactionMedia(), // 603,
                    cdAcctsTransactStateId: await svTransact.getTransactionState(mediaId, action), // transact state = 'invoiced'
                    cdAcctsCurrencyId: await svTransact.getTransactionCurrency(), // 592,
                    companyId: reqBill.vendorId,
                    cdAcctsTransactAmount: invoice.cdAcctsIntInvoiceCost,
                    cdAcctsTransactParentId: -1 // can be used to link transactions that are related eg invoice and tax
                },
                where: { cdAcctsTransactId: invoice.cdAcctsTransactVendorId }
            }
            const updatedVendorRet = await svTransact.updateI(req, res, q)
            console.log('BillItemService::beforeCreate()/updatedRet:', updatedVendorRet)
            // update client transaction
            q = {
                update: {
                    cdAcctsTransactName: invoice.cdAcctsIntInvoiceName,
                    cdAcctsTransactDescription: invoice.cdAcctsIntInvoiceDescription,
                    cdAcctsAccountId: accountClient[0].cdAcctsAccountId,
                    cdAcctsTransactMediaId: await svTransact.getTransactionMedia(), // 603,
                    cdAcctsTransactStateId: await svTransact.getTransactionState(mediaId, action), // transact state = 'invoiced'
                    cdAcctsCurrencyId: await svTransact.getTransactionCurrency(), // 592,
                    companyId: reqBill.clientId,
                    cdAcctsTransactAmount: invoice.cdAcctsIntInvoiceCost,
                    cdAcctsTransactParentId: -1 // can be used to link transactions that are related eg invoice and tax
                },
                where: { cdAcctsTransactId: invoice.cdAcctsTransactClientId }
            }
            const updatedClientRet = await svTransact.updateI(req, res, q)
            console.log('BillItemService::beforeCreate()/updatedRet:', updatedClientRet)
        } else {
            const e = 'bill data is incomplete or invalid'
            this.b.err.push(e);
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItem/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('BillItemService::read$()/r:', r)
                    this.b.i.code = 'BillItemService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillItemService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItem/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('BillItemService::read$()/r:', r)
                    this.b.i.code = 'BillItemService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillItemService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
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
    //         "c": "BillItem",
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
        console.log('BillItemService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('BillItemService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    updateSL(req, res) {
        console.log('BillItemService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('BillItemService::update()/02')
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
        /**
         * if initial, then, svBill.beforeCreateI()
         */
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
    //         "c": "BillItem",
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
    async getBillItem(req, res) {
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItem/q:', q);
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::getBillItem',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('BillItemService::read$()/r:', r)
                    this.b.i.code = 'BillItemService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillItemService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getBillItemSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItem/q:', q);
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::getBillItem',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('BillItemService::read$()/r:', r)
                    this.b.i.code = 'BillItemService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillItemService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getBillItemView(req, res) {
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItem/q:', q);
        const serviceInput = {
            serviceModel: BillItemViewModel,
            docName: 'BillItemService::getBillItem',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe(async (r) => {
                    // console.log('BillItemService::read$()/r:', r)
                    this.b.i.code = 'BillItemService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillItemService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getBillItemViewSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItem/q:', q);
        const serviceInput = {
            serviceModel: BillItemViewModel,
            docName: 'BillItemService::getBillItem',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe(async (r) => {
                    // console.log('BillItemService::read$()/r:', r)
                    this.b.i.code = 'BillItemService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    await this.b.connSLClose()
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('BillItemService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // getBillItemType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('BillItemService::getCompany/f:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'BillItemService::getCompanyType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 console.log('BillItemService::read$()/r:', r)
    //                 this.b.i.code = 'CompanyController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('BillItemService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'BillItemService:update',
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
    //         "c": "BillItem",
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
        console.log('BillItemService::getBillItemCount()/q:', q);
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::getBillItemCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'BillItemService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    getPagedSL(req, res) {
        const q = this.b.getQuery(req);
        console.log('BillItemService::getBillItemCount()/q:', q);
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::getBillItemCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'BillItemService::Get';
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
    //     console.log('BillItemService::getCompanyCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'BillItemService::getCompanyCount$',
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
        console.log('BillItemService::delete()/q:', q)
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::delete',
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

    deleteSL(req, res) {
        const q = this.b.getQuery(req);
        console.log('BillItemService::delete()/q:', q)
        const serviceInput = {
            serviceModel: BillItemModel,
            docName: 'BillItemService::delete',
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
                serviceModel: BillItemModel,
                docName: 'BillItemService::getMeta',
                cmd: null,
                dSource: 1
            }
            this.b.cdResp.data = await this.b.getEntityPropertyMapSL(req, res, BillItemModel);
            this.b.sqliteConn.close();
            this.b.respond(req, res)
        } catch (e) {
            console.log('BillItemService::getMeta()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BillItemService:getMeta',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }
}