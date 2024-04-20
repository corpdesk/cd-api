import { BaseService } from '../../../sys/base/base.service';
import { CdGeoLocationService } from '../services/cd-geo-location.service';

export class CdGeoLocationController {

    b: BaseService;
    svCdGeoLocation: CdGeoLocationService;

    constructor() {
        this.b = new BaseService();
        this.svCdGeoLocation = new CdGeoLocationService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeoLocation",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoLocationName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoLocationTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeoLocation.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeoLocation.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeoLocation.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeoLocations",
            "c": "CdGeoLocation",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-locationName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoLocations","c": "CdGeoLocation","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-locationName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeoLocation.getCdGeoLocation(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeoLocation.getCdGeoLocationSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:GetSL');
        }
    }

    

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeoLocations",
            "c": "CdGeoLocation",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geo-locationId","cd-geo-locationGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoLocations","c": "CdGeoLocation","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geo-locationId","cd-geo-locationGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeoLocation.getCdGeoLocationPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeoLocation.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoLocations",
            "c": "CdGeoLocation",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geo-locationAssets": null
                            },
                            "where": {
                                "cd-geo-locationId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoLocations","c": "CdGeoLocation","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geo-locationAssets": null},"where": {"cd-geo-locationId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoLocationController::Update()/01');
        try {
            console.log('CdGeoLocationController::Update()/02');
            await this.svCdGeoLocation.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoLocationController::UpdateSL()/01');
        try {
            console.log('CdGeoLocationController::UpdateSL()/02');
            await this.svCdGeoLocation.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoLocations",
            "c": "CdGeoLocation",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-locationId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoLocations","c": "CdGeoLocation","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geo-locationId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeoLocation.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeoLocation.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    

    async GetStats(req, res) {
        try {
            await this.svCdGeoLocation.getCdGeoLocationStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoLocationController:Get');
        }
    }

    
    /**
     * connect to https://www.back4app.com api
     * and fetch country by objectId
     * @param req 
     * @param res 
     */
    async GetCountryByObjId(req, res){
        try {
            await this.svCdGeoLocation.GetCountryByObjId(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'GetCountryByObjId:Create');
        }
    }

    /**
     * connect to https://www.back4app.com api
     * and fetch country by objectId
     * @param req 
     * @param res 
     */
    async GetCountry(req, res){
        try {
            await this.svCdGeoLocation.GetCountry(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'GetCountryByObjId:Create');
        }
    }


    /**
     * connect to https://www.back4app.com api
     * and fetch Subdivisions, States and Provinces
     * @param req 
     * @param res 
     */
    async SubdivisionStatesProvinces(req, res){
        try {
            await this.svCdGeoLocation.SubdivisionStatesProvinces(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'SubdivisionStatesProvinces:Create');
        }
    }

}