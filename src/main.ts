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
import { Server } from 'socket.io';
import Redis from "ioredis";
import { SioService } from './CdApi/sys/cd-push/services/sio.service';



export class Main {
    async run() {

        // basic settings
        const app = express();
        // const port = config.apiPort;
        const options: cors.CorsOptions = config.Cors.options;
        app.use(cors());

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // initialize socket.io push server
        // const sio = new SioService()
        // sio.init()

        app.use(cors(options));
        const httpServer = createServer(app);
        const corsOpts = {
            cors: {
                origin: config.Cors.options.origin
            }
        }
        const io = new Server(httpServer, corsOpts);

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

        // set api entry point
        app.post('/', async (req: any, res: any) => {
            res.setHeader('Content-Type', 'application/json');
            CdInit(req, res, ds);
        });

        // start api server
        httpServer.listen(config.apiPort, () => {
            console.log(`cd-api server is listening on ${config.apiPort}`);
        })
            .on('error', (e) => {
                console.log(`cd-api server: listen()/Error:${e}`);
            });

        // start push server
        httpServer.listen(config.push.serverHost, () => {
            console.log(`cd-api server is listening on ${config.push.serverHost}`);
        })
            .on('error', (e) => {
                console.log(`cd-api server: listen()/Error:${e}`);
            });
    }

}