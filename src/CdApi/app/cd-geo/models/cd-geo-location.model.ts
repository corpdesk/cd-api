import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';



// ALTER TABLE cd_geo_location ADD COLUMN cd_geo_locataion_code varchar(4) DEFAULT NULL;
// ALTER TABLE cd_geo_location ADD COLUMN cd_geo_locataion_icon varchar(10) DEFAULT NULL;
// ALTER TABLE cd_geo_location ADD COLUMN back4app_obectId varchar(10) DEFAULT NULL;
// ALTER TABLE cd_geo_location ADD COLUMN cd_geo_political_type_id int DEFAULT NULL;
// ALTER TABLE cd_geo_location ADD COLUMN cd_geo_political_parent_id int DEFAULT NULL;
// ALTER TABLE cd_geo_location DROP COLUMN cd_geo_political_type_guid;
// ALTER TABLE cd_geo_location DROP COLUMN cd_geo_political_parent;

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
        name: 'cd_geo_locataion_code',
        length: 4,
        default: null
    })
    cdGeoLocataionCode?: string;

    @Column({
        name: 'cd_geo_locataion_icon',
        length: 10,
        default: null
    })
    cdGeoLocataionIcon?: string;

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

}
