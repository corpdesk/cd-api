import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity(
    {
        name: 'coop_member_view',
        synchronize: false,
        expression: `
            SELECT DISTINCT
                coop.coop_id AS coop_id,
                coop.coop_guid AS coop_guid,
                coop.coop_name AS coop_name,
                coop.coop_name AS member_name,
                coop.coop_description AS coop_description,
                coop.coop_owner_id AS coop_owner_id,
                coop.doc_id AS doc_id,
                coop.coop_type_id AS coop_type_id,
                coop.module_guid AS module_guid,
                coop.company_id AS company_id,
                coop.coop_is_public AS coop_is_public,
                coop.coop_enabled AS coop_enabled,
                coop_member.coop_member_id AS coop_member_id,
                coop_member.member_guid AS member_guid,
                coop_member.coop_guid_parent AS coop_guid_parent,
                coop_member.cd_obj_type_id AS cd_obj_type_id,
                coop_member.user_id_member AS user_id_member
            FROM
                (
                    \`coop\`
                    JOIN coop_member ON ((
                        coop.coop_guid = coop_member.member_guid
                )))
    `
    })

export class CoopMemberViewModel {

    @ViewColumn(
        {
            name: 'coop_id'
        }
    )
    coopStatId: number;

    @ViewColumn(
        {
            name: 'coop_guid'
        }
    )
    coopStatGuid: string;

    @ViewColumn(
        {
            name: 'coop_name'
        }
    )
    coopStatName: string;

    @ViewColumn(
        {
            name: 'member_name'
        }
    )
    memberName: string;

    @ViewColumn(
        {
            name: 'coop_description'
        }
    )
    coopStatDescription: string;

    @ViewColumn(
        {
            name: 'coop_owner_id'
        }
    )
    coopOwner_id: number;

    @ViewColumn(
        {
            name: 'doc_id'
        }
    )
    docId: number;

    @ViewColumn(
        {
            name: 'coop_type_id'
        }
    )
    coopTypeId: number;

    @ViewColumn(
        {
            name: 'module_guid'
        }
    )
    moduleGuid: string;

    @ViewColumn(
        {
            name: 'company_id'
        }
    )
    companyId: number;

    @ViewColumn(
        {
            name: 'coop_is_public'
        }
    )
    coopIsPublic: number;

    @ViewColumn(
        {
            name: 'coop_enabled'
        }
    )
    coopStatEnabled: number;

    @ViewColumn(
        {
            name: 'coop_member_id'
        }
    )
    coopMember_id: number;

    @ViewColumn(
        {
            name: 'member_guid'
        }
    )
    memberGuid: string;

    @ViewColumn(
        {
            name: 'coop_guid_parent'
        }
    )
    coopStatGuidParent: string;

    @ViewColumn(
        {
            name: 'cd_obj_type_id'
        }
    )
    cdObjTypeId: number;

    @ViewColumn(
        {
            name: 'user_id_member'
        }
    )
    userIdMember: number;

}