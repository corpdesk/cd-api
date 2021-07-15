import { BaseController } from './sys/base/base.controller';

export class CdExec {
    b;
    constructor() {
        this.b = new BaseController();
    }
    async exec(req, res) {
        if (this.b.valid(req, res)) {
            try {
                const pl = req.post; // payload;
                const ePath = './' + pl.ctx.toLowerCase() + '/' + pl.m.toLowerCase() + '/controllers/' + pl.c.toLowerCase();
                console.log('init()/ePath:', ePath);
                const eImport = await import(ePath);
                const eCls = eImport[pl.c];
                const cls = new eCls();
                const ret = cls[pl.a]();
                console.log('init()/ret:', ret);
            } catch (e) {
                console.log('e:', e);
                return e;
            }

        } else {
            const err = 'invalid session';
            return this.b.returnErr(err);
        }
    }

}