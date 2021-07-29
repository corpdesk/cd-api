import {
    createConnection,
    getConnection,
    ConnectionOptions,
    ConnectionManager,
    getConnectionManager,
    Connection
} from 'typeorm';
import config from '../../../config';
import { UserModel } from '../user/models/user.model';

// export async function connect() {
//     const options: ConnectionOptions = config.db;

//     if (process.env.NODE_ENV === 'production') {
//         try {
//             return getConnection(options.name);
//         } catch (error) {
//             return createConnection(options);
//         }
//     } else {
//         try {
//             await getConnection(options.name).close();
//             return createConnection(options);
//         } catch (error) {
//             return createConnection(options);
//         }
//     }
// }

export class Database {
    private connectionManager: ConnectionManager;

    constructor() {
        this.connectionManager = getConnectionManager();
    }

    async getConnection(): Promise<Connection> {
        const CONNECTION_NAME = 'default';

        let connection: Connection;

        if (this.connectionManager.has(CONNECTION_NAME)) {
            // logMessage(`Database.getConnection()-using existing connection::: ${CONNECTION_NAME}`);
            connection = await this.connectionManager.get(CONNECTION_NAME);

            if (!connection.isConnected) {
                connection = await connection.connect();
            }
        } else {
            // logMessage('Database.getConnection()-creating connection ...');
            // logMessage(`DB host::: ${process.env.DB_HOST}`);

            const connectionOptions: ConnectionOptions = {
                name: CONNECTION_NAME,
                type: 'mysql',
                port: 3306,
                host: process.env.DB_HOST,
                username: process.env.DB_USER,
                database: process.env.DB_NAME,
                password: process.env.DB_PWD,
                //   namingStrategy: new SnakeNamingStrategy(),
                // entities: Object.keys(entities).map((module) => entities[module]),
                // entities: ['../../../../src/CdApi/**/**/models/*.model.ts']
                entities: [ UserModel]
            };

            try {
                connection = await createConnection(connectionOptions);
            } catch (e) {
                console.log('conn error:', e);
            }

        }

        return connection;
    }
}

