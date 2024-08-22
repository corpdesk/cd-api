import { SelectQueryBuilder, Repository, Like } from 'typeorm';
import { EntityAdapter } from './entity-adapter';
import { IServiceInput } from '../base/IBase';

export interface QueryInput {
    select?: string[];
    where?: any;
    take?: number;
    skip?: number;
}

export class QueryBuilderHelper {
    entityAdapter: EntityAdapter;
    constructor(
        private repository: Repository<any>
    ) { 
        this.entityAdapter = new EntityAdapter();
    }

    transformWhereClause(where: any): any {
        if (Array.isArray(where)) {
            return where.map((condition) => {
                const field = Object.keys(condition)[0];
                const value = condition[field];
                if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
                    const match = value.match(/^Like\((.*)\)$/);
                    if (match) {
                        return { [field]: Like(match[1]) };
                    }
                }
                return condition;
            });
        }
        return where;
    }

    createQueryBuilder(serviceInput: IServiceInput): SelectQueryBuilder<any> {
        const query = serviceInput.cmd.query;
        const queryBuilder = this.repository.createQueryBuilder(this.repository.metadata.name);

        // Handling SELECT clause
        if (query.select && query.select.length > 0) {
            this.entityAdapter.registerMappingFromEntity(serviceInput.serviceModel);
            const selectDB = this.entityAdapter.getDbSelect(this.repository.metadata.name,query.select)
            console.log('QueryBuilderHelper::createQueryBuilder()/selectDB:', selectDB)
            queryBuilder.select(selectDB);
            // query.select.forEach(field => {
            //     const fullyQualifiedField = `${this.repository.metadata.name}.${this.getDatabaseColumnName(field)}`;
            //     queryBuilder.addSelect(fullyQualifiedField);
            // });
        } else {
            const allColumns = this.repository.metadata.columns.map(column => `${this.repository.metadata.name}.${column.databaseName}`);
            queryBuilder.select(allColumns);
        }

        // Handling WHERE clause
        if (query.where) {
            if (typeof query.where === 'object' && !Array.isArray(query.where) && !this.isEmptyObject(query.where)) {
                // If 'where' is an object
                this.processObjectWhereClause(queryBuilder, query.where);
            } else if (Array.isArray(query.where) && query.where.length > 0) {
                // If 'where' is an array
                this.processArrayWhereClause(queryBuilder, query.where);
            }
        }

        // Handling TAKE and SKIP clauses
        if (query.take) {
            queryBuilder.take(query.take);
        }

        if (query.skip) {
            queryBuilder.skip(query.skip);
        }

        return queryBuilder;
    }

    private processObjectWhereClause(queryBuilder: SelectQueryBuilder<any>, where: any): void {
        Object.keys(where).forEach((key, index) => {
            const value = where[key];
            const dbField = `${this.repository.metadata.name}.${this.getDatabaseColumnName(key)}`;
            const condition = `${dbField} = :${key}`;

            if (index === 0) {
                queryBuilder.where(condition, { [key]: value });
            } else {
                queryBuilder.andWhere(condition, { [key]: value });
            }
        });
    }

    private processArrayWhereClause(queryBuilder: SelectQueryBuilder<any>, whereArray: any[]): void {
        console.log('QueryBuilderHelper::processArrayWhereClause/whereArray:', whereArray)
        whereArray.forEach((condition, index) => {
            const key = Object.keys(condition)[0];
            const value = condition[key];
            const dbField = `${this.repository.metadata.name}.${this.getDatabaseColumnName(key)}`;
            console.log('QueryBuilderHelper::processArrayWhereClause/dbField:', dbField)

            if (index === 0) {
                queryBuilder.where(`${dbField} = :${key}`, { [key]: value });
            } else {
                queryBuilder.andWhere(`${dbField} = :${key}`, { [key]: value });
            }
        });
        console.log('QueryBuilderHelper::processArrayWhereClause/sql-01:', queryBuilder.getSql())
    }

    private getDatabaseColumnName(field: string): string {
        const column = this.repository.metadata.findColumnWithPropertyName(field);
        return column ? column.databaseName : field;
    }

    isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }
}
