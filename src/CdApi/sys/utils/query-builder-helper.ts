import { SelectQueryBuilder, Repository, Like, Brackets } from "typeorm";
import { EntityAdapter } from "./entity-adapter";
import { IQueryWhere, IServiceInput, QueryInput } from "../base/IBase";
import { safeStringify } from "./safe-stringify";

export class QueryBuilderHelper {
  entityAdapter: EntityAdapter;

  constructor(private repository: Repository<any>) {
    this.entityAdapter = new EntityAdapter();
  }

  test(query, queryBuilder) {
    if (query.where && Array.isArray(query.where) && query.where.length > 0) {
      console.log("QueryBuilderHelper::createQueryBuilder/04:");
      query.where.forEach((condition, index) => {
        const key = Object.keys(condition)[0];
        console.log("QueryBuilderHelper::createQueryBuilder/key:", key);
        const value = condition[key];
        console.log("QueryBuilderHelper::createQueryBuilder/value:", value);
        console.log(
          "QueryBuilderHelper::createQueryBuilder/value._type:",
          value._type
        );

        const dbField = `${
          this.repository.metadata.name
        }.${this.getDatabaseColumnName(key)}`;

        if (value._type === "like") {
          let likeValue = value._value; // Extract the value inside Like()
          // Remove any extra quotes around the value
          if (likeValue.startsWith("'") && likeValue.endsWith("'")) {
            likeValue = likeValue.slice(1, -1);
          }
          queryBuilder.orWhere(`${dbField} LIKE :${key}`, { [key]: likeValue });
        } else {
          const operator = index === 0 ? "where" : "orWhere";
          queryBuilder[operator](`${dbField} = :${key}`, { [key]: value });
        }
      });
    } else if (
      query.where &&
      typeof query.where === "object" &&
      this.isEmptyObject(query.where)
    ) {
      console.log("QueryBuilderHelper::createQueryBuilder/05:");
      // Do not add any where clause
    }
  }

  transformWhereClause(where: any): any {
    console.log("QueryBuilderHelper::transformWhereClause()/01");
    console.log("QueryBuilderHelper::transformWhereClause()/where:", where);
    if (Array.isArray(where)) {
      console.log("QueryBuilderHelper::transformWhereClause()/where:", where);
      console.log("QueryBuilderHelper::transformWhereClause()/02");
      return where.map((condition) => {
        console.log("QueryBuilderHelper::transformWhereClause()/03");
        console.log(
          "QueryBuilderHelper::transformWhereClause()/condition:",
          condition
        );
        const field = Object.keys(condition)[0];
        console.log("QueryBuilderHelper::transformWhereClause()/04");
        const value = condition[field];
        console.log("QueryBuilderHelper::transformWhereClause()/05");
        if (
          typeof value === "string" &&
          value.startsWith("Like(") &&
          value.endsWith(")")
        ) {
          console.log("QueryBuilderHelper::transformWhereClause()/06");
          const match = value.match(/^Like\((.*)\)$/);
          console.log(
            "QueryBuilderHelper::transformWhereClause()/value:",
            value
          );
          console.log(
            "QueryBuilderHelper::transformWhereClause()/match:",
            match
          );
          console.log("QueryBuilderHelper::transformWhereClause()/07");
          if (match) {
            console.log("QueryBuilderHelper::transformWhereClause()/08");
            const param = match[1];
            console.log(
              "QueryBuilderHelper::transformWhereClause()/param:",
              param
            );
            const ret = { [field]: Like(param) };
            console.log("QueryBuilderHelper::transformWhereClause()/ret:", ret);
            return ret;
          }
        }
        console.log("QueryBuilderHelper::transformWhereClause()/09");
        return condition;
      });
    }
    console.log("QueryBuilderHelper::transformWhereClause()/10");
    return where;
  }

  transformQueryInput(query: QueryInput): QueryInput {
    const w = this.transformWhereClause(query.where);
    console.log("QueryBuilderHelper::transformQueryInput()/w:", w);
    return {
      ...query,
      where: w,
    };
  }

  async createQueryBuilder(
    serviceInput: IServiceInput
  ): Promise<SelectQueryBuilder<any>> {
    console.log("QueryBuilderHelper::createQueryBuilder()/01");
    const query = serviceInput.cmd.query;
    const queryBuilder = this.repository.createQueryBuilder(
      this.repository.metadata.name
    );

    // Handling SELECT clause
    if (query.select && query.select.length > 0) {
      console.log("QueryBuilderHelper::createQueryBuilder()/02");
      this.entityAdapter.registerMappingFromEntity(serviceInput.serviceModel);
      const selectDB = await this.entityAdapter.getDbSelect(
        this.repository.metadata.name,
        query.select
      );
      queryBuilder.select(selectDB);
    } else {
      console.log("QueryBuilderHelper::createQueryBuilder()/03");
      // const allColumns = this.repository.metadata.columns.map(column => `${this.repository.metadata.name}.${column.databaseName}`);
      // queryBuilder.select(allColumns);
      const allColumns = this.repository.metadata.columns.map(
        (column) =>
          `\`${this.repository.metadata.name}\`.\`${column.databaseName}\``
      );
    }

    // Apply DISTINCT if specified
    if (query.distinct) {
      console.log("QueryBuilderHelper::createQueryBuilder()/03");
      queryBuilder.distinct(true);
    }

    // Handling WHERE clause
    // if (query.where) {
    //   if (
    //     typeof query.where === "object" &&
    //     !Array.isArray(query.where) &&
    //     !this.isEmptyObject(query.where)
    //   ) {
    //     this.processObjectWhereClause(queryBuilder, query.where);
    //   } else if (Array.isArray(query.where) && query.where.length > 0) {
    //     this.processArrayWhereClause(queryBuilder, query.where);
    //   }
    // }

    // Handling WHERE clause
    if (query.where) {
      this.processSmartWhereClause(queryBuilder, query.where);
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

  /**
     * Example of comparison usage
     * 
     * const query: IQuery = {
            update: {
                coopStatEnabled: true,
            },
            where: {
                'coopStatDate%BETWEEN': { start: '2024-01-01', end: '2024-06-30' },
            },
        };
        
     * const query: IQuery = {
            update: {
                coopStatDisplay: false,
            },
            where: {
                'coopStatDate%>': '2024-07-01',
                'cdGeoLocationId%=': 102,
            },
        };
     * @param queryBuilder 
     * @param where 
     */
  private processObjectWhereClause(
    queryBuilder: SelectQueryBuilder<any>,
    whereObject: any
  ) {
    console.log("QueryBuilderHelper::processObjectWhereClause()/01");
    const entries = Object.entries(whereObject);
    entries.forEach(([field, expr], index) => {
      const dbField = `${
        this.repository.metadata.name
      }.${this.getDatabaseColumnName(field)}`;
      console.log(
        "QueryBuilderHelper::processObjectWhereClause()/dbField:",
        dbField
      );
      if (index === 0) {
        queryBuilder.where(`${dbField} ${expr}`);
      } else {
        queryBuilder.andWhere(`${dbField} ${expr}`);
      }
    });
  }

  // Example SQL operator mapper
  private getSqlOperator(symbol: string): string {
    const operatorMap = {
      ">": ">",
      "<": "<",
      "=": "=",
      BETWEEN: "BETWEEN",
      LIKE: "LIKE",
    };
    return operatorMap[symbol] || "=";
  }

  processArrayWhereClause2(queryBuilder: SelectQueryBuilder<any>, where: any) {
    console.log("QueryBuilderHelper::processArrayWhereClause2/04:");
    console.log("QueryBuilderHelper::processArrayWhereClause2/where:", where);
    let strWhere = JSON.stringify(where);
    console.log(
      "QueryBuilderHelper::processArrayWhereClause2/where1:",
      strWhere
    );
    const a = `:"Like\\(`; // Escape the '(' character
    const b = `')"}`;
    const regex = new RegExp(a, "g");
    strWhere = strWhere.replace(regex, b);
    console.log(
      "QueryBuilderHelper::processArrayWhereClause2/strWhere:",
      strWhere
    );
    where = JSON.parse(strWhere);
    console.log("QueryBuilderHelper::processArrayWhereClause2/where2:", where);
    where.forEach((condition, index) => {
      const key = Object.keys(condition)[0];
      console.log("QueryBuilderHelper::processArrayWhereClause2/key:", key);
      const value = condition[key];
      console.log("QueryBuilderHelper::processArrayWhereClause2/value:", value);
      console.log(
        "QueryBuilderHelper::processArrayWhereClause2/value._type:",
        value._type
      );

      const dbField = `${
        this.repository.metadata.name
      }.${this.getDatabaseColumnName(key)}`;

      if (value._type === "like") {
        let likeValue = value._value; // Extract the value inside Like()
        console.log(
          "QueryBuilderHelper::processArrayWhereClause2/likeValue:",
          likeValue
        );
        // Remove any extra quotes around the value
        if (likeValue.startsWith("'") && likeValue.endsWith("'")) {
          likeValue = likeValue.slice(1, -1);
        }
        console.log(
          "QueryBuilderHelper::processArrayWhereClause2/`${dbField} LIKE :${key}`:",
          `${dbField} LIKE :${key}`
        );
        console.log(
          "QueryBuilderHelper::processArrayWhereClause2/{ [key]: likeValue }:",
          { [key]: likeValue }
        );
        queryBuilder.orWhere(`${dbField} LIKE :${key}`, { [key]: likeValue });
      } else {
        const operator = index === 0 ? "where" : "orWhere";
        queryBuilder[operator](`${dbField} = :${key}`, { [key]: value });
      }
    });
  }

  private processArrayWhereClause(
    queryBuilder: SelectQueryBuilder<any>,
    whereArray: Array<any>
  ) {
    console.log("QueryBuilderHelper::processArrayWhereClause()/01");
    whereArray.forEach((condition, index) => {
      const [field, expr] = Object.entries(condition)[0];
      const dbField = `${
        this.repository.metadata.name
      }.${this.getDatabaseColumnName(field)}`;
      console.log(
        "QueryBuilderHelper::processArrayWhereClause()/dbField:",
        dbField
      );
      if (index === 0) {
        queryBuilder.where(`${dbField} ${expr}`);
      } else {
        queryBuilder.orWhere(`${dbField} ${expr}`);
      }
    });
  }

  // private getDatabaseColumnName(field: string): string {
  //   const column = this.repository.metadata.findColumnWithPropertyName(field);
  //   return column ? column.databaseName : field;
  // }

  private getDatabaseColumnName(entityField: string): string {
    console.log(
      "QueryBuilderHelper::getDatabaseColumnName()/entityField:",
      entityField
    );
    const column = this.repository.metadata.columns.find(
      (col) => col.propertyName === entityField
    );
    // console.log('QueryBuilderHelper::getDatabaseColumnName()/column:', column)
    return column?.databaseName || entityField;
  }

  isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }

  addJSONSelect(jsonField: string, keys: string[]): this {
    const queryBuilder = this.repository.createQueryBuilder(
      this.repository.metadata.name
    );
    keys.forEach((key) => {
      queryBuilder.addSelect(
        `JSON_UNQUOTE(JSON_EXTRACT(${jsonField}, '$.${key}'))`,
        key
      );
    });
    return this;
  }

  updateJSONField(jsonField: string, updates: Record<string, any>): this {
    // Use UpdateQueryBuilder for updating
    const queryBuilder = this.repository
      .createQueryBuilder()
      .update(this.repository.metadata.name);

    // Construct the JSON_SET update expression
    const updateFields = Object.keys(updates)
      .map((key) => `JSON_SET(${jsonField}, '$.${key}', '${updates[key]}')`)
      .join(", ");

    // Use set() properly with UpdateQueryBuilder
    queryBuilder.set({ [jsonField]: () => updateFields });

    return this;
  }

  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Extending capacity for andWhere and orWhere
   */

  private isObject(value: any): boolean {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private isPlainWhereObject(where: any): boolean {
    return this.isObject(where) && !where.andWhere && !where.orWhere;
  }

  // private processSmartWhereClause(
  //   queryBuilder: SelectQueryBuilder<any>,
  //   where: IQueryWhere | Array<{ [field: string]: string }>
  // ) {
  //   console.log("QueryBuilderHelper::processSmartWhereClause()/01");
  //   console.log("QueryBuilderHelper::processSmartWhereClause()/where:", JSON.stringify(where));
  //   if (Array.isArray(where)) {
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/02");
  //     this.processArrayWhereClause(queryBuilder, where); // OR logic
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/03");
  //   } else if (this.isPlainWhereObject(where)) {
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/04");
  //     this.processObjectWhereClause(queryBuilder, where); // AND logic
  //   } else {
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/05");
  //     const typed = where as IQueryWhere;
  //     if (typed.andWhere && Array.isArray(typed.andWhere)) {
  //       console.log("QueryBuilderHelper::processSmartWhereClause()/06");
  //       typed.andWhere.forEach((c, i) => {
  //         console.log("QueryBuilderHelper::processSmartWhereClause()/07");
  //         console.log("QueryBuilderHelper::processSmartWhereClause()/c:", c);
  //         const [field, expr] = Object.entries(c)[0];
  //         if (i === 0 && !queryBuilder.expressionMap.wheres.length) {
  //           console.log("QueryBuilderHelper::processSmartWhereClause()/08");
  //           queryBuilder.where(`${field} ${expr}`);
  //         } else {
  //           console.log("QueryBuilderHelper::processSmartWhereClause()/09");
  //           queryBuilder.andWhere(`${field} ${expr}`);
  //         }
  //       });
  //     }
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/10");
  //     if (typed.orWhere && Array.isArray(typed.orWhere)) {
  //       console.log("QueryBuilderHelper::processSmartWhereClause()/11");
  //       typed.orWhere.forEach((c, i) => {
  //         console.log("QueryBuilderHelper::processSmartWhereClause()/12");
  //         const [field, expr] = Object.entries(c)[0];
  //         if (queryBuilder.expressionMap.wheres.length === 0 && i === 0) {
  //           console.log("QueryBuilderHelper::processSmartWhereClause()/13");
  //           queryBuilder.where(`${field} ${expr}`);
  //         } else {
  //           console.log("QueryBuilderHelper::processSmartWhereClause()/14");
  //           queryBuilder.orWhere(`${field} ${expr}`);
  //         }
  //       });
  //     }
  //   }
  // }
  // private processSmartWhereClause(
  //   queryBuilder: SelectQueryBuilder<any>,
  //   where: IQueryWhere | Array<{ [field: string]: string }>
  // ) {
  //   console.log("QueryBuilderHelper::processSmartWhereClause()/01");
  //   console.log(
  //     "QueryBuilderHelper::processSmartWhereClause()/where:",
  //     JSON.stringify(where)
  //   );

  //   if (Array.isArray(where)) {
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/02");
  //     this.processArrayWhereClause(queryBuilder, where); // OR logic
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/03");
  //   } else if (this.isPlainWhereObject(where)) {
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/04");
  //     this.processObjectWhereClause(queryBuilder, where); // AND logic
  //   } else {
  //     console.log("QueryBuilderHelper::processSmartWhereClause()/05");
  //     const typed = where as IQueryWhere;

      
  //     if (typed.andWhere && Array.isArray(typed.andWhere)) {
  //       console.log("QueryBuilderHelper::processSmartWhereClause()/06");
  //       queryBuilder.andWhere(
  //         new Brackets((qb) => {
  //           typed.andWhere!.forEach((c, i) => {
  //             console.log("QueryBuilderHelper::processSmartWhereClause()/07");
  //             const [field, expr] = Object.entries(c)[0];
  //             const dbField = `${
  //               this.repository.metadata.name
  //             }.${this.getDatabaseColumnName(field)}`;
  //             if (i === 0) {
  //               qb.where(`${dbField} ${expr}`);
  //             } else {
  //               qb.andWhere(`${dbField} ${expr}`);
  //             }
  //           });
  //         })
  //       );
  //     }

  //     if (typed.orWhere && Array.isArray(typed.orWhere)) {
  //       console.log("QueryBuilderHelper::processSmartWhereClause()/11");
  //       queryBuilder.andWhere(
  //         new Brackets((qb) => {
  //           typed.orWhere!.forEach((c, i) => {
  //             const [field, expr] = Object.entries(c)[0];
  //             const dbField = `${
  //               this.repository.metadata.name
  //             }.${this.getDatabaseColumnName(field)}`;
  //             if (i === 0) {
  //               qb.where(`${dbField} ${expr}`);
  //             } else {
  //               qb.orWhere(`${dbField} ${expr}`);
  //             }
  //           });
  //         })
  //       );
  //     }
  //   }
  // }

  private processSmartWhereClause(
    queryBuilder: SelectQueryBuilder<any>,
    where: IQueryWhere | Array<{ [field: string]: string | number }>
  ) {
    console.log("QueryBuilderHelper::processSmartWhereClause()/01");
    console.log(
      "QueryBuilderHelper::processSmartWhereClause()/where:",
      JSON.stringify(where)
    );
  
    if (Array.isArray(where)) {
      console.log("QueryBuilderHelper::processSmartWhereClause()/02");
      this.processArrayWhereClause(queryBuilder, where); // OR logic
      console.log("QueryBuilderHelper::processSmartWhereClause()/03");
    } else if (this.isPlainWhereObject(where)) {
      console.log("QueryBuilderHelper::processSmartWhereClause()/04");
      this.processObjectWhereClause(queryBuilder, where); // AND logic
    } else {
      console.log("QueryBuilderHelper::processSmartWhereClause()/05");
      const typed = where as IQueryWhere;
  
      if (typed.andWhere && Array.isArray(typed.andWhere)) {
        console.log("QueryBuilderHelper::processSmartWhereClause()/06");
        queryBuilder.andWhere(
          new Brackets((qb) => {
            typed.andWhere!.forEach((c, i) => {
              console.log("QueryBuilderHelper::processSmartWhereClause()/07");
              const [field, rawExpr] = Object.entries(c)[0];
              const normalizedExpr = this.normalizeExpr(rawExpr);
              const dbField = `${
                this.repository.metadata.name
              }.${this.getDatabaseColumnName(field)}`;
              if (i === 0) {
                qb.where(`${dbField} ${normalizedExpr}`);
              } else {
                qb.andWhere(`${dbField} ${normalizedExpr}`);
              }
            });
          })
        );
      }
  
      if (typed.orWhere && Array.isArray(typed.orWhere)) {
        console.log("QueryBuilderHelper::processSmartWhereClause()/11");
        queryBuilder.andWhere(
          new Brackets((qb) => {
            typed.orWhere!.forEach((c, i) => {
              const [field, rawExpr] = Object.entries(c)[0];
              const normalizedExpr = this.normalizeExpr(rawExpr);
              const dbField = `${
                this.repository.metadata.name
              }.${this.getDatabaseColumnName(field)}`;
              if (i === 0) {
                qb.where(`${dbField} ${normalizedExpr}`);
              } else {
                qb.orWhere(`${dbField} ${normalizedExpr}`);
              }
            });
          })
        );
      }
    }
  }
  

  private normalizeExpr(expr: string | number): string {
    if (typeof expr === "number") return `= ${expr}`;
    if (/^(=|<|>|<=|>=|<>|LIKE|IN|IS|BETWEEN|NOT|LIKE|REGEXP)\s*/i.test(expr)) {
      return expr; // Already includes a valid SQL operator
    }
    if (/^\w+\(.*\)$/.test(expr)) {
      return expr; // Handles SQL functions like Like('%ka%')
    }
    if (!isNaN(Number(expr))) {
      return `= ${expr}`; // string but numeric-like
    }
    return `= '${expr}'`; // default fallback
  }
}
