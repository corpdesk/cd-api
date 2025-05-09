// basic imports

import config from './config';
// import express from 'express';
import express, { Application, Request, Response } from 'express';
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
import { createServer as createHttpServer } from 'http';
import https from 'https';
import { createServer as createHttpsServer } from 'https';
import fs from 'fs';
import path from 'path';
import * as WebSocket from 'ws';
import { server as WebSocketServer } from 'websocket';
import { Server, Socket } from 'socket.io';
import Redis from "ioredis";
import { SioService } from './CdApi/sys/cd-push/services/sio.service';
import { Logging } from './CdApi/sys/base/winston.log';
import { WebsocketService } from './CdApi/sys/cd-push/services/websocket.service';
import pusher from './CdApi/sys/cd-push/services/pusher';
import { getRedisClient } from './CdApi/sys/base/redis-client';



export class Main {
    logger: Logging;
    allowedOrigins = [config.Cors.options.origin[5]];
    constructor() {
        this.logger = new Logging();
    }
    async run() {
        this.logger.logInfo('Main::run()/01')
        // this.logger.logInfo('Main::run()/config.keyPath', {keyPath: config.keyPath} )
        // this.logger.logInfo('Main::run()/config.certPath', {certPath: config.certPath} )
        // this.logger.logInfo('Main::run()/config.caPath', {caPath: config.caPath} )
        // basic settings
        const app: Application = express();

        // Serve .well-known directory for Let's Encrypt validation
        // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

        const privateKey = fs.readFileSync(config.keyPath, 'utf8');
        const certificate = fs.readFileSync(config.certPath, 'utf8');


        let certAuth = '';
        // just in case certificate authority is not provided
        if (config.caPath.length > 0) {
            certAuth = fs.readFileSync(config.caPath, 'utf8');
        } else {
            certAuth = null
        }

        const credentials = {
            key: privateKey,
            cert: certificate,
            // ca: certAuth
        };


        const options = config.Cors.options;

        ////////////////////////////////////////////////////////////////////////////////
        const corsOptions = {
            origin: config.Cors.options.origin[5], // Replace with your client URL
            // origin: 'http://localhost', // for localhost teting
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };
        ////////////////////////////////////////////////////////////////////////////////

        let httpsServer = null;
        let corsOpts = null;

        //////////////////////////////////////////////////////////////////////////////
        app.use(cors(corsOptions));
        app.use(express.json()); // For parsing application/json
        app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board
        //////////////////////////////////////////////////////////////////////////////

        // Serve .well-known directory for Let's Encrypt validation
        // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
        app.use(config.http.webroot, express.static(path.join(__dirname, config.http.webroot)));

        // Create HTTP server
        const httpServer = createHttpServer(app);

        // Create HTTPS server
        httpsServer = https.createServer(credentials, app);
        corsOpts = {
            cors: {
                options: config.Cors.options.allowedHeaders,
                origin: config.Cors.options.origin
            }
        }


        /**
         * When run on sio mode in production,
         * use SSL
         * use cors
         */
        if (config.pushService.sio.enabled) {
            this.logger.logInfo('Main::run()/02')

            // const io = new Server(httpsServer, corsOpts);
            /////////////////////////////////////////////////////
            const io = new Server(httpsServer, {
                cors: {
                    origin: config.Cors.options.origin[5],
                    methods: ['GET', 'POST'],
                    credentials: true
                }
            });
            /////////////////////////////////////////////////////

            this.logger.logInfo('Main::run()/03')
            this.logger.logInfo('Main::run()/config.push.mode:', { mode: config.push.mode })
            // let pubClient = getRedisClient();
            let pubClient;
            let subClient;
            switch (config.push.mode) {
                case "PUSH_BASIC":
                    this.logger.logInfo('Main::run()/031')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort, legacyMode: true } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_CLUSTER":
                    this.logger.logInfo('Main::run()/032')
                    pubClient = new Redis.Cluster(config.push.startupNodes);
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_SENTINEL":
                    this.logger.logInfo('Main::run()/033')
                    pubClient = new Redis(config.push.sentinalOptions);
                    subClient = pubClient.duplicate();
                    break;
                default:
                    this.logger.logInfo('Main::run()/034')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
            }

            Promise.all([pubClient, subClient])
                .then(() => {
                    this.logger.logInfo('Main::run()/035')
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
        if (config.apiRoute === "/api" && config.secure === "false") {
            console.log("main/04")
            httpsServer = createServer(app);
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

        
        app.post('/sio/p-reg/', async (req: any, res: any) => {
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

        if (config.pushService.pusher.enabled) {
            app.post('/notify', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, channel, event } = req.body;
                // this.logger.logInfo("message:", message)
                pusher.trigger(channel, event, { message: "hello from server on '/notify'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/notify-user', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, userId } = req.body;
                const channel = `private-user-${userId}`;

                pusher.trigger(channel, 'user-event', { message: "hello from server on '/notify-user'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/pusher/auth', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const socketId = req.body.socket_id;
                const channel = req.body.channel_name;
                const auth = pusher.authenticate(socketId, channel);
                res.send(auth);
            });
        }

        if (config.pushService.wss.enabled) {

            console.log("main/05")
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


            // ///////////////////////////////////////////////////
            // const server = createHttpsServer(credentials, app);
            // const wsServer = new WebSocketServer({
            //     httpsServer: server,
            //     autoAcceptConnections: false
            // });


            // wsServer.on('request', function (request) {
            //     if (!this.originIsAllowed(request.origin)) {
            //         request.reject();
            //         console.log('Connection from origin ' + request.origin + ' rejected.');
            //         return;
            //     }

            //     const connection = request.accept(null, request.origin);
            //     console.log('Connection accepted.');

            //     connection.on('message', function (message) {
            //         if (message.type === 'utf8') {
            //             console.log('Received Message: ' + message.utf8Data);
            //             connection.sendUTF('Hello Client');
            //         }
            //     });

            //     connection.on('close', function (reasonCode, description) {
            //         console.log('Peer ' + connection.remoteAddress + ' disconnected.');
            //     });
            // });

        } else {

            if (config.http.enabled) {
                // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
                httpServer.listen(config.http.port, () => {
                    this.logger.logInfo(`HTTP server listening on port ${config.http.port}`);
                }).on('error', (e) => {
                    this.logger.logError(`HTTP server: listen()/Error: ${e}`);
                });
            }

            // start server
            httpsServer.listen(config.apiPort, () => {
                // console.log(`cd-api server is listening on ${config.apiPort}`);
                this.logger.logInfo(`cd-api server is listening on:`, { port: `${config.apiPort}` })
            })
                .on('error', (e) => {
                    this.logger.logError(`cd-api server: listen()/Error:${e}`)
                });
        }

    }

    originIsAllowed(origin: string) {
        return this.allowedOrigins.includes(origin);
    }

}

