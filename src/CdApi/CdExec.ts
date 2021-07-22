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
                const ePath = `./${pl.ctx.toLowerCase()}/${pl.m.toLowerCase()}/controllers/${pl.c.toLowerCase()}`;
                const eImport = await import(ePath);
                const eCls = eImport[pl.c];
                const cls = new eCls();
                const ret = await cls[pl.a](req, res);
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