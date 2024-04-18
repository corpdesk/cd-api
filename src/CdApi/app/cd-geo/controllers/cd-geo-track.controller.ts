import { BaseService } from '../../../sys/base/base.service';
import { CdGeoTrackService } from '../services/cd-geo-track.service';

export class CdGeoTrackController {

    b: BaseService;
    svCdGeoTrack: CdGeoTrackService;

    constructor() {
        this.b = new BaseService();
        this.svCdGeoTrack = new CdGeoTrackService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "CdGeoTrack",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "CdGeoTrackName": "/src/CdApi/sys/moduleman",
    //                         "CdGeoTrackTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svCdGeoTrack.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svCdGeoTrack.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svCdGeoTrack.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "CdGeoTracks",
            "c": "CdGeoTrack",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-trackName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoTracks","c": "CdGeoTrack","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-trackName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svCdGeoTrack.getCdGeoTrack(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svCdGeoTrack.getCdGeoTrackSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:GetSL');
        }
    }

    

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "CdGeoTracks",
            "c": "CdGeoTrack",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["cd-geo-trackId","cd-geo-trackGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTracks","c": "CdGeoTrack","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["cd-geo-trackId","cd-geo-trackGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svCdGeoTrack.getCdGeoTrackPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svCdGeoTrack.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoTracks",
            "c": "CdGeoTrack",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "cd-geo-trackAssets": null
                            },
                            "where": {
                                "cd-geo-trackId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTracks","c": "CdGeoTrack","a": "Update","dat": {"f_vals": [{"query": {"update": {"cd-geo-trackAssets": null},"where": {"cd-geo-trackId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('CdGeoTrackController::Update()/01');
        try {
            console.log('CdGeoTrackController::Update()/02');
            await this.svCdGeoTrack.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('CdGeoTrackController::UpdateSL()/01');
        try {
            console.log('CdGeoTrackController::UpdateSL()/02');
            await this.svCdGeoTrack.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "CdGeoTracks",
            "c": "CdGeoTrack",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"cd-geo-trackId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoTracks","c": "CdGeoTrack","a": "Delete","dat": {"f_vals": [{"query": {"where": {"cd-geo-trackId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svCdGeoTrack.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svCdGeoTrack.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    

    async GetStats(req, res) {
        try {
            await this.svCdGeoTrack.getCdGeoTrackStats(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'CdGeoTrackController:Get');
        }
    }

}