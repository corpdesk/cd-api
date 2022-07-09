import {BaseService} from '../../base/base.service';

export class MailService{
    b: BaseService;
    constructor(){
        this.b = new BaseService();
    }
    
    async sendEmailNotif(req, res) {
        console.log(`starting UserController::sendEmailNotif(req, res)`);
        const mailService = 'NodemailerService';
        const cPath = `../comm/services/${mailService.toLowerCase()}`; // relative to BaseService because it is called from there
        const clsCtx = {
            path: cPath,
            clsName: mailService,
            action: 'sendMail'
        }
        console.log(`clsCtx: ${JSON.stringify(clsCtx)}`);
        const ret = await this.b.resolveCls(req, res, clsCtx);
    }
}