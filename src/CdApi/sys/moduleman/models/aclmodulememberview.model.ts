import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity(
    {
        name: 'acl_module_member_view',
        expression: `
        SELECT DISTINCT
			'group'.'group_id',
			'group'.'group_guid',
			'group'.'group_name',
			'group'.'group_owner_id',
			'group'.'group_type_id',
			'group'.'module_guid',
			'group'.'group_is_public',
			'group'.'group_enabled',
			'group_member'.'group_member_id',
			'group_member'.'group_member_guid',
			'group_member'.'group_guid_parent',
			'group_member'.'member_guid',
			'group_member'.'user_id_member',
			'group_member'.'cd_obj_type_id',
			'group_member'.'group_member_parent_id',
			'group_member'.'group_member_enabled',
			'module'.'module_enabled',
			'module'.'module_is_public',
            'module'.'module_id',
			'module'.'module_name',
			'module'.'is_sys_module',
			'module'.'module_type_id'
		FROM
			'group'
			INNER JOIN group_member ON 'group'.'group_guid' = 'group_member'.'group_guid_parent'
			INNER JOIN module ON 'group'.'module_guid' = 'module'.'module_guid'
		WHERE
			'group'.'group_type_id' = 2
			AND 'group_member'.'cd_obj_type_id' = 9;
    `
    })

export class AclModuleMemberViewModel {

    @ViewColumn(
        {
            name: 'group_id'
        }
    )
    groupId: number;

    @ViewColumn(
        {
            name: 'group_guid'
        }
    )
    groupGuid: string;

    @ViewColumn(
        {
            name: 'group_name'
        }
    )
    groupName: string;

    @ViewColumn(
        {
            name: 'group_owner_id'
        }
    )
    groupOwnerId: number;

    @ViewColumn(
        {
            name: 'group_type_id'
        }
    )
    groupTypeId: number;

    @ViewColumn(
        {
            name: 'module_guid'
        }
    )
    moduleGuid: string;

    @ViewColumn(
        {
            name: 'group_is_public'
        }
    )
    groupIsPublic: boolean;

    @ViewColumn(
        {
            name: 'group_enabled'
        }
    )
    groupEnabled: boolean;

    @ViewColumn(
        {
            name: 'group_member_id'
        }
    )
    groupMemberId: number;

    @ViewColumn(
        {
            name: 'group_member_guid'
        }
    )
    groupMemberGuid: string;

    @ViewColumn(
        {
            name: 'group_guid_parent'
        }
    )
    groupGuidParent: string;

    @ViewColumn(
        {
            name: 'member_guid'
        }
    )
    memberGuid: string;

    @ViewColumn(
        {
            name: 'user_id_member'
        }
    )
    userIdMember: number;

    @ViewColumn(
        {
            name: 'cd_obj_type_id'
        }
    )
    cdObjTypeId: number;

    @ViewColumn(
        {
            name: 'group_member_parent_id'
        }
    )
    groupMemberParentId: number;

    @ViewColumn(
        {
            name: 'group_member_enabled'
        }
    )
    groupMemberEnabled: boolean;

    @ViewColumn(
        {
            name: 'module_enabled'
        }
    )
    moduleEnabled: number;

    @ViewColumn(
        {
            name: 'module_is_public'
        }
    )
    moduleIsPublic: number;

    @ViewColumn(
        {
            name: 'module_id'
        }
    )
    moduleId: number;

    @ViewColumn(
        {
            name: 'module_name'
        }
    )
    moduleName: number;

    @ViewColumn(
        {
            name: 'is_sys_module'
        }
    )
    isSysModule: number;

    @ViewColumn(
        {
            name: 'module_type_id'
        }
    )
    moduleTypeId: number;

}