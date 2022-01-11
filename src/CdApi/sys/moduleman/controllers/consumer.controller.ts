import { BaseService } from '../../base/base.service';
import { ConsumerService } from '../services/consumer.service';

export class ConsumerController {

    b: BaseService;
    svConsumer: ConsumerService;

    constructor() {
        this.b = new BaseService();
        this.svConsumer = new ConsumerService();
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
        try {
            await this.svConsumer.create(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ConsumerController:Create');
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
            await this.svConsumer.getConsumer(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ConsumerController:Get');
        }
    }

    async GetType(req, res) {
        try {
            await this.svConsumer.getConsumerTypeCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ConsumerController:Get');
        }
    }

    // // /** Pageable request:
    // //  * {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "Consumer",
    //     "a": "GetCount",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "select": [
    //                         "consumerName",
    //                         "consumerGuid"
    //                     ],
    //                     "where": {},
    //                     "take": 5,
    //                     "skip": 0
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
    async GetCount(req, res) {
        try {
            await this.svConsumer.getConsumerCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ConsumerController:Get');
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
        console.log('ConsumerController::Update()/01');
        try {
            console.log('ConsumerController::Update()/02');
            await this.svConsumer.update(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ConsumerController:Update');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Consumer",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"consumerId": 45763}
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
    async Delete(req, res) {
        try {
            await this.svConsumer.delete(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ConsumerController:Update');
        }
    }

}