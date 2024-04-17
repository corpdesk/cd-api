import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';


// `cd_geo_type`.`cd_geo_type_id`,
//     `cd_geo_type`.`cd_geo_type_guid`,
//     `cd_geo_type`.`cd_geo_type_name`,
//     `cd_geo_type`.`cd_geo_type_description`,
//     `cd_geo_type`.`lat`,
//     `cd_geo_type`.`long`,
//     `cd_geo_type`.`cd_geo_boundary_data`,
//     `cd_geo_type`.`doc_id`,
//     `cd_geo_type`.`cd_geo_type_guid`,
//     `cd_geo_type`.`cd_geo_political_parent`

@Entity(
    {
        name: 'cd_geo_type',
        synchronize: false
    }
)
export class CdGeoTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_type_id'
        }
    )
    cdGeoTypeId?: number;

    @Column({
        name: 'cd_geo_type_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoTypeGuid?: string;

    @Column(
        {
            name: 'cd_geo_type_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoTypeName: string;

    @Column(
        {
            name: 'cd_geo_type_description',
            length: 60,
            default: null
        })
    cdGeoTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

}
