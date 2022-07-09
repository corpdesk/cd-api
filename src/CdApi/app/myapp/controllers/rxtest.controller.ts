import { BaseService } from '../../../sys/base/base.service';
import { CdController } from '../../../sys/base/cd.controller';
import { allowedModules$ } from '../services/allowedModules$';
import { RxCombinedResult } from '../services/rxcombinedresult';
import { RxRecursiveService } from '../services/rxrecursive.service';
import { RxTestService } from '../services/rxtest.service';

export class RxTestController extends CdController {
    b: BaseService;
    srvRxTest: RxTestService;
    srvRxRecursive: RxRecursiveService;
    srvRxCombined: RxCombinedResult;
    constructor() {
        super();
        this.b = new BaseService();
        this.srvRxTest = new RxTestService();
        this.srvRxRecursive = new RxRecursiveService();
        this.srvRxCombined = new RxCombinedResult();
    }

    async getModules(req, res) {
        try {
            // set the appropriate userGuid and consumerGuid
            await this.srvRxTest.getAclModule2(req, res);
        } catch (e) {
            // await this.b.serviceErr(res, e, 'RxTestController:create');
        }
    }

    // /**
    //  * Adopted
    //  * @param req
    //  * @param res
    //  */
    // async getTestRecursive(req, res) {
    //     try {
    //         await this.srvRxRecursive.testRecursive(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(res, e, 'RxTestController:create');
    //     }
    // }

    async getMenuTest(req, res) {
        try {
            const moduleData = {
                consumerId: 33,
                cdObjTypeId: 3,
                cdObjId: 6370,
                consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
                moduleId: 45,
                moduleGuid: '-dkkm6',
                moduleName: 'user',
                moduleIsPublic: 1,
                isSysModule: 1,
                moduleEnabled: 1,
                groupGuid: '-dkkm6',
                moduleTypeId: 1
            };
            await this.srvRxRecursive.getModuleMenu$(req, res, moduleData);
        } catch (e) {
            // this.b.serviceErr(res, e, 'RxTestController:create');
        }
    }

    // async attachMenu(req, res) {
    //     try {
    //         await this.srvRxRecursive.attachMenu$(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(res, e, 'RxTestController:create');
    //     }
    // }

    async combinedData(req, res) {
        try {
            await this.srvRxCombined.getCombinedData(req, res);
        } catch (e) {
            // this.b.serviceErr(res, e, 'RxTestController:combinedData');
        }
    }

    async flat2Nested(req, res) {
        try {
            await this.srvRxRecursive.flat2Nested2(req, res);
        } catch (e) {
            // this.b.serviceErr(res, e, 'RxTestController:flat2Nested');
        }
    }

    async menuCollection(req, res) {
        try {
            await this.srvRxRecursive.menuCollection3(req, res, {modules$: allowedModules$, modulesCount: 11});
        } catch (e) {
            // this.b.serviceErr(res, e, 'RxTestController:menuCollection');
        }
    }

}