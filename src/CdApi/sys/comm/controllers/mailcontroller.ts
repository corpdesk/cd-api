import { BaseController } from '../../base/base.controller';

export class MailController {
    b: BaseController;
    constructor(){
        this.b = new BaseController();
    }
    // /**
    //  * {
    //         'ctx': 'Sys',
    //         'm': 'Comm',
    //         'c': 'MailController',
    //         'a': 'sendMail',
    //         'dat': {
    //             'f_vals': [
    //                 {
    //                     'service': 'CloudmailinService', // service as set by user or admin at the client side
    //                     'data': {
    //                         'guestUser': 1074,
    //                         'hostUser': 1010,
    //                         'group_invitation_type_id': 1313
    //                     }
    //                 }
    //             ],
    //             'token': '29947F3F-FF52-9659-F24C-90D716BC77B2'
    //         },
    //         'args': null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async sendMail(req, res) {
        console.log(`starting MailController::sendMail()`);
        const service = req.post.dat.f_vals[0].service;
        /**
         * note that the path below is applied at basecontroller
         * so the path must be set relative to basecontroller
         * NOT this controller
         */
        const cPath = `../${req.post.m.toLowerCase()}/services/${service.toLowerCase()}`; // relative to basecontroller because it is called from there
        const clsCtx = {
            path: cPath,
            clsName: service,
            action: req.post.a, // all services must implement send
        }
        console.log(`clsCtx: ${JSON.stringify(clsCtx)}`);
        const ret = await this.b.resolveCls(req, res, clsCtx);
        await this.b.respond(req, res, ret);
    }
}