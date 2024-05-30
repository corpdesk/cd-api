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
import https from 'https';
import fs from 'fs';
import path from 'path';
import * as WebSocket from 'ws';
import { Server } from 'socket.io';
import Redis from "ioredis";
import { SioService } from './CdApi/sys/cd-push/services/sio.service';
import { Logging } from './CdApi/sys/base/winston.log';
import { WebsocketService } from './CdApi/sys/cd-push/services/websocket.service';



export class Main {
    logger: Logging;
    constructor() {
        this.logger = new Logging();
    }
    async run() {
        console.log("main/01")
        // basic settings
        const app = express();

        const privateKey = fs.readFileSync(config.keyPath, 'utf8');
        const certificate = fs.readFileSync(config.certPath, 'utf8');
        const ca = fs.readFileSync(config.caPath, 'utf8');

        const credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };


        const options = config.Cors.options;

        let httpServer = null;
        let corsOpts = null;

        /**
         * When run on sio mode in production,
         * use SSL
         * use cors
         */
        if (config.apiRoute === "/sio" && config.secure === "true") {
            httpServer = https.createServer(credentials, app);
            corsOpts = {
                cors: {
                    options: config.Cors.options.allowedHeaders,
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
        }

        /**
         * When run on app mode in production,
         * use without SSL...but behind nginx proxy server fitted with SSL
         * do not use cors...but set it at nginx
         */
        if (config.apiRoute === "/app" && config.secure === "false") {
            httpServer = createServer(app);
            corsOpts = {
                cors: {
                    options: config.Cors.options.allowedHeaders,
                    origin: null
                }
            }
        }

        // app.all('*', function (req, res, next) {
        //     // res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
        //     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        //     res.header('Access-Control-Allow-Headers', 'Content-Type');
        //     if ('OPTIONS' == req.method) {
        //         res.sendStatus(200);
        //     } else {
        //         next();
        //     }
        // });

        app.post('/sio/p-reg', async (req: any, res: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res);
        });


        // set api entry point
        app.post(config.apiRoute, async (req: any, res: any) => {
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

        if (config.apiRoute === "/sio" && config.mode === "wss") {
            const expressServer = app.listen(config.wssPort, () => {
                console.log(`server is listening on ${config.wssPort}`);
            })
                .on('error', (e) => {
                    console.log(`Error:${e}`);
                });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            // Define the WebSocket server. Here, the server mounts to the `/ws`
            // route of the Express JS server.
            const wss = new WebSocket.Server({
                server: expressServer,
                path: '/ws'
            });
            /**
             * run the websocket
             */
            const cdWs = new WebsocketService();
            cdWs.run(wss);
        }


    }

}