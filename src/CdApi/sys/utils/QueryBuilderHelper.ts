/**
 * typeorm query was failing when 'OR' query were used for findAndCount
 * however the QueryBuilder is working ok
 * This is a helper class to allow query to still be structured as earlier then this
 * class converts them to typeorm query builder.
 */
import { Repository, Like, FindOperator } from 'typeorm';

export interface QueryInput {
  select: string[];
  where: Array<{ [key: string]: string | FindOperator<string> }>;
  limit?: number;
  skip?: number;
}

export class QueryBuilderHelper<T> {
  private repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  private getDatabaseColumnName(property: string): string {
    const column = this.repository.metadata.findColumnWithPropertyName(property);
    return column ? column.databaseName : property;
  }

  transformWhereClause(where: Array<{ [key: string]: string | FindOperator<string> }>) {
    return where.map(condition => {
      const transformedCondition: { [key: string]: any } = {};

      Object.keys(condition).forEach(key => {
        const value = condition[key];
        if (typeof value === 'string' && value.startsWith('Like(') && value.endsWith(')')) {
          const likeValue = value.slice(5, -1); // Remove "Like(" and ")"
          transformedCondition[key] = Like(likeValue);
        } else {
          transformedCondition[key] = value;
        }
      });

      return transformedCondition;
    });
  }

  createQueryBuilder(input: QueryInput) {
    const { select, where, limit, skip } = input;

    // Initialize query builder
    const queryBuilder = this.repository.createQueryBuilder(this.repository.metadata.name);

    // Add select fields with verbose logging
    if (select.length > 0) {
      console.log('Select fields: ', select);
      select.forEach((field) => {
        const databaseColumn = this.getDatabaseColumnName(field);
        console.log(`Processing select field: ${field}, mapped to database column: ${databaseColumn}`);
        queryBuilder.addSelect(`${this.repository.metadata.name}.${databaseColumn}`);
      });
    }

    // Add where conditions with OR logic
    if (where.length > 0) {
      where.forEach((condition, index) => {
        const whereClauses: string[] = [];
        const parameters: { [key: string]: any } = {};

        Object.keys(condition).forEach(key => {
          const dbColumn = this.getDatabaseColumnName(key);
          const value = condition[key];

          if (value instanceof FindOperator && value.type === 'like') {
            whereClauses.push(`${this.repository.metadata.name}.${dbColumn} LIKE :${key}${index}`);
            parameters[`${key}${index}`] = value.value;
          } else {
            whereClauses.push(`${this.repository.metadata.name}.${dbColumn} = :${key}${index}`);
            parameters[`${key}${index}`] = value;
          }
        });

        queryBuilder.orWhere(whereClauses.join(' OR '), parameters);
      });
    }

    // Add limit and skip options
    if (limit !== undefined) {
      queryBuilder.limit(limit);
    }

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }

    console.log('Final Query: ', queryBuilder.getSql());
    return queryBuilder;
  }
}



