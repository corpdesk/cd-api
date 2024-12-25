import { ViewEntity, ViewColumn } from 'typeorm';
import { IQuery } from '../../../sys/base/IBase';

export function siGet(q: IQuery) {
    return {
        serviceModel: AbcdViewModel,
        docName: 'AbcdModel::siGet',
        cmd: {
            action: 'find',
            query: q
        },
        dSource: 1
    }
}

@ViewEntity({
    name: 'abcd_view',
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
            'abcd'.'abcd_id',
            'abcd'.'abcd_name',
            'abcd'.'abcd_description',
            'abcd'.'abcd_guid',
            'abcd'.'abcd_type_id',
            'abcd'.'abcd_enabled',
            'abcd'.'company_id',
            'abcd'.'cd_geo_location_id',
            'abcd_type'.'abcd_type_guid',
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
            abcd
        JOIN
            company ON abcd.company_id = company.company_id
        JOIN
            company_type ON company.company_type_id = company_type.company_type_id
        JOIN
            cd_geo_location_view cd_geo_location_view ON abcd.cd_geo_location_id = cd_geo_location_view.cd_geo_location_id;
    `
})

export class AbcdViewModel {
    @ViewColumn({ name: 'abcd_id' })
    abcdId: number;

    @ViewColumn({ name: 'abcd_name' })
    abcdName: string;

    @ViewColumn({ name: 'abcd_description' })
    abcdDescription: string;

    @ViewColumn({ name: 'abcd_guid' })
    abcdGuid: string;

    @ViewColumn({ name: 'abcd_type_id' })
    abcdTypeId: number;

    @ViewColumn({ name: 'abcd_enabled' })
    abcdEnabled: boolean;

    @ViewColumn({ name: 'abcd_type_guid' })
    abcdTypeGuid: string;

    @ViewColumn({ name: 'company_id' })
    companyId: number;

    @ViewColumn({ name: 'cd_geo_location_id' })
    cdGeoLocationId: number;

    @ViewColumn({ name: 'company_type_id' })
    companyTypeId: number;

    @ViewColumn({ name: 'company_type_name' })
    companyTypeName: number;

    @ViewColumn({ name: 'directory_category_guid' })
    directoryCategoryGuid: string;

    @ViewColumn({ name: 'company_name' })
    companyName: string;

    @ViewColumn({ name: 'postal_address' })
    postalAddress: string;

    @ViewColumn({ name: 'phone' })
    phone: string;

    @ViewColumn({ name: 'email' })
    email: string;

    @ViewColumn({ name: 'website' })
    website: string;

    @ViewColumn({ name: 'physical_location' })
    physicalLocation: string;

    @ViewColumn({ name: 'city' })
    city: string;

    @ViewColumn({ name: 'country' })
    country: string;

    @ViewColumn({ name: 'logo' })
    logo: string;

    @ViewColumn({ name: 'company_enabled' })
    companyEnabled: boolean;

    @ViewColumn({ name: 'doc_id' })
    docId: number;

    @ViewColumn({ name: 'city_guid' })
    cityGuid: string;

    @ViewColumn({ name: 'county_guid' })
    countyGuid: string;

    @ViewColumn({ name: 'company_guid' })
    companyGuid: string;

    @ViewColumn({ name: 'company_description' })
    companyDescription: string;

    @ViewColumn({ name: 'parent_guid' })
    parentGuid: string;

    @ViewColumn({ name: 'consumer_id' })
    consumerId: number;

    @ViewColumn({ name: 'mobile' })
    mobile: string;

    @ViewColumn({ name: 'company_type_guid' })
    companyTypeGuid: string;

    @ViewColumn({ name: 'consumer_guid' })
    consumerGuid: string;

    @ViewColumn({ name: 'search_tags' })
    searchTags: string;

    @ViewColumn({ name: 'cd_geo_location_guid' })
    cdGeoLocationGuid: string;

    @ViewColumn({ name: 'cd_geo_location_name' })
    cdGeoLocationName: string;

    @ViewColumn({ name: 'cd_geo_location_description' })
    cdGeoLocationDescription: string;

    @ViewColumn({ name: 'lat' })
    lat: number;

    @ViewColumn({ name: 'long' })
    long: number;

    @ViewColumn({ name: 'cd_geo_boundary_data' })
    cdGeoBoundaryData: string;

    @ViewColumn({ name: 'cd_geo_location_code' })
    cdGeoLocationCode: string;

    @ViewColumn({ name: 'cd_geo_location_icon' })
    cdGeoLocationIcon: string;

    @ViewColumn({ name: 'back4app_obectId' })
    back4appObjectId: string;

    @ViewColumn({ name: 'cd_geo_political_type_id' })
    cdGeoPoliticalTypeId: number;

    @ViewColumn({ name: 'cd_geo_political_parent_id' })
    cdGeoPoliticalParentId: number;

    @ViewColumn({ name: 'cd_geo_location_name_alt' })
    cdGeoLocationNameAlt: string;

    @ViewColumn({ name: 'geo_boundary_data' })
    geoBoundaryData: string;

    @ViewColumn({ name: 'cd_geo_location_enabled' })
    cdGeoLocationEnabled: boolean;

    @ViewColumn({ name: 'cd_geo_location_assoc' })
    cdGeoLocationAssoc: string;

    @ViewColumn({ name: 'cd_geo_location_population' })
    cdGeoLocationPopulation: number;

    @ViewColumn({ name: 'cd_geo_location_display' })
    cdGeoLocationDisplay: string;

    @ViewColumn({ name: 'cd_geo_political_type_guid' })
    cdGeoPoliticalTypeGuid: string;

    @ViewColumn({ name: 'cd_geo_political_type_name' })
    cdGeoPoliticalTypeName: string;

    @ViewColumn({ name: 'cd_geo_political_type_description' })
    cdGeoPoliticalTypeDescription: string;
}

