import config from '../../../config';
import {
    createConnection,
    ConnectionOptions,
    ConnectionManager,
    getConnectionManager,
    Connection
} from 'typeorm';

const CONNECTION_NAME = process.env.DB_CONN_NAME;

export class Database {
    private connectionManager: ConnectionManager;
    connOptions = config.db as ConnectionOptions;

    constructor() {
        this.connectionManager = getConnectionManager();
    }

    async getConnection(): Promise<Connection> {
        let connection: Connection;
        if (this.connectionManager.has(CONNECTION_NAME)) {
            connection = await this.connectionManager.get(CONNECTION_NAME);
            if (!connection.isConnected) {
                connection = await connection.connect();
            }
        } else {
            const connectionOptions: ConnectionOptions = this.connOptions;
            try {
                connection = await createConnection(connectionOptions);
            } catch (e) {
                this.handleError(e);
            }
        }
        return connection;
    }

    async setConnEntity(model){
        await this.connOptions.entities.push(model);
    }

    handleError(e){
        console.log('Db::handleError()/e:', e)
    }
}

