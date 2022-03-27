
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

    // /**
    //  *
    //  * {
    //         "ctx": "App",
    //         "m": "Accts",
    //         "c": "BillItem",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "bill": {
    //                         "billName": "test 1",
    //                         "billDescription": "jdksl",
    //                         "clientId": 85,
    //                         "vendorId": 111162,
    //                         "billGuid": ""
    //                     },
    //                     "data": {
    //                         "billItemName": "Initial Briefing",
    //                         "billItemDescription": "testing",
    //                         "billRateId": 2,
    //                         "billUnitId": 5,
    //                         "billItemDate": "2022-02-02 00:00:00",
    //                         "units": 6
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
    //         "m": "Accts",
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
        // this.b.setPlData(req, { key: 'billGuid', value: this.b.getGuid() });
        // return true;
        let ret = false;
        const billQuery: BillModel = req.post.dat.f_vals[0].bill;
        if (this.isInitial(req, res)) {
            console.log('BillItemsService::beforeCreate/isInitial = true;')
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
            const billData: any = await svBill.createI(req, res, createIParams)
            console.log('BillItemService::beforeCreate()/billData1:', billData)
            if (billData) {
                console.log('BillItemService::beforeCreate()/billData:', billData)
                this.b.setPlData(req, { key: 'billId', value: billData.billId });
                this.b.setPlData(req, { key: 'billGuid', value: billData.billGuid });
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
            const billData = await svBill.billExists(req, res, params)
            if (billData.length > 0) {
                console.log('BillItemService::beforeCreate()/billData2:', billData)
                req.post.dat.f_vals[0].bill = billData[0];
                console.log('BillItemService::beforeCreate()/req.post:', JSON.stringify(req.post))
                console.log('BillItemService::beforeCreate()/req.post.dat.f_vals[0].bill.billGuid:', req.post.dat.f_vals[0].bill.billGuid)
                console.log('BillItemService::beforeCreate()/value: req.post.dat.f_vals[0].bill.billGuid:', req.post.dat.f_vals[0].bill.billGuid)
                this.b.setPlData(req, { key: 'billGuid', value: req.post.dat.f_vals[0].bill.billGuid });
                this.b.setPlData(req, { key: 'billId', value: req.post.dat.f_vals[0].bill.billId });
            } else {
                this.b.serviceErr(req, res, 'billGuid is invalid', 'BillItemService:beforeCreate')
            }
        }
        return ret;
    }

    isInitial(req, res) {
        let ret = false;
        const billData: BillModel = req.post.dat.f_vals[0].bill;
        if (this.b.isEmpty(billData.billGuid)) {
            ret = true;
        }
        return ret;
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    // /**
    //  *
    //  * {
    //         "ctx": "App",
    //         "m": "Accts",
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
        this.b.updateSL$(req, res, serviceInput)
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
        return true;
    }

    async validateCreateSL(req, res) {
        return true;
    }

    // /**
    //  *
    //  * {
    //         "ctx": "App",
    //         "m": "Accts",
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
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
    //         "m": "Accts",
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

        this.b.deleteSL$(req, res, serviceInput)
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
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }
}