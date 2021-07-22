import { processPost } from './sys/utils/request';
import { CdExec } from './CdExec';
export async function CdInit(req, res) {
    console.log('starting CdInit (req, res)');
    const r = await processPost(req, res, async () => {
        const cb = new CdExec();
        await cb.exec(req, res);
        // res.status(200).json({ module: req.post.m });
    });
};


