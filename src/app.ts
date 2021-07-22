import config from './config';
import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { CdInit } from './CdApi/init';

const app = express();
const port = config.apiPort;
const options: cors.CorsOptions = config.Cors.options;

app.use(cors(options));
app.options('*', cors(options)); // enable pre-flight

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
