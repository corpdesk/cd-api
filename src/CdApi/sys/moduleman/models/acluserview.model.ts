import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity(
    {
        name: 'acl_user_view',
        expression: `
                        SELECT
                            'user'.'user_id' AS 'user_id',
                            'user'.'user_guid' AS 'user_guid',
                            'user'.'user_name' AS 'user_name',
                            'user'.'email' AS 'email',
                            'user'.'enabled' AS 'enabled',
                            'user'.'company_id' AS 'company_id',
                            'user'.'user_type_id' AS 'user_type_id',
                            'consumer_resource_view'.'consumer_id' AS 'consumer_id',
                            'consumer_resource_view'.'cd_obj_type_id' AS 'cd_obj_type_id',
                            'consumer_resource_view'.'cd_obj_id' AS 'cd_obj_id',
                            'consumer_resource_view'.'obj_guid' AS 'obj_guid',
                            'consumer_resource_view'.'consumer_guid' AS 'consumer_guid',
                            'consumer_resource_view'.'consumer_resource_type_id' AS 'consumer_resource_type_id'
                        FROM
                            (
                                'user'
                                JOIN 'consumer_resource_view' ON ((
                                        'user'.'user_guid' = 'consumer_resource_view'.'obj_guid'
                                    )))
    `
    })

export class AclUserViewModel {

    @ViewColumn(
        {
            name: 'user_id'
        }
    )
    userId: number;

    @ViewColumn(
        {
            name: 'user_guid'
        }
    )
    userGuid: string;

    @ViewColumn(
        {
            name: 'user_name'
        }
    )
    userName: string;

    @ViewColumn(
        {
            name: 'enabled'
        }
    )
    enabled: boolean;

    @ViewColumn(
        {
            name: 'company_id'
        }
    )
    companyId: number;

    @ViewColumn(
        {
            name: 'user_type_id'
        }
    )
    userTypeId: number;

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
    cdObjId: number;

    @ViewColumn(
        {
            name: 'obj_guid'
        }
    )
    objGuid: number;

    @ViewColumn(
        {
            name: 'consumer_guid'
        }
    )
    consumerGuid: string;

    @ViewColumn(
        {
            name: 'consumer_resource_type_id'
        }
    )
    consumerResourceTypeId: number;

}