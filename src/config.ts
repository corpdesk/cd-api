import mysql from 'mysql2';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import "reflect-metadata";
import { DataSource, DatabaseType } from 'typeorm';
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
                'http://146.190.157.42:4500',
                'http://146.190.157.42:4407',
                'http://146.190.157.42:4402',
                'http://146.190.157.42:4401',
            ],
            preflightContinue: false,
        }
    },
    db: mysqlConfig,
    db2: mysqlConfig2,
    sqlite: sqliteConfig,
    push: {
        mode: process.env.PUSH_BASIC,
        serverHost: 'http://cd-sio-93',
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
                host: 'cd-sio-93'
            }
        ],
        /**
         * for redis-adapter sentinel
         */
        sentinalOptions: {
            sentinels: [
                { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
                { host: 'cd-sio-93', port: process.env.REDIS_PORT }
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