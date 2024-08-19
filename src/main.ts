import config from './config';
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
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import fs from 'fs';
import path from 'path';
import * as WebSocket from 'ws';
import { Server, Socket } from 'socket.io';
import Redis from "ioredis";
import { SioService } from './CdApi/sys/cd-push/services/sio.service';
import { Logging } from './CdApi/sys/base/winston.log';
import { WebsocketService } from './CdApi/sys/cd-push/services/websocket.service';
import pusher from './CdApi/sys/cd-push/services/pusher';

export class Main {
    logger: Logging;
    allowedOrigins = ["https://asdap.net"];

    constructor() {
        this.logger = new Logging();
    }

    async run() {
        this.logger.logInfo('Main::run()/01');

        const app: Application = express();

        // Set up SSL credentials
        const privateKey = fs.readFileSync(config.keyPath, 'utf8');
        const certificate = fs.readFileSync(config.certPath, 'utf8');

        let certAuth = '';
        if (config.caPath.length > 0) {
            certAuth = fs.readFileSync(config.caPath, 'utf8');
        } else {
            certAuth = null;
        }

        const credentials = {
            key: privateKey,
            cert: certificate,
            // ca: certAuth
        };

        // CORS configuration
        const corsOptions = {
            // origin: 'https://asdap.net',
            origin: 'http://localhost',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };
        app.use(cors(corsOptions));
        app.use(express.json()); // For parsing application/json
        app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board

        // Serve .well-known directory for Let's Encrypt validation
        // app.get('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));
        // Serve .well-known/acme-challenge directory for Let's Encrypt validation
        // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));
        
        // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
        app.use(config.http.webroot, express.static(path.join(__dirname, config.http.webroot)));

        // // Define a route to serve the HTML file
        // app.get('/well-known/acme-challenge', (req, res) => {
        //     // Send the HTML file as the response
        //     res.sendFile(path.join(__dirname, '.well-known/acme-challenge/test-file.html'));
        // });

        // Create HTTP server
        const httpServer = createHttpServer(app);

        // Create HTTPS server
        const httpsServer = createHttpsServer(credentials, app);

        /**
         * Handle socket.io connections with SSL (for production)
         */
        if (config.pushService.sio.enabled) {
            this.logger.logInfo('Main::run()/02');

            const io = new Server(httpsServer, {
                cors: {
                    origin: 'https://asdap.net',
                    methods: ['GET', 'POST'],
                    credentials: true
                }
            });

            this.logger.logInfo('Main::run()/03');
            this.logger.logInfo('Main::run()/config.push.mode:', { mode: config.push.mode });

            let pubClient;
            let subClient;
            switch (config.push.mode) {
                case "PUSH_BASIC":
                    this.logger.logInfo('Main::run()/031');
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort, legacyMode: true } as RedisClientOptions);
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_CLUSTER":
                    this.logger.logInfo('Main::run()/032');
                    pubClient = new Redis.Cluster(config.push.startupNodes);
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_SENTINEL":
                    this.logger.logInfo('Main::run()/033');
                    pubClient = new Redis(config.push.sentinalOptions);
                    subClient = pubClient.duplicate();
                    break;
                default:
                    this.logger.logInfo('Main::run()/034');
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort } as RedisClientOptions);
                    subClient = pubClient.duplicate();
                    break;
            }

            Promise.all([pubClient, subClient])
                .then(() => {
                    this.logger.logInfo('Main::run()/035');
                    const svSio = new SioService();
                    svSio.run(io, pubClient, subClient);
                });
        }

        /**
         * Set up HTTP routing for API and redirect to HTTPS if needed
         */
        if (config.apiRoute === "/api" && config.secure === "false") {
            console.log("main/04");
            app.post(config.apiRoute, async (req: Request, res: Response) => {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                CdInit(req, res, ds);
            });
        }

        // Push service endpoints
        if (config.pushService.pusher.enabled) {
            app.post('/notify', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, channel, event } = req.body;
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

        if (config.http.enabled) {
            // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
            httpServer.listen(config.http.port, () => {
                this.logger.logInfo(`HTTP server listening on port ${config.http.port}`);
            }).on('error', (e) => {
                this.logger.logError(`HTTP server: listen()/Error: ${e}`);
            });
        }


        // Start HTTPS server
        httpsServer.listen(config.apiPort, () => {
            this.logger.logInfo(`HTTPS server is listening on port ${config.apiPort}`);
        }).on('error', (e) => {
            this.logger.logError(`HTTPS server: listen()/Error: ${e}`);
        });
    }

    originIsAllowed(origin: string) {
        return this.allowedOrigins.includes(origin);
    }
}
