import { ViewEntity, ViewColumn } from 'typeorm';
import { IQuery } from '../../base/IBase';

export function siGet(q: IQuery) {
    return {
        serviceModel: CdCliViewModel,
        docName: 'CdCliModel::siGet',
        cmd: {
            action: 'find',
            query: q
        },
        dSource: 1
    }
}

@ViewEntity({
    name: 'cd_cli_view',
    /**
     * This is managed by Corpdesk engine so that when 
     * typeorm is not implemented, the process continues without
     * dependency on typorm
     */
    synchronize: false,
    /**
     * The expression below can be auto-generated from 
     * cd-cli or cd-ai
     */
    expression: `
    SELECT
            'cd_cli'.'cd_cli_id',
            'cd_cli'.'cd_cli_name',
            'cd_cli'.'cd_cli_description',
            'cd_cli'.'cd_cli_guid',
            'cd_cli'.'cd_cli_type_id',
            'cd_cli'.'cd_cli_enabled',
            'cd_cli'.'company_id',
            'cd_cli'.'cd_geo_location_id',
            'cd_cli_type'.'cd_cli_type_guid',
            'company'.'company_type_id',
            'company'.'company_type_name',
            'company'.'directory_category_guid',
            'company'.'company_name',
            'company'.'postal_address',
            'company'.'phone',
            'company'.'email',
            'company'.'website',
            'company'.'physical_location',
            'company'.'city',
            'company'.'country',
            'company'.'logo',
            'company'.'company_enabled',
            'company'.'doc_id',
            'company'.'city_guid',
            'company'.'county_guid',
            'company'.'company_guid',
            'company'.'company_description',
            'company'.'parent_guid',
            'company'.'consumer_id',
            'company'.'mobile',
            'company'.'company_type_guid',
            'company'.'consumer_guid',
            'company'.'search_tags',
            'cd_geo_location_view'.'cd_geo_location_guid',
            'cd_geo_location_view'.'cd_geo_location_name',
            'cd_geo_location_view'.'cd_geo_location_description',
            'cd_geo_location_view'.'lat',
            'cd_geo_location_view'.'long',
            'cd_geo_location_view'.'cd_geo_boundary_data',
            'cd_geo_location_view'.'cd_geo_location_code',
            'cd_geo_location_view'.'cd_geo_location_icon',
            'cd_geo_location_view'.'back4app_obectId',
            'cd_geo_location_view'.'cd_geo_political_type_id',
            'cd_geo_location_view'.'cd_geo_political_parent_id',
            'cd_geo_location_view'.'cd_geo_location_name_alt',
            'cd_geo_location_view'.'geo_boundary_data',
            'cd_geo_location_view'.'cd_geo_location_enabled',
            'cd_geo_location_view'.'cd_geo_location_assoc',
            'cd_geo_location_view'.'cd_geo_location_population',
            'cd_geo_location_view'.'cd_geo_location_display',
            'cd_geo_location_view'.'cd_geo_political_type_guid',
            'cd_geo_location_view'.'cd_geo_political_type_name',
            'cd_geo_location_view'.'cd_geo_political_type_description'
        FROM
            cdCli
        JOIN
            company ON cdCli.company_id = company.company_id
        JOIN
            company_type ON company.company_type_id = company_type.company_type_id
        JOIN
            cd_geo_location_view cd_geo_location_view ON cdCli.cd_geo_location_id = cd_geo_location_view.cd_geo_location_id;
    `
})

export class CdCliViewModel {
    @ViewColumn({ name: 'cd_cli_id' })
    cdCliId: number;

    @ViewColumn({ name: 'cd_cli_name' })
    cdCliName: string;

    @ViewColumn({ name: 'cd_cli_description' })
    cdCliDescription: string;

    @ViewColumn({ name: 'cd_cli_guid' })
    cdCliGuid: string;

    @ViewColumn({ name: 'cd_cli_type_id' })
    cdCliTypeId: number;

    @ViewColumn({ name: 'cd_cli_enabled' })
    cdCliEnabled: boolean;

    @ViewColumn({ name: 'cd_cli_type_guid' })
    cdCliTypeGuid: string;
}

