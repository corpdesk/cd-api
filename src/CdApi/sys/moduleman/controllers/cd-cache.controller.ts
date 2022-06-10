import { BaseService } from '../../base/base.service';
import { CdCacheService } from '../services/cd-cache.service';

export class CdCacheController {

    b: BaseService;
    svCdCache: CdCacheService;

    constructor() {
        this.b = new BaseService();
        this.svCdCache = new CdCacheService();
    }

    // /**
    //  * {
    //     "ctx": "Sys",
    //     "m": "Moduleman",
    //     "c": "CdCache",
    //     "a": "Create",
    //     "dat": {
    //         "f_vals": [
    //             {
    //                 "data": {
    //                     "key": "test_one",
    //                     "value": "7ae902cd-5bc5-493b-a739-125f10ca0268"
    //                 }
    //             }
    //         ],
    //         "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //     },
    //     "args": {}
    // }
    //  * @param req
    //  * @param res
    //  */
    async Create(req, res) {
        try {
            await this.svCdCache.create(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CdCacheController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdCache",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"redisId": 45763}
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
    async Get(req, res) {
        try {
            await this.svCdCache.get(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CdCacheController:Get');
        }
    }

    // /** Pageable request:
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "select":["moduleId","moduleGuid"],
    //                         "where": {},
    //                         "take": 5,
    //                         "skip": 1
    //                         }
    //                 }
    //             ],
    //             "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async GetCount(req, res) {
        try {
            await this.svCdCache.getCdCacheCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    // /** Pageable request:
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "GetPaged",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "select":["moduleId","moduleGuid"],
    //                         "where": {},
    //                         "take": 5,
    //                         "skip": 1
    //                         }
    //                 }
    //             ],
    //             "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async GetPaged(req, res) {
        try {
            await this.svCdCache.getCdCacheCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdCache",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "redisName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "redisId": 45762
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
        console.log('CdCacheController::Update()/01');
        try {
            console.log('CdCacheController::Update()/02');
            await this.svCdCache.update(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdCache",
    //         "a": "Delete",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"redisId": 45763}
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
            await this.svCdCache.delete(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

}