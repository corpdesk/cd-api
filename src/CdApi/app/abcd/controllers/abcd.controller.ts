import { BaseService } from '../../../sys/base/base.service';
import { AbcdTypeService } from '../services/abcd-type.service';
import { AbcdService } from '../services/abcd.service';

export class AbcdController {

    b: BaseService;
    svAbcd: AbcdService;
    svAbcdType: AbcdTypeService

    constructor() {
        this.b = new BaseService();
        this.svAbcd = new AbcdService();
        this.svAbcdType = new AbcdTypeService();


    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Abcd",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "abcdStatName": "/src/CdApi/sys/moduleman",
    //                         "AbcdTypeId": "7ae902cd-5bc5-493b-a739-125f10ca0268",
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
            await this.svAbcd.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:Create');
        }
    }

    /**
     * CreateM, Create multiple
     * @param req 
     * @param res 
     */
    async CreateM(req, res) {
        try {
            await this.svAbcd.createM(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:CreateM');
        }
    }

    async CreateSL(req, res) {
        try {
            await this.svAbcd.createSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:CreateSL');
        }
    }

    

    /**
     * {
            "ctx": "App",
            "m": "Abcds",
            "c": "Abcd",
            "a": "Get",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"abcdStatName": "Kenya"}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Abcds","c": "Abcd","a": "Get","dat": {"f_vals": [{"query": {"where": {"abcdStatName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Get(req, res) {
        try {
            await this.svAbcd.getAbcd(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:Get');
        }
    }

    async GetSL(req, res) {
        try {
            await this.svAbcd.getAbcdSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "Abcds",
            "c": "Abcd",
            "a": "GetType",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"abcdTypeId": 100}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }

        curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "GetType","dat":{"f_vals": [{"query":{"where": {"abcdTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async GetType(req, res) {
        try {
            // await this.svAbcd.getAbcdType(req, res);
            await this.svAbcd.getCdObjTypeCount(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:Get');
        }
    }

    async GetType2(req, res) {
        try {
            // await this.svAbcd.getAbcdType(req, res);
            await this.svAbcd.getAbcdType2(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:GetType2');
        }
    }

    async SearchAbcdTypes(req, res) {
        try {
            // await this.svAbcd.getAbcdType(req, res);
            await this.svAbcd.searchAbcdTypes(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:GetType2');
        }
    }

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "Abcds",
            "c": "Abcd",
            "a": "GetCount",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["abcdStatId","abcdStatGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "GetCount","dat": {"f_vals": [{"query": {"select":["abcdStatId","abcdStatGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetCount(req, res) {
        try {
            await this.svAbcd.getAbcdQB(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:GetCount');
        }
    }

    /** Pageable request:
     * {
            "ctx": "App",
            "m": "Abcds",
            "c": "Abcd",
            "a": "GetPaged",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select":["abcdStatId","abcdStatGuid"],
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

     curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "GetPaged","dat": {"f_vals": [{"query": {"select":["abcdStatId","abcdStatGuid"],"where": {}, "take":5,"skip": 1}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'

     * @param req
     * @param res
     */
    async GetPaged(req, res) {
        try {
            await this.svAbcd.getAbcdPaged(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Get');
        }
    }

    async GetPagedSL(req, res) {
        try {
            await this.svAbcd.getPagedSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:GetSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "Abcds",
            "c": "Abcd",
            "a": "Update",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "update": {
                                "abcdAssets": null
                            },
                            "where": {
                                "abcdStatId": 1
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }

     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "Update","dat": {"f_vals": [{"query": {"update": {"abcdAssets": null},"where": {"abcdStatId": 1}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Update(req, res) {
        console.log('AbcdController::Update()/01');
        try {
            console.log('AbcdController::Update()/02');
            await this.svAbcd.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async UpdateSL(req, res) {
        console.log('AbcdController::UpdateSL()/01');
        try {
            console.log('AbcdController::UpdateSL()/02');
            await this.svAbcd.updateSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:UpdateSL');
        }
    }

    /**
     * {
            "ctx": "App",
            "m": "Abcds",
            "c": "Abcd",
            "a": "Delete",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "where": {"abcdStatId": 69}
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": null
        }
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "Delete","dat": {"f_vals": [{"query": {"where": {"abcdStatId": 69}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    async Delete(req, res) {
        try {
            await this.svAbcd.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'ModuleController:Update');
        }
    }

    async DeleteSL(req, res) {
        try {
            await this.svAbcd.deleteSL(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'BillController:DeleteSL');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "CreateType","dat": {"f_vals": [{"data": {"abcdTypeName": "Continental Apex"}}],"token": "3ffd785f-e885-4d37-addf-0e24379af338"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async CreateType(req, res) {
        try {
            await this.svAbcdType.create(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:CreateType');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "UpudateType","dat": {"f_vals": [{"data": {"abcdTypeName": "Continental Apex"}}],"token": "3ffd785f-e885-4d37-addf-0e24379af338"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async UpdateType(req, res) {
        try {
            await this.svAbcdType.update(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:EditType');
        }
    }

    /**
     * 
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Abcds","c": "Abcd","a": "DeleteType","dat": {"f_vals": [{"query": {"where": {"abcdTypeId": 107}}}],"token": "08f45393-c10e-4edd-af2c-bae1746247a1"},"args": {}}' http://localhost:3001 -v  | jq '.'
     * @param req 
     * @param res 
     */
    async DeleteType(req, res) {
        try {
            await this.svAbcdType.delete(req, res);
        } catch (e) {
            await this.b.serviceErr(req, res, e, 'AbcdController:DeleteType');
        }
    }

}