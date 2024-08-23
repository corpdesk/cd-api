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
    
    constructor(private repository: Repository<any>) {
        this.entityAdapter = new EntityAdapter();
    }

    transformWhereClause(where: any): any {
        console.log('QueryBuilderHelper::transformWhereClause()/01');
        console.log('QueryBuilderHelper::transformWhereClause()/where:', where);
        if (Array.isArray(where)) {
            console.log('QueryBuilderHelper::transformWhereClause()/where:', where);
            console.log('QueryBuilderHelper::transformWhereClause()/02');
            return where.map((condition) => {
                console.log('QueryBuilderHelper::transformWhereClause()/03');
                console.log('QueryBuilderHelper::transformWhereClause()/condition:', condition);
                const field = Object.keys(condition)[0];
                console.log('QueryBuilderHelper::transformWhereClause()/04');
                const value = condition[field];
                console.log('QueryBuilderHelper::transformWhereClause()/05');
                if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
                    console.log('QueryBuilderHelper::transformWhereClause()/06');
                    const match = value.match(/^Like\((.*)\)$/);
                    console.log('QueryBuilderHelper::transformWhereClause()/value:', value);
                    console.log('QueryBuilderHelper::transformWhereClause()/match:', match);
                    console.log('QueryBuilderHelper::transformWhereClause()/07');
                    if (match) {
                        console.log('QueryBuilderHelper::transformWhereClause()/08');
                        const param = match[1]
                        console.log('QueryBuilderHelper::transformWhereClause()/param:', param);
                        const ret = { [field]: Like(param) }
                        console.log('QueryBuilderHelper::transformWhereClause()/ret:', ret);
                        return ret;
                    }
                }
                console.log('QueryBuilderHelper::transformWhereClause()/09');
                return condition;
            });
        }
        console.log('QueryBuilderHelper::transformWhereClause()/10');
        return where;
    }

    // transformWhereClause(where: any): any {
    //     if (Array.isArray(where)) {
    //         return where.map((condition) => {
    //             const field = Object.keys(condition)[0];
    //             let value = condition[field];

    //             if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
    //                 const match = value.match(/^Like\('(.*)'\)$/);
    //                 if (match) {
    //                     // Only extract the inner value for Like condition
    //                     value = Like(match[1]);
    //                 }
    //             }

    //             return { [field]: value };
    //         });
    //     } else if (typeof where === 'object' && where !== null) {
    //         const transformed = {};
    //         Object.keys(where).forEach((field) => {
    //             let value = where[field];

    //             if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
    //                 const match = value.match(/^Like\('(.*)'\)$/);
    //                 if (match) {
    //                     // Only extract the inner value for Like condition
    //                     value = Like(match[1]);
    //                 }
    //             }

    //             transformed[field] = value;
    //         });
    //         return transformed;
    //     }

    //     return where;
    // }

    transformQueryInput(query: QueryInput): QueryInput {
        const w = this.transformWhereClause(query.where)
        console.log('QueryBuilderHelper::transformQueryInput()/w:', w);
        return {
            ...query,
            where: w,
        };
    }

    createQueryBuilder(serviceInput: IServiceInput): SelectQueryBuilder<any> {
        // clean up the where clause...especially for request from browsers
        const q = this.transformQueryInput(serviceInput.cmd.query);
        serviceInput.cmd.query.where = q.where;
        console.log('QueryBuilderHelper::createQueryBuilder()/q:', q);

        const query = serviceInput.cmd.query;
        const queryBuilder = this.repository.createQueryBuilder(this.repository.metadata.name);

        // Handling SELECT clause
        if (query.select && query.select.length > 0) {
            this.entityAdapter.registerMappingFromEntity(serviceInput.serviceModel);
            const selectDB = this.entityAdapter.getDbSelect(this.repository.metadata.name, query.select);
            queryBuilder.select(selectDB);
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

            if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
                const match = value.match(/^Like\((.*)\)$/);
                if (match) {
                    const likeValue = match[1];
                    if (index === 0) {
                        queryBuilder.where(`${dbField} LIKE :${key}`, { [key]: likeValue });
                    } else {
                        queryBuilder.andWhere(`${dbField} LIKE :${key}`, { [key]: likeValue });
                    }
                }
            } else {
                if (index === 0) {
                    queryBuilder.where(`${dbField} = :${key}`, { [key]: value });
                } else {
                    queryBuilder.andWhere(`${dbField} = :${key}`, { [key]: value });
                }
            }
        });
    }

    private processArrayWhereClause(queryBuilder: SelectQueryBuilder<any>, whereArray: any[]): void {
        console.log('QueryBuilderHelper::processArrayWhereClause()/01');
        whereArray.forEach((condition, index) => {
            const key = Object.keys(condition)[0];
            const value = condition[key];
            const dbField = `${this.repository.metadata.name}.${this.getDatabaseColumnName(key)}`;
            console.log('QueryBuilderHelper::processArrayWhereClause()/02');
            if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
                console.log('QueryBuilderHelper::processArrayWhereClause()/03');
                const match = value.match(/^Like\((.*)\)$/);
                if (match) {
                    console.log('QueryBuilderHelper::processArrayWhereClause()/04');
                    const likeValue = match[1];
                    if (index === 0) {
                        console.log('QueryBuilderHelper::processArrayWhereClause()/05');
                        queryBuilder.where(`${dbField} LIKE :${key}`, { [key]: likeValue });
                    } else {
                        console.log('QueryBuilderHelper::processArrayWhereClause()/06');
                        queryBuilder.orWhere(`${dbField} LIKE :${key}`, { [key]: likeValue });
                    }
                }
            } else {
                console.log('QueryBuilderHelper::processArrayWhereClause()/07');
                if (index === 0) {
                    console.log('QueryBuilderHelper::processArrayWhereClause()/08');
                    queryBuilder.where(`${dbField} = :${key}`, { [key]: value });
                } else {
                    console.log('QueryBuilderHelper::processArrayWhereClause()/09');
                    queryBuilder.orWhere(`${dbField} = :${key}`, { [key]: value });
                }
            }
        });
    }

    private getDatabaseColumnName(field: string): string {
        const column = this.repository.metadata.findColumnWithPropertyName(field);
        return column ? column.databaseName : field;
    }

    isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }
}
