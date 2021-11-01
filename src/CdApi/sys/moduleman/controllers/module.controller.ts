import { BaseService } from '../../base/base.service';
import { ModuleService } from '../services/module.service';

export class ModuleController {

    b: BaseService;
    svModule: ModuleService;

    constructor() {
        this.b = new BaseService();
        this.svModule = new ModuleService();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "filter": { "moduleId":98}
    //                 }
    //             ],
    //             "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Get(req, res) {
        try {
            await this.svModule.getModule(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'ModuleController:Get');
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
            await this.svModule.getModuleCount(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'ModuleController:Get');
        }
    }

    // /**
    //  *
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "moduleName": "TesterModule"
    //                         },
    //                         "where": {"moduleId":93}
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
        try {
            await this.svModule.update(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'ModuleController:Update');
        }
    }

    async Delete(req, res) {
        try {
            await this.svModule.delete(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'ModuleController:Update');
        }
    }

    async Create(req, res) {
        try {
            await this.svModule.create(req, res);
        } catch (e) {
            this.b.serviceErr(res, e,'ModuleController:Create');
        }
    }

}