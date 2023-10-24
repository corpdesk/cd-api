///////////////////////////


import mysql from 'mysql2';
import * as dotenv from 'dotenv';
import "reflect-metadata";
import { DatabaseType } from 'typeorm';
// import { SessionModel } from './CdApi/sys/user/models/session.model';
dotenv.config();

// const mysqlConn = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PWD,
//   database: process.env.DB_NAME
// });

const mysqlConfig = {
    // type: 'mysql',
    // host: process.env.DB_HOST,
    // port: 3306,
    // username: process.env.DB_USER,
    // password: process.env.DB_PWD,
    // database: process.env.DB_NAME,
    // synchronize: true,
    // logging: false,
    // entities: [
    //    'src/CdApi/**/**/models/*.model.ts'
    // ],
    // migrations: [
    //    'src/migration/**/*.ts'
    // ]
    // ,
    // subscribers: [
    //    'src/subscriber/**/*.ts'
    // ],
    // cli: {
    //    'entitiesDir': 'src/entity',
    //    'migrationsDir': 'src/migration',
    //    'subscribersDir': 'src/subscriber'
    // }
    name: 'default',
    type: 'mysql',
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    // keepConnectionAlive: true,
    entities: [
        __dirname + '/CdApi/sys/user/models/*.model.ts',
        __dirname + '/CdApi/sys/moduleman/models/*.model.ts',
        __dirname + '/CdApi/sys/comm/models/*.model.ts',
        __dirname + '/CdApi/sys/scheduler/models/*.model.ts',
        __dirname + '/CdApi/app/cd-accts/models/*.model.ts',
    ],
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
    logging: ["query", "error"]
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
    entities: [
        __dirname + '/CdApi/sys/user/models/*.model.ts',
        __dirname + '/CdApi/sys/moduleman/models/*.model.ts',
        __dirname + '/CdApi/sys/comm/models/*.model.ts',
        __dirname + '/CdApi/sys/scheduler/models/*.model.ts',
        __dirname + '/CdApi/app/cd-accts/models/*.model.ts',
    ],
    migrations: [],
    subscribers: [],
}

// export const sqliteConfig: ConnectionOptions = {
//     name: 'sqlite1',
//     type: 'sqlite',
//     database: __dirname + '/database.sqlite',
//     synchronize: false,
//     // keepConnectionAlive: true,
//     logging: false,
//     entities: [
//         // BillModel
//         // __dirname + '/CdApi/app/accts/models/*.model.ts'
//         __dirname + '/CdApi/app/accts/models/*.model.ts',
//         __dirname + '/CdApi/sys/moduleman/models/company.model.ts'
//     ],
//     // migrations: [
//     //   'src/app/data/migrations/**/*.ts'
//     // ],
//     // subscribers: [
//     //   'src/app/data/subscribers/**/*.subscriber.ts'
//     // ],
//     // cli: {
//     //   'entitiesDir': 'src/app/data/entities',
//     //   'migrationsDir': 'src/app/data/migrations',
//     //   'subscribersDir': 'src/app/data/subscribers'
//     // }
// };

export async function sqliteConfig(connName): Promise<any> {
    return {
        name: connName,
        type: 'sqlite',
        database: __dirname + '/database.sqlite',
        synchronize: false,
        // keepConnectionAlive: true,
        logging: false,
        entities: [
            // BillModel
            // __dirname + '/CdApi/app/accts/models/*.model.ts'
            __dirname + '/CdApi/app/accts/models/*.model.ts',
            __dirname + '/CdApi/sys/moduleman/models/company.model.ts'
        ],
        // migrations: [
        //   'src/app/data/migrations/**/*.ts'
        // ],
        // subscribers: [
        //   'src/app/data/subscribers/**/*.subscriber.ts'
        // ],
        // cli: {
        //   'entitiesDir': 'src/app/data/entities',
        //   'migrationsDir': 'src/app/data/migrations',
        //   'subscribersDir': 'src/app/data/subscribers'
        // }
    };
}


//  name: 'default',
//         type: 'mysql',
//         host: 'localhost',
//         port: 3306,
//         username: 'test',
//         password: 'test',
//         database: 'test',
//         synchronize: true,
//         logging: false,
//         entities: [UserEntity],

///////////////////////////

const API_PORT = process.env.API_PORT;
const END_POINT = `${process.env.API_URL}:${API_PORT}`;
// const ORIGIN = `${process.env.ORIGIN_URL}:${ORIGIN_PORT}`;

export default {
    apiPort: process.env.API_PORT,
    endPoint: END_POINT,
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
                'http://cd-shell.io',
                'http://cd-user.io',
                'http://cd-moduleman.io',
                'http://cd-comm.io',
            ],
            preflightContinue: false,
        }
    },
    db: mysqlConfig,
    db2: mysqlConfig2,
    sqlite: sqliteConfig,
    push: {
        mode: process.env.PUSH_BASIC,
        serverHost: 'http://cd-api-01',
        serverPort: process.env.SIO_PORT,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT,
        /**
         * for redis-adapter cluster
         */
        startupNodes: [
            {
                port: 6380,
                host: 'cd-aip-01'
            },
            {
                port: 6381,
                host: 'cd-api-01'
            }
        ],
        /**
         * for redis-adapter sentinel
         */
        sentinalOptions: {
            sentinels: [
                { host: 'cd-api-01', port: 26379 },
                { host: 'cd-api-01', port: 26379 }
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