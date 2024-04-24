import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


@Entity(
    {
        name: 'cd_geo_location',
        synchronize: false
    }
)
@Unique(['cdGeoLocationName', 'cdGeoLocationCode']) 
export class CdGeoLocationModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_location_id'
        }
    )
    cdGeoLocationId?: number;

    @Column({
        name: 'cd_geo_location_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoLocationGuid?: string;

    @Column(
        {
            name: 'cd_geo_location_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoLocationName: string;

    @Column(
        {
            name: 'cd_geo_location_description',
            length: 60,
            default: null
        })
    cdGeoLocationDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    // @Column(
    //     {
    //         name: 'cd_geo_location_type_id',
    //         default: null
    //     }
    // )
    // cdGeoLocationTypeId?: number;

    @Column(
        {
            name: 'lat',
            default: null
        }
    )
    lat?: number;

    @Column(
        {
            name: 'long',
            default: null
        }
    )
    long?: number;

    @Column(
        {
        name: 'cd_geo_boundary_data',
        type: 'json'
    })
    cdGeoBoundaryData?: string;

    @Column({
        name: 'cd_geo_location_code',
        length: 10,
        default: null
    })
    cdGeoLocationCode: string;

    @Column({
        name: 'cd_geo_location_icon',
        type: 'json',
        default: null
    })
    cdGeoLocationIcon?: string;

    @Column({
        name: 'back4app_obectId',
        length: 10,
        default: null
    })
    back4appObectId?: string;

    @Column(
        {
            name: 'cd_geo_political_type_id',
            default: null
        }
    )
    cdGeoPoliticalTypeId?: number;

    @Column(
        {
            name: 'cd_geo_political_parent_id',
            default: null
        }
    )
    cdGeoPoliticalParentId?: number;

    
    @Column(
        {
            name: 'cd_geo_location_name_alt',
            type: 'json',
            default: null
        }
    )
    cdGeoLocationNameAlt?: string;

    //cd_geo_location_assoc
    @Column(
        {
            name: 'cd_geo_location_assoc',
            type: 'json',
            default: null
        }
    )
    cdGeoLocationAssoc?: string;


    @Column(
        {
            name: 'cd_geo_location_name_population',
            type: 'json',
            default: null
        }
    )
    cdGeoLocationNamePopulation?: string;

    // CdGeoLocationEnabled
    @Column(
        {
            name: 'cd_geo_location_enabled',
            default: null
        }
    )
    cdGeoLocationEnabled?: boolean;

}
