import { BaseService } from '../../base/base.service';
import { CompanyService } from '../services/company.service';

export class CompanyController {

    b: BaseService;
    svCompany: CompanyService;

    constructor() {
        this.b = new BaseService();
        this.svCompany = new CompanyService();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Company",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "companyName": "/src/CdApi/sys/moduleman",
    //                         "companyTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCompany.create(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:Create');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCompany.createSL(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:CreateSL');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Company",
    //         "a": "Get",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"companyId": 45763}
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
            await this.svCompany.getCompany(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCompany.getCompanySL(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:GetSL');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Company",
    //         "a": "GetType",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"companyTypeId": 45763}
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
    async GetType(req, res) {
        try {
            await this.svCompany.getCompanyTypeCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:Get');
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
            await this.svCompany.getCompanyCount(req, res);
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
            await this.svCompany.getCompanyCount(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCompany.getPagedSL(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:GetSL');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Company",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "companyName": "/corp-deskv1.2.1.2/system/modules/comm/controllers"
    //                         },
    //                         "where": {
    //                             "companyId": 45762
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
        console.log('CompanyController::Update()/01');
        try {
            console.log('CompanyController::Update()/02');
            await this.svCompany.update(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CompanyController::UpdateSL()/01');
        try {
            console.log('CompanyController::UpdateSL()/02');
            await this.svCompany.updateSL(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'CompanyController:UpdateSL');
        }
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Company",
    //         "a": "Delete",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": {"companyId": 45763}
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
            await this.svCompany.delete(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCompany.deleteSL(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

}