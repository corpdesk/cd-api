import { BaseService } from '../../../sys/base/base.service';
import { IServiceInput } from '../../../sys/base/IBase';
import { BillItemService } from '../services/bill-item.service';
import { BillService } from '../services/bill.service';

export class BillItemController {

    b: BaseService;
    svBillItem: BillItemService;

    constructor() {
        console.log('BillController::constructor()/01')
        this.b = new BaseService();
        console.log('BillController::constructor()/02')
        this.svBillItem = new BillItemService();
    }

    // // /**
    // //  * {
    //             "ctx": "Sys",
    //             "m": "Moduleman",
    //             "c": "Consumer",
    //             "a": "Create",
    //             "dat": {
    //                 "f_vals": [
    //                     {
    //                         "data": {
    //                             "companyGuid": "8a7a5b56-6c76-11ec-a1b0-4184d18c49ca"
    //                         }
    //                     }
    //                 ],
    //                 "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //             },
    //             "args": {}
    //         }
    // //  * @param req
    // //  * @param res
    // //  */
    async Create(req, res) {
        console.log('BillController::Create()/01')
        try {
            console.log('BillController::Create()/02')
            await this.svBillItem.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:Create');
        }
    }

    async CreateSL(req, res) {
        console.log('BillController::Create()/01')
        try {
            console.log('BillController::Create()/02')
            await this.svBillItem.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:CreateSL');
        }
    }

    // // /**
    // //  * {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "Consumer",
    //     "a": "Get",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "where": {
    //                         "consumerGuid": "45E28C72-3C6D-940E-B738-DF3415589906"
    //                     }
    //                 }
    //             }
    //         ],
    //         "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //     },
    //     "args": null
    // }
    // //  * @param req
    // //  * @param res
    // //  */
    async Get(req, res) {
        try {
            await this.svBillItem.getBillItem(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svBillItem.getBillItemSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:GetSL');
        }
    }

    async GetView(req, res) {
        try {
            await this.svBillItem.getBillItemView(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:GetSL');
        }
    }

    async GetViewSL(req, res) {
        try {
            await this.svBillItem.getBillItemViewSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:GetSL');
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
            await this.svBillItem.getPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svBillItem.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:GetSL');
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
        console.log('BillController::Update()/01');
        try {
            console.log('BillController::Update()/02');
            await this.svBillItem.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('BillController::UpdateSL()/01');
        try {
            console.log('BillController::UpdateSL()/02');
            await this.svBillItem.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:UpdateSL');
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
            await this.svBillItem.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:Delete');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svBillItem.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    async GetMeta(req, res) {
        try {
            await this.svBillItem.getMeta(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:Get');
        }
    }

}