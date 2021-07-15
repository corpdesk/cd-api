import express from 'express';
import { processPost } from './utils/request';
import { CdInit } from './CdApi/init';
// import bodyParser from 'body-parser';

const app = express();
const port = 3000;
app.post('/', async (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    // processPost(req, res);
    CdInit(req, res);
});
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
})
    .on('error', () => {
        console.log(`Error!`);
    });
