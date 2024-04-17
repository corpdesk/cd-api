import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';


// `cd_geo_proximity`.`cd_geo_proximity_id`,
//     `cd_geo_proximity`.`cd_geo_proximity_guid`,
//     `cd_geo_proximity`.`cd_geo_proximity_name`,
//     `cd_geo_proximity`.`cd_geo_proximity_description`,
//     `cd_geo_proximity`.`lat`,
//     `cd_geo_proximity`.`long`,
//     `cd_geo_proximity`.`cd_geo_boundary_data`,
//     `cd_geo_proximity`.`doc_id`,
//     `cd_geo_proximity`.`cd_geo_proximity_guid`,
//     `cd_geo_proximity`.`cd_geo_political_parent`

@Entity(
    {
        name: 'cd_geo_proximity',
        synchronize: false
    }
)
export class CdGeoProximityModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_proximity_id'
        }
    )
    cdGeoProximityId?: number;

    @Column({
        name: 'cd_geo_proximity_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoProximityGuid?: string;

    @Column(
        {
            name: 'cd_geo_proximity_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoProximityName: string;

    @Column(
        {
            name: 'cd_geo_proximity_description',
            length: 60,
            default: null
        })
    cdGeoProximityDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    
    @Column(
        {
            name: 'cd_geo_proximity_data',
            type: 'json',
            default: null
        })
    cdGeoProximityData: string;


}
