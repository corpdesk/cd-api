import { BaseService } from '../../../sys/base/base.service';
import { CdGeoPhysicalTypeService } from '../services/cd-geo-physical-type.service';

export class CdGeoPhysicalTypeController {

    b: BaseService;
    svCdGeoPhysicalType: CdGeoPhysicalTypeService;

    constructor() {
        this.b = new BaseService();
        this.svCdGeoPhysicalType = new CdGeoPhysicalTypeService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeoPhysicalType",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoPhysicalTypeName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoPhysicalTypeTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeoPhysicalType.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeoPhysicalType.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeoPhysicalType.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeoPhysicalTypes",
            "c": "CdGeoPhysicalType",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-physical-typeName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoPhysicalTypes","c": "CdGeoPhysicalType","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-physical-typeName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeoPhysicalType.getCdGeoPhysicalType(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeoPhysicalType.getCdGeoPhysicalTypeSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:GetSL');
        }
    }

    

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeoPhysicalTypes",
            "c": "CdGeoPhysicalType",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geo-physical-typeId","cd-geo-physical-typeGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPhysicalTypes","c": "CdGeoPhysicalType","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geo-physical-typeId","cd-geo-physical-typeGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeoPhysicalType.getCdGeoPhysicalTypePaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeoPhysicalType.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoPhysicalTypes",
            "c": "CdGeoPhysicalType",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geo-physical-typeAssets": null
                            },
                            "where": {
                                "cd-geo-physical-typeId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPhysicalTypes","c": "CdGeoPhysicalType","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geo-physical-typeAssets": null},"where": {"cd-geo-physical-typeId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoPhysicalTypeController::Update()/01');
        try {
            console.log('CdGeoPhysicalTypeController::Update()/02');
            await this.svCdGeoPhysicalType.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoPhysicalTypeController::UpdateSL()/01');
        try {
            console.log('CdGeoPhysicalTypeController::UpdateSL()/02');
            await this.svCdGeoPhysicalType.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoPhysicalTypes",
            "c": "CdGeoPhysicalType",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-physical-typeId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoPhysicalTypes","c": "CdGeoPhysicalType","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geo-physical-typeId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeoPhysicalType.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeoPhysicalType.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    

    async GetStats(req, res) {
        try {
            await this.svCdGeoPhysicalType.getCdGeoPhysicalTypeStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoPhysicalTypeController:Get');
        }
    }

}