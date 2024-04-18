import { BaseService } from '../../../sys/base/base.service';
import { CdGeoPoliticalTypeService } from '../services/cd-geo-political-type.service';

export class CdGeoPoliticalTypeController {

    b: BaseService;
    svCdGeoPoliticalType: CdGeoPoliticalTypeService;

    constructor() {
        this.b = new BaseService();
        this.svCdGeoPoliticalType = new CdGeoPoliticalTypeService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeoPoliticalType",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoPoliticalTypeName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoPoliticalTypeTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeoPoliticalType.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeoPoliticalType.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeoPoliticalType.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeoPoliticalTypes",
            "c": "CdGeoPoliticalType",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-political-typeName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoPoliticalTypes","c": "CdGeoPoliticalType","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-political-typeName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeoPoliticalType.getCdGeoPoliticalType(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeoPoliticalType.getCdGeoPoliticalTypeSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:GetSL');
        }
    }

    

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeoPoliticalTypes",
            "c": "CdGeoPoliticalType",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geo-political-typeId","cd-geo-political-typeGuid"],
                            "where": {},
                            "take": 5,
                            "skip": 1
                            }
                    }
                ],
                "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
            },
            "args": null
        }

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPoliticalTypes","c": "CdGeoPoliticalType","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geo-political-typeId","cd-geo-political-typeGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeoPoliticalType.getCdGeoPoliticalTypePaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeoPoliticalType.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoPoliticalTypes",
            "c": "CdGeoPoliticalType",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geo-political-typeAssets": null
                            },
                            "where": {
                                "cd-geo-political-typeId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPoliticalTypes","c": "CdGeoPoliticalType","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geo-political-typeAssets": null},"where": {"cd-geo-political-typeId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoPoliticalTypeController::Update()/01');
        try {
            console.log('CdGeoPoliticalTypeController::Update()/02');
            await this.svCdGeoPoliticalType.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoPoliticalTypeController::UpdateSL()/01');
        try {
            console.log('CdGeoPoliticalTypeController::UpdateSL()/02');
            await this.svCdGeoPoliticalType.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoPoliticalTypes",
            "c": "CdGeoPoliticalType",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-political-typeId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPoliticalTypes","c": "CdGeoPoliticalType","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geo-political-typeId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeoPoliticalType.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeoPoliticalType.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    

    async GetStats(req, res) {
        try {
            await this.svCdGeoPoliticalType.getCdGeoPoliticalTypeStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPoliticalTypeController:Get');
        }
    }

}