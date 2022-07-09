import { BaseService } from '../../../sys/base/base.service';
import { IServiceInput } from '../../../sys/base/IBase';
import { CdAcctsReceiptService } from '../services/cd-accts-receipt.service';

export class CdAcctsReceiptController {

    b: BaseService;
    svReceipt: CdAcctsReceiptService;

    constructor() {
        console.log('CdAcctsReceiptController::constructor()/01')
        this.b = new BaseService();
        console.log('CdAcctsReceiptController::constructor()/02')
        this.svReceipt = new CdAcctsReceiptService();
    }

    // SELECT cd_accts_payment_id, cd_accts_payment_guid, cd_accts_payment_name, cd_accts_payment_description, doc_id, cd_accts_ext_invoice_id, cd_accts_payment_type_id
    // FROM cd1213.cd_accts_payment;


    /**
     * - title
     * - description
     * 
     * 
     * - amount
     * - media
     * - media date
     * - invoice number
     * 
     * {
            "ctx": "App",
            "m": "cd-accts",
            "c": "CdAcctsReceipt",
            "a": "Create",
            "dat": {
                "f_vals": [
                    {
                        "CdAcctsTransactVendor": {
                            "cdAcctsTransactName": "jmnds",
                            "cdAcctsTransactDescription": "dkaoef",
                            "cdAcctsAccountId": 592,
                            "cdAcctsTransactMediaId": 593,
                            "cdAcctsTransactStateId": 599,
                            "cdAcctsCurrencyId": 592,
                            "companyId": 111162,
                            "cdAcctsTransactAmount": 350,
                            "cdAcctsTransactParentId": -1,
                            "credit": false,
                            "debit": true,
                            "cdAcctsTransactMediaDate": "2022-04-07T21:00:00.000Z",
                        },
                        "CdAcctsTransactClient": {
                            "cdAcctsTransactName": "jmnds",
                            "cdAcctsTransactDescription": "dkaoef",
                            "cdAcctsAccountId": 678,
                            "cdAcctsTransactMediaId": 593,
                            "cdAcctsTransactStateId": 599,
                            "cdAcctsCurrencyId": 592,
                            "companyId": 20,
                            "cdAcctsTransactAmount": 350,
                            "cdAcctsTransactParentId": -1,
                            "credit": true,
                            "debit": false,
                            "cdAcctsTransactMediaDate": "2022-04-07T21:00:00.000Z",
                        },
                        "data": {
                            "cdAcctsReceiptName": "jmnds",
                            "cdAcctsReceiptDescription": "dkaoef",
                            "cdAcctsIntInvoiceId": 647
                        }
                    }
                ],
                "token": "3ffd785f-e885-4d37-addf-0e24379af338"
            },
            "args": {}
        }
     * @param req
     * @param res
     */
    async Create(req, res) {
        console.log('CdAcctsReceiptController::Create()/01')
        try {
            console.log('CdAcctsReceiptController::Create()/02')
            await this.svReceipt.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:Create');
        }
    }

    async CreateSL(req, res) {
        console.log('CdAcctsReceiptController::Create()/01')
        try {
            console.log('CdAcctsReceiptController::Create()/02')
            await this.svReceipt.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:CreateSL');
        }
    }

    // /**
    // {
    //     "ctx": "App",
    //     "m": "CdAccts",
    //     "c": "CdAcctsReceipt",
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
            await this.svReceipt.getReceipt(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svReceipt.getBillSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:GetSL');
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
            await this.svReceipt.getPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:GetCount');
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
            await this.svReceipt.getViewPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:BillViewPaged');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svReceipt.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:GetSL');
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
        console.log('CdAcctsReceiptController::Update()/01');
        try {
            console.log('CdAcctsReceiptController::Update()/02');
            await this.svReceipt.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdAcctsReceiptController::UpdateSL()/01');
        try {
            console.log('CdAcctsReceiptController::UpdateSL()/02');
            await this.svReceipt.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:UpdateSL');
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
            await this.svReceipt.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:Delete');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svReceipt.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:DeleteSL');
        }
    }

    async GetMeta(req, res) {
        try {
            await this.svReceipt.getMeta(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsReceiptController:Get');
        }
    }

}