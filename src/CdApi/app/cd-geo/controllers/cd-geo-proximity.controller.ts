import { BaseService } from '../../../sys/base/base.service';
import { CdGeoProximityService } from '../services/cd-geo-proximity.service';

export class CdGeoProximityController {

    b: BaseService;
    svCdGeoProximity: CdGeoProximityService;

    constructor() {
        this.b = new BaseService();
        this.svCdGeoProximity = new CdGeoProximityService();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeoProximity",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoProximityName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoProximityTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeoProximity.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeoProximity.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeoProximity.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeoProximitys",
            "c": "CdGeoProximity",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-proximityName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoProximitys","c": "CdGeoProximity","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-proximityName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeoProximity.getCdGeoProximity(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeoProximity.getCdGeoProximitySL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:GetSL');
        }
    }


    async GetCount(req, res) {
        try {
            await this.svCdGeoProximity.getCdGeoProximityPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeoProximitys",
            "c": "CdGeoProximity",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geo-proximityId","cd-geo-proximityGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoProximitys","c": "CdGeoProximity","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geo-proximityId","cd-geo-proximityGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeoProximity.getCdGeoProximityPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeoProximity.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoProximitys",
            "c": "CdGeoProximity",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geo-proximityAssets": null
                            },
                            "where": {
                                "cd-geo-proximityId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoProximitys","c": "CdGeoProximity","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geo-proximityAssets": null},"where": {"cd-geo-proximityId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoProximityController::Update()/01');
        try {
            console.log('CdGeoProximityController::Update()/02');
            await this.svCdGeoProximity.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoProximityController::UpdateSL()/01');
        try {
            console.log('CdGeoProximityController::UpdateSL()/02');
            await this.svCdGeoProximity.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoProximitys",
            "c": "CdGeoProximity",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-proximityId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoProximitys","c": "CdGeoProximity","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geo-proximityId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeoProximity.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeoProximity.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    

    async GetStats(req, res) {
        try {
            await this.svCdGeoProximity.getCdGeoProximityStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoProximityController:Get');
        }
    }

}