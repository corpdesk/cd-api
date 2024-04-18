import { BaseService } from '../../../sys/base/base.service';
import { CdGeoTypeService } from '../services/cd-geo-type.service';

export class CdGeoTypeController {

    b: BaseService;
    svCdGeoType: CdGeoTypeService;

    constructor() {
        this.b = new BaseService();
        this.svCdGeoType = new CdGeoTypeService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeoType",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoTypeName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoTypeTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeoType.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeoType.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeoType.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeoTypes",
            "c": "CdGeoType",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-typeName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoTypes","c": "CdGeoType","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-typeName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeoType.getCdGeoType(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeoType.getCdGeoTypeSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:GetSL');
        }
    }

    

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeoTypes",
            "c": "CdGeoType",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geo-typeId","cd-geo-typeGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTypes","c": "CdGeoType","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geo-typeId","cd-geo-typeGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeoType.getCdGeoTypePaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeoType.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoTypes",
            "c": "CdGeoType",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geo-typeAssets": null
                            },
                            "where": {
                                "cd-geo-typeId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTypes","c": "CdGeoType","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geo-typeAssets": null},"where": {"cd-geo-typeId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoTypeController::Update()/01');
        try {
            console.log('CdGeoTypeController::Update()/02');
            await this.svCdGeoType.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoTypeController::UpdateSL()/01');
        try {
            console.log('CdGeoTypeController::UpdateSL()/02');
            await this.svCdGeoType.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoTypes",
            "c": "CdGeoType",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-typeId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTypes","c": "CdGeoType","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geo-typeId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeoType.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeoType.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    

    async GetStats(req, res) {
        try {
            await this.svCdGeoType.getCdGeoTypeStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTypeController:Get');
        }
    }

}