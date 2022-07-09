import { BaseService } from '../../base/base.service';
import { CdObjService } from '../services/cd-obj.service';

export class CdObjController {

    b: BaseService;
    svCdObj: CdObjService;

    constructor() {
        this.b = new BaseService();
        this.svCdObj = new CdObjService();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdObj",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "cdObjName": "/src/CdApi/sys/moduleman",
    //                         "cdObjTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
    //                         "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b"
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
    async Create(req, res) {
        try {
            await this.svCdObj.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdObjController:Create');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdObj",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"cdObjId": 45763}
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
            await this.svCdObj.getCdObj(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdObjController:Get');
        }
    }

    async GetType(req, res) {
        try {
            await this.svCdObj.getCdObjTypeCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdObjController:Get');
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
            await this.svCdObj.getCdObjCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdObj",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "cdObjName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "cdObjId": 45762
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
        console.log('CdObjController::Update()/01');
        try {
            console.log('CdObjController::Update()/02');
            await this.svCdObj.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdObj",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"cdObjId": 45763}
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
            await this.svCdObj.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

}