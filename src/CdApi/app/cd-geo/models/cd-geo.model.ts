import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';


// `cd_geo_`.`cd_geo_id`,
//     `cd_geo_`.`cd_geo_guid`,
//     `cd_geo_`.`cd_geo_name`,
//     `cd_geo_`.`cd_geo_description`,
//     `cd_geo_`.`lat`,
//     `cd_geo_`.`long`,
//     `cd_geo_`.`cd_geo_boundary_data`,
//     `cd_geo_`.`doc_id`,
//     `cd_geo_`.`cd_geo_guid`,
//     `cd_geo_`.`cd_geo_political_parent`

@Entity(
    {
        name: 'cd_geo_',
        synchronize: false
    }
)
export class CdGeoModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_id'
        }
    )
    cdGeoId?: number;

    @Column({
        name: 'cd_geo_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoGuid?: string;

    @Column(
        {
            name: 'cd_geo_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoName: string;

    @Column(
        {
            name: 'cd_geo_description',
            length: 60,
            default: null
        })
    cdGeoDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    @Column(
        {
            name: 'cd_geo_count',
            default: null
        }
    )
    cdGeoCount?: number;


}
