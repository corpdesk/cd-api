import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity(
    {
        name: 'acl_module_view',
        expression: `
        SELECT
			'consumer_resource_view'.consumer_id AS 'consumer_id',
			'consumer_resource_view'.'cd_obj_type_id' AS 'cd_obj_type_id',
			'consumer_resource_view'.'cd_obj_id' AS 'cd_obj_id',
			'consumer_resource_view'.'obj_guid' AS 'obj_guid',
			'consumer_resource_view'.'consumer_guid' AS 'consumer_guid',
			'module'.'module_id',
			'module'.'module_guid',
			'module'.'module_name',
			'module'.'module_is_public',
			'module'.'is_sys_module',
			'module'.'module_enabled',
			'module'.'group_guid',
			'module'.'module_type_id'
		FROM
			consumer_resource_view
			INNER JOIN module ON 'consumer_resource_view'.'obj_guid' = 'module'.'module_guid';
    `
    })

export class AclModuleViewModel {

    @ViewColumn(
        {
            name: 'consumer_id'
        }
    )
    consumerId?: number;

    @ViewColumn(
        {
            name: 'cd_obj_type_id'
        }
    )
    cdObjTypeId?: number;

    @ViewColumn(
        {
            name: 'cd_obj_id'
        }
    )
    cdObjId?: number;

    @ViewColumn(
        {
            name: 'consumer_guid'
        }
    )
    consumerGuid?: string;

    @ViewColumn(
        {
            name: 'module_id'
        }
    )
    moduleId: number;

    @ViewColumn(
        {
            name: 'module_guid'
        }
    )
    moduleGuid: string;

    @ViewColumn(
        {
            name: 'module_name'
        }
    )
    moduleName: string;

    @ViewColumn(
        {
            name: 'module_is_public'
        }
    )
    moduleIsPublic?: boolean | number | null;

    @ViewColumn(
        {
            name: 'is_sys_module'
        }
    )
    isSysModule?: boolean | number | null;

    @ViewColumn(
        {
            name: 'module_enabled'
        }
    )
    moduleEnabled: boolean | number | null;

    @ViewColumn(
        {
            name: 'group_guid'
        }
    )
    groupGuid?: string;

    @ViewColumn(
        {
            name: 'module_type_id'
        }
    )
    moduleTypeId?: number;

}

