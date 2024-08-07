import { EntityMetadata, getConnection } from 'typeorm';

export class EntityAdapter {
    private mappings: { [key: string]: { [key: string]: string } };

    constructor() {
        this.mappings = {};
    }

    registerMapping(entityName: string, mapping: { [key: string]: string }) {
        this.mappings[entityName] = mapping;
    }

    mapRawToEntity<T>(entityName: string, rawData: any[]): T[] {
        if (!this.mappings[entityName]) {
            throw new Error(`No mappings registered for entity: ${entityName}`);
        }

        const mapping = this.mappings[entityName];

        return rawData.map(item => {
            const mappedItem: any = {};
            for (const key in mapping) {
                if (mapping.hasOwnProperty(key) && item.hasOwnProperty(mapping[key])) {
                    mappedItem[key] = item[mapping[key]];
                }
            }
            return mappedItem as T;
        });
    }

    registerMappingFromEntity(entity: Function) {
        const connection = getConnection();
        const metadata: EntityMetadata = connection.getMetadata(entity);

        const mapping: { [key: string]: string } = {};
        metadata.columns.forEach(column => {
            mapping[column.propertyName] = column.databaseName;
        });

        this.registerMapping(metadata.name, mapping);
    }

    getEntityName(entity: Function): string {
        const connection = getConnection();
        const metadata: EntityMetadata = connection.getMetadata(entity);
        return metadata.name;
    }
}
