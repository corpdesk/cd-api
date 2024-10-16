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
    SELECT
            'coop'.'coop_id',
            'coop'.'coop_name',
            'coop'.'coop_guid',
            'coop'.'coop_type_id',
            'coop'.'coop_enabled',
            'coop'.'company_id',
            'coop'.'cd_geo_location_id',
            'company'.'company_type_id',
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
            coop
        JOIN
            company ON coop.company_id = company.company_id
        JOIN
            company_type ON company.company_type_id = company_type.company_type_id
        JOIN
            cd_geo_location_view cd_geo_location_view ON coop.cd_geo_location_id = cd_geo_location_view.cd_geo_location_id;
    `
})



export class CoopViewModel {
    // Previous fields...

    // `city_guid`,
    @ViewColumn({
        name: 'city_guid'
    })
    cityGuid: string;

    // `county_guid`,
    @ViewColumn({
        name: 'county_guid'
    })
    countyGuid: string;

    // `company_guid`,
    @ViewColumn({
        name: 'company_guid'
    })
    companyGuid: string;

    // `company_description`,
    @ViewColumn({
        name: 'company_description'
    })
    companyDescription: string;

    // `parent_guid`,
    @ViewColumn({
        name: 'parent_guid'
    })
    parentGuid: string;

    // `consumer_id`,
    @ViewColumn({
        name: 'consumer_id'
    })
    consumerId: number;

    // `mobile`,
    @ViewColumn({
        name: 'mobile'
    })
    mobile: string;

    // `company_type_guid`,
    @ViewColumn({
        name: 'company_type_guid'
    })
    companyTypeGuid: string;

    // `consumer_guid`,
    @ViewColumn({
        name: 'consumer_guid'
    })
    consumerGuid: string;

    // `search_tags`,
    @ViewColumn({
        name: 'search_tags'
    })
    searchTags: string;

    // `cd_geo_location_guid`,
    @ViewColumn({
        name: 'cd_geo_location_guid'
    })
    cdGeoLocationGuid: string;

    // `cd_geo_location_name`,
    @ViewColumn({
        name: 'cd_geo_location_name'
    })
    cdGeoLocationName: string;

    // `cd_geo_location_description`,
    @ViewColumn({
        name: 'cd_geo_location_description'
    })
    cdGeoLocationDescription: string;

    // `lat`,
    @ViewColumn({
        name: 'lat'
    })
    lat: number;

    // `long`,
    @ViewColumn({
        name: 'long'
    })
    long: number;

    // `cd_geo_boundary_data`,
    @ViewColumn({
        name: 'cd_geo_boundary_data'
    })
    cdGeoBoundaryData: string;

    // `cd_geo_location_code`,
    @ViewColumn({
        name: 'cd_geo_location_code'
    })
    cdGeoLocationCode: string;

    // `cd_geo_location_icon`,
    @ViewColumn({
        name: 'cd_geo_location_icon'
    })
    cdGeoLocationIcon: string;

    // `back4app_obectId`,
    @ViewColumn({
        name: 'back4app_obectId'
    })
    back4appObjectId: string;

    // `cd_geo_political_type_id`,
    @ViewColumn({
        name: 'cd_geo_political_type_id'
    })
    cdGeoPoliticalTypeId: number;

    // `cd_geo_political_parent_id`,
    @ViewColumn({
        name: 'cd_geo_political_parent_id'
    })
    cdGeoPoliticalParentId: number;

    // `cd_geo_location_name_alt`,
    @ViewColumn({
        name: 'cd_geo_location_name_alt'
    })
    cdGeoLocationNameAlt: string;

    // `geo_boundary_data`,
    @ViewColumn({
        name: 'geo_boundary_data'
    })
    geoBoundaryData: string;

    // `cd_geo_location_enabled`,
    @ViewColumn({
        name: 'cd_geo_location_enabled'
    })
    cdGeoLocationEnabled: boolean;

    // `cd_geo_location_assoc`,
    @ViewColumn({
        name: 'cd_geo_location_assoc'
    })
    cdGeoLocationAssoc: string;

    // `cd_geo_location_population`,
    @ViewColumn({
        name: 'cd_geo_location_population'
    })
    cdGeoLocationPopulation: number;

    // `cd_geo_location_display`,
    @ViewColumn({
        name: 'cd_geo_location_display'
    })
    cdGeoLocationDisplay: string;

    // `cd_geo_political_type_guid`,
    @ViewColumn({
        name: 'cd_geo_political_type_guid'
    })
    cdGeoPoliticalTypeGuid: string;

    // `cd_geo_political_type_name`,
    @ViewColumn({
        name: 'cd_geo_political_type_name'
    })
    cdGeoPoliticalTypeName: string;

    // `cd_geo_political_type_description`,
    @ViewColumn({
        name: 'cd_geo_political_type_description'
    })
    cdGeoPoliticalTypeDescription: string;
}
