import express from 'express';
import { CdInit } from './CdApi/init';

const app = express();
const port = 3000;
app.post('/', async (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    CdInit(req, res);
});
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
})
    .on('error', () => {
        console.log(`Error!`);
    });
