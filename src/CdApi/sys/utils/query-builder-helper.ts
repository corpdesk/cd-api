/**
 * typeorm query was failing when 'OR' query were used for findAndCount
 * however the QueryBuilder is working ok
 * This is a helper class to allow query to still be structured as earlier then this
 * class converts them to typeorm query builder.
 */
import { SelectQueryBuilder, Repository, Like } from 'typeorm';

export interface QueryInput {
    select?: string[];
    where?: any;
    take?: number;
    skip?: number;
}

export class QueryBuilderHelper {
    constructor(private repository: Repository<any>) { }

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

    createQueryBuilder(query: QueryInput): SelectQueryBuilder<any> {
        console.log('QueryBuilderHelper::createQueryBuilder/01:')
        const queryBuilder = this.repository.createQueryBuilder(this.repository.metadata.name);

        if (query.select && query.select.length > 0) {
            console.log('QueryBuilderHelper::createQueryBuilder/02:')
            const select = query.select.map((field) => `${this.repository.metadata.name}.${this.getDatabaseColumnName(field)}`);
            console.log('Select Fields:', select);  // Debug logging
            queryBuilder.select(select);
        } else {
            console.log('QueryBuilderHelper::createQueryBuilder/03:')
            const allColumns = this.repository.metadata.columns.map(column => `${this.repository.metadata.name}.${column.databaseName}`);
            console.log('All Columns:', allColumns);  // Debug logging
            queryBuilder.select(allColumns);
        }

        if (query.where && Array.isArray(query.where) && query.where.length > 0) {
            console.log('QueryBuilderHelper::createQueryBuilder/04:')
            query.where.forEach((condition, index) => {
                const key = Object.keys(condition)[0];
                console.log('QueryBuilderHelper::createQueryBuilder/key:', key)
                const value = condition[key];
                console.log('QueryBuilderHelper::createQueryBuilder/value:', value)
                console.log('QueryBuilderHelper::createQueryBuilder/value._type:', value._type)

                const dbField = `${this.repository.metadata.name}.${this.getDatabaseColumnName(key)}`;

                if (value._type === "like") {
                    const likeValue = value._value; // Extract the value inside Like()
                    console.log('QueryBuilderHelper::createQueryBuilder/likeValue:', likeValue)
                    queryBuilder.orWhere(`${dbField} LIKE :${key}`, { [key]: likeValue });
                } else {
                    const operator = index === 0 ? 'where' : 'orWhere';
                    queryBuilder[operator](`${dbField} = :${key}`, { [key]: value });
                }
            });
        } else if (query.where && typeof query.where === 'object' && this.isEmptyObject(query.where)) {
            console.log('QueryBuilderHelper::createQueryBuilder/05:')
            // Do not add any where clause
        }

        if (query.take) {
            console.log('QueryBuilderHelper::createQueryBuilder/06:')
            queryBuilder.take(query.take);
        }

        if (query.skip) {
            console.log('QueryBuilderHelper::createQueryBuilder/07:')
            queryBuilder.skip(query.skip);
        }

        console.log('QueryBuilderHelper::createQueryBuilder/08:')
        console.log('QueryBuilderHelper::createQueryBuilder/sql:', queryBuilder.getSql())

        return queryBuilder;
    }


    private getDatabaseColumnName(field: string): string {
        const column = this.repository.metadata.findColumnWithPropertyName(field);
        return column ? column.databaseName : field;
    }

    isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }
}





