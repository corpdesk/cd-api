
import { BaseService } from '../../../sys/base/base.service';
import { SessionService } from '../../../sys/user/services/session.service';
import { CdService } from '../../../sys/base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../../sys/base/IBase';
import { from, Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { CdAcctsAccountViewModel } from '../models/cd-accts-account-view.model';
import { CdAcctsTransactModel } from '../models/cd-accts-transact.model';
import { CdAcctsTransactService } from './cd-accts-transact.service';
import { CdAcctsIntInvoiceModel } from '../models/cd-accts-int-invoice.model';
import { CdAcctsAccountModel } from '../models/cd-accts-account.model';
import { CdAcctsAccountService } from './cd-accts-account.service';
import { CdAcctsInvoiceVendorViewModel } from '../models/cd-accts-invoice-vendor-view.model';
// import { CdAcctsAccountViewModel } from '../models/cdAcctsIntInvoice-view.model';

export class CdAcctsIntInvoiceService extends CdService {
    sqliteDb;
    sqliteModels = [];
    err: string[] = []; // error messages
    b: any; // instance of CdAcctsIntInvoiceService
    cdToken: string;
    serviceModel: CdAcctsIntInvoiceModel;
    sessModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cdAcctsIntInvoiceName', 'cdAcctsIntInvoiceRate', 'cdAcctsIntInvoiceUnit', 'cdAcctsIntInvoiceType'],
        noDuplicate: ['cdAcctsIntInvoiceName', 'cdAcctsIntInvoiceId']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdAcctsIntInvoiceModel();
    }

    async create(req, res) {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CdAcctsIntInvoiceModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Invoice',
                dSource: 1,
            }
            const newInvoice = await this.b.create(req, res, serviceInput)
            console.log('CdAcctsIntInvoiceService::create()/newInvoice:', newInvoice)
            const result = await this.afterCreate(req, res, newInvoice)
            console.log('CdAcctsIntInvoiceService::create()/result:', result)
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = result;
            const r = await this.b.respond(req, res);
        } else {
            const r = await this.b.respond(req, res);
        }
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'cdAcctsIntInvoiceGuid', value: this.b.getGuid() });
        const cdAcctsTransactQuery = req.post.dat.f_vals[0].cdAcctsTransact;
        const svCdAcctsTransact = new CdAcctsTransactService();
        const si = {
            serviceInstance: svCdAcctsTransact,
            serviceModel: CdAcctsTransactModel,
            serviceModelInstance: svCdAcctsTransact.serviceModel,
            docName: 'CdAcctsIntInvoiceService::beforeCreate',
            dSource: 1,
        }
        const createIParams: CreateIParams = {
            serviceInput: si,
            controllerData: cdAcctsTransactQuery
        }
        let ret = false;
        const cdAcctsTransactData: any = await svCdAcctsTransact.createI(req, res, createIParams)
        if (cdAcctsTransactData) {
            console.log('CdAcctsIntInvoiceService::beforeCreate()/cdAcctsTransactData:', cdAcctsTransactData)
            this.b.setPlData(req, { key: 'cdAcctsTransactId', value: cdAcctsTransactData.cdAcctsTransactId });
            ret = true;
        } else {
            this.b.i.app_msg = `duplication of ${this.cRules.noDuplicate.join(', ')} not allowed`
            this.b.err.push(this.b.i.app_msg);
            ret = false;
        }
        return ret;
    }

    /**
     * create double entry transaction from the invoice
     * - credit to vendor
     * - debit to client
     * @param req 
     * @param res 
     * @param newInvoice 
     * @returns 
     */
    async afterCreate(req, res, newInvoice: CdAcctsIntInvoiceModel): Promise<any> {
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/01')
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/newInvoice:', await newInvoice)
        const accountI = new CdAcctsAccountService()
        const transactI = new CdAcctsTransactService()
        const ni = await newInvoice;
        // get vendor account details
        const vendorAcctArr: CdAcctsAccountModel[] = await accountI.getCdAcctsAccountI(req, res, { where: { vendorId: newInvoice.vendorId, parentId: -1 } })
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/vendorAcctArr:', vendorAcctArr)
        // do vendor credit transaction
        const transactVendor = await transactI.transactInvoice(req, res, vendorAcctArr, newInvoice)
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/transactVendor:', transactVendor)
        // update invoice with vendor transaction details
        const updateVendor = await this.setTransactId(req, res, transactVendor, ni, 'vendor')
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/updateVendor:', updateVendor)
        // get client account details
        const clientAcctArr: CdAcctsAccountModel[] = await accountI.getCdAcctsAccountI(req, res, { where: { clientId: newInvoice.clientId, parentId: newInvoice.vendorId } })
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/clientAcctArr:', clientAcctArr)
        // do client credit transaction
        const transactClient = await transactI.transactInvoice(req, res, clientAcctArr, newInvoice)
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/transactClient:', transactClient)
        // update invoice with client transaction details
        const updateClient = await this.setTransactId(req, res, transactClient, ni, 'client')
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/updateClient:', updateClient)
        const invoiceI = new CdAcctsIntInvoiceService()
        // return account complete with transaction details
        const ret = await invoiceI.getCdAcctsIntInvoiceI(req, res, { where: { cdAcctsIntInvoiceId: ni.cdAcctsIntInvoiceId } })
        console.log('CdAcctsIntInvoiceSerice::afterCreate()/ret:', ret)
        return ret;
    }

    async createI(req, res, createIParams: CreateIParams): Promise<CdAcctsIntInvoiceModel | boolean> {
        console.log('CdAcctsIntInvoiceService::create()/createIParams:', createIParams)
        const newInvoice = await this.b.createI(req, res, createIParams)
        const ret = await this.afterCreate(req, res, newInvoice)
        return ret;
    }

    /**
     * update invoice with transactionId
     * @param req 
     * @param res 
     * @param newTransation 
     * @param newInvoice 
     * @returns 
     */
    async setTransactId(req, res, newTransation: CdAcctsTransactModel, newInvoice: CdAcctsIntInvoiceModel, mode: string) {
        console.log('CdAcctsIntInvoiceService::setTransactId()/01')
        console.log('CdAcctsIntInvoiceService::setTransactId()/newTransation:', newTransation)
        console.log('CdAcctsIntInvoiceService::setTransactId()/newInvoice:', newInvoice)
        let u;
        switch (mode) {
            case 'vendor':
                u = {
                    cdAcctsTransactVendorId: newTransation.cdAcctsTransactId
                }
                break;
            case 'client':
                u = {
                    cdAcctsTransactClientId: newTransation.cdAcctsTransactId
                }
                break;
        }
        const q = {
            update: u,
            where: {
                cdAcctsIntInvoiceId: newInvoice.cdAcctsIntInvoiceId
            }
        }
        return this.updateI(req, res, q);
    }

    async getCdAcctsIntInvoiceI(req, res, q) {
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoiceI()/01')
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoiceI()/q:', q)
        const serviceInput: IServiceInput = {
            serviceInstance: CdAcctsIntInvoiceModel,
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getCdAcctsIntInvoiceI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1,
        }
        const ret = await this.b.read(req, res, serviceInput)
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoiceI()/ret:', ret)
        return ret;
    }

    // async transactInvoice(req, res, accountArr: CdAcctsAccountModel[], newInvoice: CdAcctsIntInvoiceModel) {
    //     console.log('CdAcctsIntInvoiceSerice::transactInvoice()/newInvoice:', newInvoice)
    //     console.log('CdAcctsIntInvoiceSerice::transactInvoice()/accountArr:', accountArr)
    //     const svTransact = new CdAcctsTransactService()
    //     if (accountArr.length > 0) {
    //         const account = accountArr[0];
    //         console.log('CdAcctsIntInvoiceSerice::transactInvoice()/account.cdAcctsAccountTypeId:', account.cdAcctsAccountTypeId)
    //         // const ni = await newInvoice;
    //         // const accountModel:CdAcctsAccountModel = await this.getAccount(req, res, { where: { vendorId: newInvoice.vendorId } })[0]
    //         // const clientAcct:CdAcctsAccountModel = await this.getAccount(req, res, { where: { vendorId: newInvoice.clientId } })[0]
    //         let cId; //companyId
    //         let isCredit = false; //credit
    //         let isDebit = false; // debit
    //         switch (account.cdAcctsAccountTypeId) {
    //             case 591: // vendor
    //                 cId = newInvoice.vendorId
    //                 isCredit = true;
    //                 break;
    //             case 592: // client
    //                 cId = newInvoice.clientId
    //                 isDebit = true;
    //                 break;
    //         }
    //         const transact: CdAcctsTransactModel = {
    //             cdAcctsTransactName: newInvoice.cdAcctsIntInvoiceName,
    //             cdAcctsTransactDescription: newInvoice.cdAcctsIntInvoiceDescription,
    //             cdAcctsAccountId: account.cdAcctsAccountId,
    //             cdAcctsTransactMediaId: await svTransact.getTransactionMedia(), //603,
    //             cdAcctsTransactStateId: await svTransact.getTransactionState(), // transact state = 'invoiced'
    //             Credit: isCredit,
    //             Debit: isDebit,
    //             cdAcctsCurrencyId: await svTransact.getTransactionCurrency(), //592,
    //             companyId: cId,
    //             cdAcctsTransactAmount: newInvoice.cdAcctsIntInvoiceCost,
    //             cdAcctsTransactParentId: -1 // can be used to link transactions that are related eg invoice and tax
    //         }

    //         console.log('CdAcctsIntInvoiceSerice::afterCreate()/transact:', transact)
    //         const si = {
    //             serviceInstance: svTransact,
    //             serviceModel: CdAcctsTransactModel,
    //             serviceModelInstance: svTransact.serviceModel,
    //             docName: 'CdAcctsIntInvoiceSerice/afterCreate',
    //             dSource: 1,
    //         }

    //         ///////////////////////////////////////////////
    //         const createIParams: CreateIParams = {
    //             serviceInput: si,
    //             controllerData: transact
    //         }
    //         const newTransact: any = await svTransact.createI(req, res, createIParams)
    //         console.log('CdAcctsIntInvoiceSerice::afterCreate()/newTransact:', newTransact)
    //         return newTransact;
    //     } else {
    //         const svSess = new SessionService()
    //         this.b.i.app_msg = 'one of the entities account is not set properly';
    //         this.b.setAppState(true, this.b.i, svSess.sessResp);
    //         this.b.cdResp.data = [];
    //         await this.b.respond(req, res);
    //     }
    // }



    // /**
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "CdAcctsIntInvoice",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "cdAcctsIntInvoiceName": "myCdAcctsIntInvoice3",
    //                         "cdAcctsIntInvoiceGuid": "qyuiop",
    //                         "cdAcctsIntInvoiceDescription": "oiuwah"
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
                serviceModel: CdAcctsIntInvoiceModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdAcctsIntInvoice',
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



    async cdAcctsIntInvoiceExists(req, res, params): Promise<any> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::cdAcctsIntInvoiceExists',
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
        this.b.setPlData(req, { key: 'cdAcctsIntInvoiceGuid', value: this.b.getGuid() });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoice/q:', q);
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    // console.log('CdAcctsIntInvoiceService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsIntInvoiceService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsIntInvoiceService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsIntInvoiceService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoice/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsIntInvoiceService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsIntInvoiceService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsIntInvoiceService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsIntInvoiceService:update',
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
    //         "c": "CdAcctsIntInvoice",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "cdAcctsIntInvoiceGuid": "azimio3"
    //                         },
    //                         "where": {
    //                             "cdAcctsIntInvoiceId": 8
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
    async update(req, res) {
        console.log('CdAcctsIntInvoiceService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsIntInvoiceService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.sqliteConn.close();
                this.b.respond(req, res)
            })
    }

    async updateI(req, res, q): Promise<any> {
        console.log('CdAcctsIntInvoiceService::updateI()/01');
        // let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::updateI',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsIntInvoiceService::update()/02')
        return this.b.update(req, res, serviceInput)
    }

    updateSL(req, res) {
        console.log('CdAcctsIntInvoiceService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        console.log('CdAcctsIntInvoiceService::update()/02')
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
        // if (q.update.cdAcctsIntInvoiceEnabled === '') {
        //     q.update.cdAcctsIntInvoiceEnabled = null;
        // }
        return q;
    }

    beforeUpdateSL(q: any) {
        if (q.update.cdAcctsIntInvoiceEnabled === '') {
            q.update.cdAcctsIntInvoiceEnabled = null;
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
    //         "c": "CdAcctsIntInvoice",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {
    //                             "cdAcctsIntInvoiceId": 8
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
    async getIntInvoice(req, res, q = null) {
        if (q) {

        } else {
            q = this.b.getQuery(req);
        }
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoice/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getCdAcctsIntInvoice',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsIntInvoiceService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsIntInvoiceService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsIntInvoiceService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsIntInvoiceService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getIntInvoiceI(req, res, q = null):Promise<CdAcctsIntInvoiceModel[]> {
        if (q) {

        } else {
            q = this.b.getQuery(req);
        }
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoice/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getCdAcctsIntInvoice',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return this.b.read(req, res, serviceInput)
        } catch (e) {
            console.log('CdAcctsIntInvoiceService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsIntInvoiceService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getCdAcctsIntInvoiceSL(req, res) {
        await this.b.initSqlite(req, res)
        const q = this.b.getQuery(req);
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoice/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getCdAcctsIntInvoice',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.readSL$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CdAcctsIntInvoiceService::read$()/r:', r)
                    this.b.i.code = 'CdAcctsIntInvoiceService::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.sqliteConn.close();
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CdAcctsIntInvoiceService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsIntInvoiceService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    // getCdAcctsIntInvoiceType(req, res) {
    //     const q = this.b.getQuery(req);
    //     console.log('CdAcctsIntInvoiceService::getCompany/f:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsIntInvoiceService::getCompanyType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 console.log('CdAcctsIntInvoiceService::read$()/r:', r)
    //                 this.b.i.code = 'CompanyController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.log('CdAcctsIntInvoiceService::read$()/e:', e)
    //         this.b.err.push(e.toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'CdAcctsIntInvoiceService:update',
    //             app_msg: ''
    //         };
    //         this.b.serviceErr(req, res, e, i.code)
    //         this.b.respond(req, res)
    //     }
    // }

    /**
     * {
            "ctx": "App",
            "m": "CdAccts",
            "c": "CdAcctsIntInvoice",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select": [
                                "cdAcctsIntInvoiceId",
                                "cdAcctsIntInvoiceGuid",
                                "cdAcctsIntInvoiceName"
                            ],
                            "where": {},
                            "take": 5,
                            "skip": 0
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * @param req
     * @param res
     */
    getPaged(req, res, q = null) {
        if (q) {

        } else {
            q = this.b.getQuery(req);
        }
        console.log('CdAcctsIntInvoiceService::getPaged()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsIntInvoiceService::getPaged';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getPagedView(req, res) {
        console.log('CdAcctsIntInvoiceService::getPagedView()/01')
        const q = this.b.getQuery(req);
        console.log('CdAcctsIntInvoiceService::getPagedView()/02')
        console.log('CdAcctsIntInvoiceService::getPagedView()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsInvoiceVendorViewModel,
            docName: 'CdAcctsIntInvoiceService::getPagedView',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsIntInvoiceService::getPagedView';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    // /**
    //  * {
    //         "ctx": "App",
    //         "m": "CdAccts",
    //         "c": "CdAcctsIntInvoice",
    //         "a": "CdAcctsIntInvoiceViewPaged",
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
        console.log('CdAcctsIntInvoiceService::getViewPaged()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getViewPaged',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readPaged$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsIntInvoiceService::getViewPaged';
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
        console.log('CdAcctsIntInvoiceService::getCdAcctsIntInvoiceCount()/q:', q);
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::getCdAcctsIntInvoiceCount',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCountSL$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CdAcctsIntInvoiceService::Get';
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
    //     console.log('CdAcctsIntInvoiceService::getCompanyCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CompanyTypeModel,
    //         docName: 'CdAcctsIntInvoiceService::getCompanyCount$',
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
        console.log('CdAcctsIntInvoiceService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::delete',
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
        console.log('CdAcctsIntInvoiceService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CdAcctsIntInvoiceModel,
            docName: 'CdAcctsIntInvoiceService::delete',
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
                serviceModel: CdAcctsIntInvoiceModel,
                docName: 'CdAcctsIntInvoiceService::getMeta',
                cmd: null,
                dSource: 1
            }
            this.b.cdResp.data = await this.b.getEntityPropertyMapSL(req, res, CdAcctsIntInvoiceModel);
            this.b.sqliteConn.close();
            this.b.respond(req, res)
        } catch (e) {
            console.log('CdAcctsIntInvoiceService::getMeta()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdAcctsIntInvoiceService:getMeta',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }
}