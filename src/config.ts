import mysql from 'mysql2';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import "reflect-metadata";
import { DataSource, DatabaseType } from 'typeorm';
import path from 'path';
dotenv.config();

const ENTITIES = [
    __dirname + '/CdApi/sys/user/models/*.model.ts',
    __dirname + '/CdApi/sys/moduleman/models/*.model.ts',
    __dirname + '/CdApi/sys/comm/models/*.model.ts',
    __dirname + '/CdApi/sys/scheduler/models/*.model.ts',
    __dirname + '/CdApi/app/cd-accts/models/*.model.ts',
    __dirname + '/CdApi/app/coops/models/*.model.ts',
    __dirname + '/CdApi/app/cd-geo/models/*.model.ts',
]


export const AppDataSource = new DataSource({
    name: 'conn2',
    type: "mysql",
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    synchronize: false,
    logging: false,
    // entities: [UserModel],
    entities: ENTITIES,
    migrations: [],
    subscribers: [],
})


const mysqlConfig = {
    name: 'default',
    type: 'mysql',
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    // keepConnectionAlive: true,
    entities: ENTITIES,
    /**
     * LOGGING OPTIONS
     * query - logs all queries.
     * error - logs all failed queries and errors.
     * schema - logs the schema build process.
     * warn - logs internal orm warnings.
     * info - logs internal orm informative messages.
     * log - logs internal orm log messages.
     */
    // logging: [
    //     'query', 
    //     // 'error',
    //     // 'schema',
    //     // 'warn', 
    //     // 'info', 
    //     // 'log'
    // ],
    logging: ["query", "error","warn","log"]
    // logging: "all"
};

const mysqlConfig2 = {
    type: "mysql",
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    synchronize: true,
    logging: false,
    entities: ENTITIES,
    migrations: [],
    subscribers: [],
}

export async function sqliteConfig(connName): Promise<any> {
    return {
        name: connName,
        type: 'sqlite',
        database: __dirname + '/database.sqlite',
        synchronize: false,
        // keepConnectionAlive: true,
        logging: false,
        entities: ENTITIES,
    };
}



const API_PORT = process.env.API_PORT;
const END_POINT = `${process.env.API_URL}:${API_PORT}`;

export default {
    apiPort: process.env.API_PORT,
    endPoint: END_POINT,
    back4app: {
        url: process.env.B4A_URL,
        appId: process.env.X_Parse_Application_Id,
        apiKey: process.env.X_Parse_REST_API_Key
    },
    Cors: {
        options: {
            key:fs.readFileSync(path.join(process.env.CERT_PATH)),
            cert:fs.readFileSync(path.join(process.env.KEY_PATH)),
            ca:fs.readFileSync(path.join(process.env.CA_PATH)),
            ecdhCurve: 'secp384r1',
            // ecdhCurve: 'auto',
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
            ],
            credentials: true,
            methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
            origin: [
                'https://146.190.157.42',
                'http://146.190.157.42',
                'https://localhost:443',
                'https://127.0.0.1:443',
                'http://localhost:80',
                'http://127.0.0.1:80',
                'https://cd-shell.asdap.africa',
                'http://64.23.145.54'
                // 'https://146.190.157.42:4407',
                // 'https://146.190.157.42:4402',
                // 'https://146.190.157.42:4401',
            ],
            preflightContinue: false,
        }
    },
    db: mysqlConfig,
    db2: mysqlConfig2,
    sqlite: sqliteConfig,
    push: {
        mode: process.env.PUSH_BASIC,
        serverHost: 'https://146.190.157.42',
        serverPort: process.env.SIO_PORT,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT,
        /**
         * for redis-adapter cluster
         */
        startupNodes: [
            {
                port: 6380,
                host: process.env.REDIS_HOST
            },
            {
                port: 6381,
                host: '146.190.157.42'
            }
        ],
        /**
         * for redis-adapter sentinel
         */
        sentinalOptions: {
            sentinels: [
                { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
                { host: 'cd-shell.asdap.africa', port: Number(process.env.REDIS_PORT) }
            ],
            name: 'master01'
        }
    },
    cache: {
        ttl: 600
    },
    usePush: true,
    usePolling: true,
    useCacheStore: true,
}

export function mailConfig(username, password) {
    return {
        mailService: 'cloudmailin',
        host: 'zohomail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: username,
            pass: password,
        },
        logger: true
    }
}