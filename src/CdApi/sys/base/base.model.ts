import { IQuery, IServiceInput } from "./IBase";

export function siGet(q: IQuery, cls: any):IServiceInput {
    return {
        serviceModel: cls.serviceModel,
        docName: `${cls.modelName}::siGet`,
        cmd: {
            action: 'find',
            query: q
        },
        dSource: 1
    }
}

/// ColumnNumericTransformer
export class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}