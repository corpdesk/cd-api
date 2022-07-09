import { BaseService } from '../../../sys/base/base.service';
import { IServiceInput } from '../../../sys/base/IBase';
import { CdAcctsExpenditureService } from '../services/cd-accts-expenditure.service';

export class CdAcctsExpenditureController {

    b: BaseService;
    svExpenditure: CdAcctsExpenditureService;

    constructor() {
        console.log('CdAcctsExpenditureController::constructor()/01')
        this.b = new BaseService();
        console.log('CdAcctsExpenditureController::constructor()/02')
        this.svExpenditure = new CdAcctsExpenditureService();
    }

    // SELECT cd_accts_payment_id, cd_accts_payment_guid, cd_accts_payment_name, cd_accts_payment_description, doc_id, cd_accts_ext_invoice_id, cd_accts_payment_type_id
    // FROM cd1213.cd_accts_payment;


    // // /**
    // //  * {
    //         "ctx": "App",
    //         "m": "cd-accts",
    //         "c": "CdAcctsExpenditure",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "cdAcctsTransact": {
    //                         "cdAcctsAccountId": 0,
    //                         "cdAcctsTransactMediaId": 0,
    //                         "cdAcctsTransactStateId": 0,
    //                         "credit": true,
    //                         "debit": false,
    //                         "cdAcctsCurrencyId": 0,
    //                         "cdAcctsTransactTypeId": 0,
    //                         "companyId": 85,
    //                         "cdAcctsTransactAmount": 100,
    //                         "cdAcctsTransactParentId": -1
    //                     },
    //                     "data": {
    //                         "cdAcctsExpenditureName": "ww",
    //                         "cdAcctsExpenditureDescription": "kk",
    //                         "cdAcctsExtInvoiceId": "2",
    //                         "cdAcctsExpenditureType_id": "4"
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
    async Create(req, res) {
        console.log('CdAcctsExpenditureController::Create()/01')
        try {
            console.log('CdAcctsExpenditureController::Create()/02')
            await this.svExpenditure.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:Create');
        }
    }

    async CreateSL(req, res) {
        console.log('CdAcctsExpenditureController::Create()/01')
        try {
            console.log('CdAcctsExpenditureController::Create()/02')
            await this.svExpenditure.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:CreateSL');
        }
    }

    // /**
    // {
    //     "ctx": "App",
    //     "m": "CdAccts",
    //     "c": "Bill",
    //     "a": "Get",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "where": {}
    //                 }
    //             }
    //         ],
    //         "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //     },
    //     "args": null
    // }
    //  * @param req
    //  * @param res
    //  */
    async Get(req, res) {
        try {
            await this.svExpenditure.getBill(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svExpenditure.getBillSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:GetSL');
        }
    }

    // async read(req, res, serviceInput: IServiceInput): Promise<any> {
    //     await this.init(req, res);
    //     const repo = getConnection().getRepository(serviceInput.serviceModel);
    //     let r: any = null;
    //     switch (serviceInput.cmd.action) {
    //         case 'find':
    //             try {
    //                 r = await repo.find(serviceInput.cmd.query);
    //                 if (serviceInput.extraInfo) {
    //                     return {
    //                         result: r,
    //                         fieldMap: await this.feildMap(serviceInput)
    //                     }
    //                 } else {
    //                     return await r;
    //                 }
    //             }
    //             catch (err) {
    //                 return await this.serviceErr(req, res, err, 'BaseService:read');
    //             }
    //             break;
    //         case 'count':
    //             try {
    //                 r = await repo.count(serviceInput.cmd.query);
    //                 console.log('BaseService::read()/r:', r)
    //                 return r;
    //             }
    //             catch (err) {
    //                 return await this.serviceErr(req, res, err, 'BaseService:read');
    //             }
    //             break;
    //     }


    //     // this.serviceErr(res, err, 'BaseService:read');
    // }

    // async GetType(req, res) {
    //     try {
    //         await this.svConsumer.getConsumerTypeCount(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'ConsumerController:Get');
    //     }
    // }

    // /** Pageable request:
    //   * {
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
    //   * @param req
    //   * @param res
    //   */
    async GetCount(req, res) {
        try {
            await this.svExpenditure.getPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:GetCount');
        }
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
    async BillViewPaged(req, res) {
        try {
            await this.svExpenditure.getViewPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:BillViewPaged');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svExpenditure.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:GetSL');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Consumer",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "consumerName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "consumerId": 45762
    //                         }
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Update(req, res) {
        console.log('CdAcctsExpenditureController::Update()/01');
        try {
            console.log('CdAcctsExpenditureController::Update()/02');
            await this.svExpenditure.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdAcctsExpenditureController::UpdateSL()/01');
        try {
            console.log('CdAcctsExpenditureController::UpdateSL()/02');
            await this.svExpenditure.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:UpdateSL');
        }
    }

    // /**
    //  * {
    //          "ctx": "App",
    //          "m": "CdAccts",
    //          "c": "Bill",
    //          "a": "Delete",
    //          "dat": {
    //              "f_vals": [
    //                  {
    //                      "query": {
    //                          "where": {
    //                              "billGuid": "qyuiop"
    //                          }
    //                      }
    //                  }
    //              ],
    //              "token": "fc735ce6-b52f-4293-9332-0181a49231c4"
    //          },
    //          "args": {}
    //      }
    //  * @param req
    //  * @param res
    //  */
    async Delete(req, res) {
        try {
            await this.svExpenditure.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:Delete');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svExpenditure.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:DeleteSL');
        }
    }

    async GetMeta(req, res) {
        try {
            await this.svExpenditure.getMeta(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsExpenditureController:Get');
        }
    }

}