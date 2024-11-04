import { BaseService } from '../../../sys/base/base.service';
import { CdGeoTypeService } from '../services/cd-geo-type.service';
import { CdGeoService } from '../services/cd-geo.service';

export class CdGeoController {

    b: BaseService;
    svCdGeo: CdGeoService;
    svCdGeoType: CdGeoTypeService

    constructor() {
        this.b = new BaseService();
        this.svCdGeo = new CdGeoService();
        this.svCdGeoType = new CdGeoTypeService();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeo",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeo.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeo.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeo.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeos",
            "c": "CdGeo",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geoName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeos","c": "CdGeo","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geoName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeo.getCdGeo(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeo.getCdGeoSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeos",
            "c": "CdGeo",
            "a": "GetType",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geoTypeId": 100}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "GetType","dat":{"f_vals": [{"query":{"where": {"cd-geoTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async GetType(req, res) {
        try {
            await this.svCdGeo.getCdGeoType(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:Get');
        }
    }

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeos",
            "c": "CdGeo",
            "a": "GetCount",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geoId","cd-geoGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "GetCount","dat": {"f_vals": [{"query": {"select":["cd-geoId","cd-geoGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetCount(req, res) {
        try {
            await this.svCdGeo.getCdGeoPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeos",
            "c": "CdGeo",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geoId","cd-geoGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geoId","cd-geoGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeo.getCdGeoPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeo.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeos",
            "c": "CdGeo",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geoAssets": null
                            },
                            "where": {
                                "cd-geoId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geoAssets": null},"where": {"cd-geoId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoController::Update()/01');
        try {
            console.log('CdGeoController::Update()/02');
            await this.svCdGeo.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoController::UpdateSL()/01');
        try {
            console.log('CdGeoController::UpdateSL()/02');
            await this.svCdGeo.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeos",
            "c": "CdGeo",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geoId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geoId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeo.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeo.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "CreateType","dat": {"f_vals": [{"data": {"cd-geoTypeName": "Continental Apex"}}],"token": "3ffd785f-e885-4d37-addf-0e24379af338"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async CreateType(req, res) {
        try {
            await this.svCdGeoType.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:CreateType');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "UpudateType","dat": {"f_vals": [{"data": {"cd-geoTypeName": "Continental Apex"}}],"token": "3ffd785f-e885-4d37-addf-0e24379af338"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async UpdateType(req, res) {
        try {
            await this.svCdGeoType.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:EditType');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeos","c": "CdGeo","a": "DeleteType","dat": {"f_vals": [{"query": {"where": {"cd-geoTypeId": 107}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async DeleteType(req, res) {
        try {
            await this.svCdGeoType.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:DeleteType');
        }
    }

    async GetStats(req, res) {
        try {
            await this.svCdGeo.getCdGeoStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoController:Get');
        }
    }

}