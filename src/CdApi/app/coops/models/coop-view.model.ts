import { ViewEntity, ViewColumn } from 'typeorm';
import { IQuery } from '../../../sys/base/IBase';

export function siGet(q: IQuery) {
    return {
        serviceModel: CoopViewModel,
        docName: 'CoopModel::siGet',
        cmd: {
            action: 'find',
            query: q
        },
        dSource: 1
    }
}


@ViewEntity({
    name: 'coop_view',
    synchronize: false,
    expression: `
    SELECT 'coop'.'coop_id'                 AS 'coop_id',
            'coop'.'coop_guid'               AS 'coop_guid',
            'coop'.'coop_name'               AS 'coop_name',
            'coop'.'coop_description'        AS 'coop_description',
            'coop'.'doc_id'                  AS 'doc_id',
            'coop'.'coop_type_id'            AS 'coop_type_id',
            'coop'.'cd_geo_location_id'      AS 'cd_geo_location_id',
            'coop'.'coop_count'              AS 'coop_count',
            'coop'.'coop_members_count'      AS 'coop_members_count',
            'coop'.'coop_saves_shares'       AS 'coop_saves_shares',
            'coop'.'coop_loans'              AS 'coop_loans',
            'coop'.'coop_assets'             AS 'coop_assets',
            'coop'.'coop_member_penetration' AS 'coop_member_penetration',
            'coop'.'coop_date_label'              AS 'coop_date_label',
            'coop'.'coop_woccu'              AS 'coop_woccu',
            'coop'.'coop_reserves'           AS 'coop_reserves',
            'coop_type'.'parent_guid'        AS 'parent_guid',
            'coop_type'.'coop_type_name'     AS 'coop_type_name'
    FROM   ('coop_type'
            JOIN 'coop'
                ON (( 'coop_type'.'coop_type_id' = 'coop'.'coop_type_id' )));  
    `
})


export class CoopViewModel {
    @ViewColumn(
        {
            name: 'coop_id'
        }
    )
    coopId: number;

    @ViewColumn(
        {
            name: 'coop_guid'
        }
    )
    coopGuid: number;

    @ViewColumn(
        {
            name: 'coop_name'
        }
    )
    coopName: string;

    @ViewColumn(
        {
            name: 'coop_type_id'
        }
    )
    coopTypeGuid: string;

    @ViewColumn(
        {
            name: 'coop_type_name'
        }
    )
    coopTypeName: string;

    @ViewColumn(
        {
            name: 'doc_id'
        }
    )
    docId: number;

    @ViewColumn(
        {
            name: 'coop_description'
        }
    )
    coop_description: string;

    @ViewColumn(
        {
            name: 'parent_guid'
        }
    )
    parentGuid: string;

    

}