import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';



// `cd_geo_location`.`cd_geo_location_id`,
//     `cd_geo_location`.`cd_geo_location_guid`,
//     `cd_geo_location`.`cd_geo_location_name`,
//     `cd_geo_location`.`cd_geo_location_description`,
//     `cd_geo_location`.`lat`,
//     `cd_geo_location`.`long`,
//     `cd_geo_location`.`cd_geo_boundary_data`,
//     `cd_geo_location`.`doc_id`,
//     `cd_geo_location`.`cd_geo_political_type_guid`,
//     `cd_geo_location`.`cd_geo_political_parent`

@Entity(
    {
        name: 'cd_geo_location',
        synchronize: false
    }
)
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

    @Column(
        {
            name: 'cd_geo_location_type_id',
            default: null
        }
    )
    cdGeoLocationTypeId?: number;

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
        name: 'cd_geo_location_guid',
        type: 'json'
    })
    cd_geo_boundary_data?: string;

    @Column({
        name: 'cd_geo_political_type_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoPoliticalTypeGuid?: string;

    @Column({
        name: 'cd_geo_political_parent',
        default: null,
    })
    cdGeoPoliticalParent?: string;

}
