import { BaseService } from '../../base/base.service';
import { CdPdf } from '../../utils/pdf';
import { OutputService } from '../services/output.service';

export class OutputController {
    b: BaseService;
    svOp: OutputService;
    constructor(){
        this.b = new BaseService();
        this.svOp = new OutputService();
    }
    
    async Pdf(req, res) {
        console.log('OutputService::Pdf()/01')
        try {
            console.log('OutputService::Pdf()/02')
            const pdf = new CdPdf();
            await this.svOp.generatePdf(req, res);
        } catch (e) {
            this.b.serviceErr(req, res, e, 'OutputService:Pdf');
        }
    }

    // async Print(req, res) {
    //     console.log('OutputService::Print()/01')
    //     try {
    //         console.log('OutputService::Print()/02')
    //         // await this.svOp.create(req, res);
    //     } catch (e) {
    //         this.b.serviceErr(req, res, e, 'OutputService:Print');
    //     }
    // }
}