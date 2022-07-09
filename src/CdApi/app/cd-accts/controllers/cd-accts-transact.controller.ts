import { BaseService } from '../../../sys/base/base.service';
import { IServiceInput } from '../../../sys/base/IBase';
import { CdAcctsTransactService } from '../services/cd-accts-transact.service';

export class CdAcctsTransactController {

    b: BaseService;
    svCdAcctsTransact: CdAcctsTransactService;

    constructor() {
        console.log('CdAcctsTransactController::constructor()/01')
        this.b = new BaseService();
        console.log('CdAcctsTransactController::constructor()/02')
        this.svCdAcctsTransact = new CdAcctsTransactService();
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
        console.log('CdAcctsTransactController::Create()/01')
        try {
            console.log('CdAcctsTransactController::Create()/02')
            await this.svCdAcctsTransact.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:Create');
        }
    }

    async CreateSL(req, res) {
        console.log('CdAcctsTransactController::Create()/01')
        try {
            console.log('CdAcctsTransactController::Create()/02')
            await this.svCdAcctsTransact.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:CreateSL');
        }
    }

    // /**
    // {
    //     "ctx": "App",
    //     "m": "CdAccts",
    //     "c": "CdAcctsTransact",
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
            await this.svCdAcctsTransact.getTransact(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:Get');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "cd-accts",
            "c": "CdAcctsTransact",
            "a": "GetMedia",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select": [
                                "cdAcctsTransactMediaId",
                                "cdAcctsTransactMediaGuid",
                                "cdAcctsTransactMediaName",
                                "cdAcctsTransactMediaDescription",
                                "docId",
                                "cdAcctsTransactMediaTypeId"
                            ],
                            "where": {}
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
    async GetMedia(req, res) {
        try {
            await this.svCdAcctsTransact.getMedia(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:Get');
        }
    }

    // async GetSL(req, res) {
    //     try {
    //         await this.svCdAcctsTransact.getCdAcctsTransactSL(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'CdAcctsTransactController:GetSL');
    //     }
    // }

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
    //         "c": "CdAcctsTransact",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "select": [
    //                             "cd-accts-transactName",
    //                             "cd-accts-transactGuid"
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
            await this.svCdAcctsTransact.getPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:GetCount');
        }
    }

    /**
     * {
    "ctx": "App",
    "m": "cd-accts",
    "c": "CdAcctsTransact",
    "a": "GetPagedView",
    "dat": {
        "f_vals": [
            {
                "query": {
                    "select": [
                        "cdAcctsTransactId", 
                        "cdAcctsTransactGuid", 
                        "cdAcctsTransactName", 
                        "cdAcctsTransactDescription", 
                        "docId", 
                        "cdAcctsAccountId", 
                        "cdAcctsTransactMediaId", 
                        "cdAcctsTransactStateId", 
                        "credit", 
                        "debit", 
                        "cdAcctsCurrencyId", 
                        "cdAcctsTransactTypeId", 
                        "companyId", 
                        "cdAcctsTransactAmount", 
                        "cdAcctsTransactParentId", 
                        "cdAcctsTransactMediaDate"
                    ],
                    "where": {}
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
    async GetPagedView(req, res) {
        try {
            await this.svCdAcctsTransact.getPagedView(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:CdAcctsTransactViewPaged');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "cd-accts",
            "c": "CdAcctsTransact",
            "a": "GetInvoiceTotalSettled",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select": [
                                "cdAcctsIntInvoiceId",
                                "totalPaid"
                            ],
                            "where": {
                                "cdAcctsIntInvoiceId": 647
                            }
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
    async GetInvoiceTotalSettled(req, res) {
        try {
            await this.svCdAcctsTransact.getInvoiceTotalSettled(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:GetInvoiceTotalSettled');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdAcctsTransact.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:GetSL');
        }
    }

    /**
     * 
     * {
            "ctx": "App",
            "m": "cd-accts",
            "c": "CdAcctsTransact",
            "a": "GetStatement",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {}
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
    async GetStatement(req, res) {
        try {
            await this.svCdAcctsTransact.getStatement(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:GetStatement');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "cd-accts",
            "c": "CdAcctsTransact",
            "a": "GetStatementPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select": [
                                "docDate",
                                "cdAcctsTransactMediaId",
                                "billName",
                                "billCost",
                                "cdAcctsTransactAmount",
                                "cdAcctsTransactBalance"
                            ],
                            "where": {},
                            "take": 5,
                            "skip": 0
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
    async GetStatementPaged(req, res) {
        try {
            await this.svCdAcctsTransact.getStatementPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:GetStatementPaged');
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
        console.log('CdAcctsTransactController::Update()/01');
        try {
            console.log('CdAcctsTransactController::Update()/02');
            await this.svCdAcctsTransact.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdAcctsTransactController::UpdateSL()/01');
        try {
            console.log('CdAcctsTransactController::UpdateSL()/02');
            await this.svCdAcctsTransact.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:UpdateSL');
        }
    }

    // /**
    //  * {
    //          "ctx": "App",
    //          "m": "CdAccts",
    //          "c": "CdAcctsTransact",
    //          "a": "Delete",
    //          "dat": {
    //              "f_vals": [
    //                  {
    //                      "query": {
    //                          "where": {
    //                              "cd-accts-transactGuid": "qyuiop"
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
            await this.svCdAcctsTransact.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:Delete');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdAcctsTransact.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdAcctsTransactController:DeleteSL');
        }
    }

    async GetMeta(req, res) {
        try {
            await this.svCdAcctsTransact.getMeta(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CdAcctsTransactController:Get');
        }
    }

}