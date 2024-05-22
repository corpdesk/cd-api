// basic imports

import config from './config';
import express from 'express';
import cors from 'cors';
import 'reflect-metadata';

// database imports
import { MysqlDataSource as ds } from './CdApi/sys/base/data-source';

// corpdesk engine imports
import { CdInit } from './CdApi/init';

// push server imports
import { createClient, RedisClientOptions } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { createServer } from 'http';
// import { createServer as createHttps } from 'https';
// import { createServer as createTls } from 'tls';
// const https = require('https');
import { Server } from 'socket.io';
import Redis from "ioredis";
import { SioService } from './CdApi/sys/cd-push/services/sio.service';
import { Logging } from './CdApi/sys/base/winston.log';



export class Main {
    logger: Logging;
    constructor() {
        this.logger = new Logging();
    }
    async run() {

        // basic settings
        const app = express();
        // app.all('/*', function (req, res, next) {
        //     res.header("Access-Control-Allow-Origin", "*");
        //     res.header("Access-Control-Allow-Headers", "X-Requested-With");
        //     next();
        // });
        // const port = config.apiPort;
        const options = config.Cors.options;
        // app.use(cors());

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // initialize socket.io push server
        // const sio = new SioService()
        // sio.init()

        app.use(cors(options));
        // const httpServer = createHttps(app);
        const httpServer = createServer(app);
        const corsOpts = {
            cors: {
                options: config.Cors.options.allowedHeaders,
                // origin: config.Cors.options.origin,
                origin: null
            }
        }

        const io = new Server(httpServer, corsOpts);

        /////////////////////////////
        // const server = http.createServer();
        // const io = new Server(httpServer, {
        //     cors: {
        //         origin: (origin, callback) => {
        //             const allowedOrigins = ["https://cd-shell.asdap.africa", "https://146.190.157.42"];

        //             if (origin && allowedOrigins.includes(origin)) {
        //                 callback(null, true);
        //             } else {
        //                 callback(new Error("Not allowed by CORS"));
        //             }
        //         },
        //         methods: ["GET", "POST"],
        //     },
        // });
        ///////////////////////////////////////////

        let pubClient;
        let subClient;
        switch (config.push.mode) {
            case process.env.PUSH_BASIC:
                pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort, legacyMode: true } as RedisClientOptions);
                subClient = pubClient.duplicate();
                break;
            case process.env.PUSH_CLUSTER:
                pubClient = new Redis.Cluster(config.push.startupNodes);
                subClient = pubClient.duplicate();
                break;
            case process.env.PUSH_SENTINEL:
                pubClient = new Redis(config.push.sentinalOptions);
                subClient = pubClient.duplicate();
                break;
            default:
                pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort } as RedisClientOptions);
                subClient = pubClient.duplicate();
                break;
        }

        Promise.all([pubClient, subClient])
            .then(() => {
                const svSio = new SioService();
                svSio.run(io, pubClient, subClient)
            });
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        app.all('*', function (req, res, next) {
            // res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            if ('OPTIONS' == req.method) {
                res.sendStatus(200);
            } else {
                next();
            }
        });


        // set api entry point
        app.post('/api', async (req: any, res: any) => {
            console.log("app.post/01")
            res.setHeader('Content-Type', 'application/json');
            ////////////////////
            // res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res, ds);
        });

        // start api server
        httpServer.listen(config.apiPort, () => {
            // console.log(`cd-api server is listening on ${config.apiPort}`);
            this.logger.logInfo(`cd-api server is listening on:`, { port: `${config.apiPort}` })
        })
            .on('error', (e) => {
                this.logger.logError(`cd-api server: listen()/Error:${e}`)
            });


    }

}