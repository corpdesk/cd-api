import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import config from '../../../config';

export const MysqlDataSource = new DataSource(config.db2 as DataSourceOptions)
