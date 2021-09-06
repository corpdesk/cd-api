import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity(
    {
        name: 'consumer_resource_view',
        expression: `
                    SELECT
                        'consumer_resource'.'consumer_id' AS 'consumer_id',
                        'consumer_resource'.'cd_obj_type_id' AS 'cd_obj_type_id',
                        'consumer_resource'.'cd_obj_id' AS 'cd_obj_id',
                        'consumer_resource'.'consumer_resource_type_id' AS 'consumer_resource_type_id',
                        'cd_obj'.'obj_guid' AS 'obj_guid',
                        'consumer'.'consumer_guid' AS 'consumer_guid'
                    FROM
                        ((
                                'consumer_resource'
                                JOIN 'cd_obj' ON ((
                                        'consumer_resource'.'cd_obj_id' = 'cd_obj'.'cd_obj_id'
                                    )))
                            JOIN 'consumer' ON ((
                                    'consumer_resource'.'consumer_id' = 'consumer'.'consumer_id'
                                )));
        `
    })

export class ConsumerResourceViewModel {

    @ViewColumn(
        {
            name: 'consumer_id'
        }
    )
    consumerId: number;

    @ViewColumn(
        {
            name: 'cd_obj_type_id'
        }
    )
    cdObjTypeId: number;

    @ViewColumn(
        {
            name: 'cd_obj_id'
        }
    )
    cdObjId: string;

    @ViewColumn(
        {
            name: 'consumer_resource_type_id'
        }
    )
    consumerResourceTypeId: string;

    @ViewColumn(
        {
            name: 'obj_guid'
        }
    )
    objGuid: string;

    @ViewColumn(
        {
            name: 'consumer_guid'
        }
    )
    consumerGuid: string;

}