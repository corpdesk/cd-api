import { BaseService } from './sys/base/base.service';
import { IRespInfo } from './sys/base/IBase';

export class CdExec {
    b: BaseService;
    constructor() {
        this.b = new BaseService();
    }
    async exec(req, res) {
        console.log('CdExec::exec()/01');
        if (await this.b.valid(req, res)) {
            console.log('CdExec::exec()/02');
            try {
                const pl = req.post; // payload;
                const ePath = this.b.entryPath(pl);
                const clsCtx = {
                    path: ePath,
                    clsName: `${pl.c}Controller`,
                    action: pl.a
                }
                console.log('CdExec::exec()/clsCtx:', clsCtx)
                await this.b.resolveCls(req, res, clsCtx);
            } catch (e) {
                console.log('CdExec::exec()/03');
                const i: IRespInfo = {
                    messages: e,
                    code: 'CdExec:exec:01',
                    app_msg: ''
                }
                await this.b.returnErr(req, res, i);
            }
        } else {
            console.log('CdExec::exec()/04');
            this.b.err.push('invalid request');
            const i: IRespInfo = {
                messages: this.b.err,
                code: 'CdExec:exec:02',
                app_msg: ''
            }
            await this.b.returnErr(req, res, i);
        }
    }

}