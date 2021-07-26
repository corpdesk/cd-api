import { BaseService } from './sys/base/base.service';
import { IRespInfo } from './sys/base/IBase';
import { CdPushController } from './sys/cd-push/controllers/cdpush.controller';

export class CdExec {
    b;
    constructor() {
        this.b = new BaseService();
        // this.pushSubscribe();
    }
    async exec(req, res) {
        if (this.b.valid(req, res)) {
            try {
                const pl = req.post; // payload;
                const ePath = this.b.entryPath(pl);
                const clsCtx = {
                    path: ePath,
                    clsName: `${pl.c}Controller`,
                    action: pl.a
                }
                await this.b.resolveCls(req, res, clsCtx);
            } catch (e) {
                const i: IRespInfo = {
                    messages: e,
                    code: 'CdExec:exec:01',
                    app_msg: ''
                }
                await this.b.returnErr(req, res, i);
            }
        } else {
            const e = 'invalid request';
            const i: IRespInfo = {
                messages: e,
                code: 'CdExec:exec:02',
                app_msg: ''
            }
            await this.b.returnErr(req, res, i);
        }
    }

}