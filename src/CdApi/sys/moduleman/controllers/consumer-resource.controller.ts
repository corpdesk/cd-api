import { BaseService } from '../../base/base.service';
import { ConsumerResourceService } from '../services/consumer-resource.service';

export class ConsumerResourceController {

    b: BaseService;
    svConsumerResource: ConsumerResourceService;

    constructor() {
        this.b = new BaseService();
        this.svConsumerResource = new ConsumerResourceService();
    }

    // // /**
    // //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "ConsumerResource",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
    //                         "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
    //                         "objGuid": "8D4ED6A9-398D-32FE-7503-740C097E4F1F"
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
        try {
            await this.svConsumerResource.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ConsumerResourceController:Create');
        }
    }

    // // /**
    // //  * {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "ConsumerResource",
    //     "a": "Get",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "where": {
    //                         "consumer-resourceGuid": "45E28C72-3C6D-940E-B738-DF3415589906"
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
            await this.svConsumerResource.getConsumerResource(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ConsumerResourceController:Get');
        }
    }

    // {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "ConsumerResource",
    //     "a": "GetType",
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
    async GetType(req, res) {
        try {
            await this.svConsumerResource.getConsumerResourceTypeCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ConsumerResourceController:Get');
        }
    }

    // // /** Pageable request:
    // {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "ConsumerResource",
    //     "a": "GetCount",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "query": {
    //                     "select": [
    //                         "consumerResourceName",
    //                         "consumerResourceGuid"
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
    // //  */
    async GetCount(req, res) {
        try {
            await this.svConsumerResource.getConsumerResourceCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ConsumerResourceController:Get');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "ConsumerResource",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "consumer-resourceName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "consumer-resourceId": 45762
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
        console.log('ConsumerResourceController::Update()/01');
        try {
            console.log('ConsumerResourceController::Update()/02');
            await this.svConsumerResource.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ConsumerResourceController:Update');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "ConsumerResource",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"consumer-resourceId": 45763}
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
            await this.svConsumerResource.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ConsumerResourceController:Update');
        }
    }

}