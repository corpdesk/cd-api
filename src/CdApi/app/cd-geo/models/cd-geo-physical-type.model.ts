import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';


// `cd_geo_physical_type`.`cd_geo_physical_type_id`,
//     `cd_geo_physical_type`.`cd_geo_physical_type_guid`,
//     `cd_geo_physical_type`.`cd_geo_physical_type_name`,
//     `cd_geo_physical_type`.`cd_geo_physical_type_description`,
//     `cd_geo_physical_type`.`lat`,
//     `cd_geo_physical_type`.`long`,
//     `cd_geo_physical_type`.`cd_geo_boundary_data`,
//     `cd_geo_physical_type`.`doc_id`,
//     `cd_geo_physical_type`.`cd_geo_political_type_guid`,
//     `cd_geo_physical_type`.`cd_geo_political_parent`

@Entity(
    {
        name: 'cd_geo_physical_type',
        synchronize: false
    }
)
export class CdGeoPhysicalTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_physical_type_id'
        }
    )
    cdGeoPhysicalTypeId?: number;

    @Column({
        name: 'cd_geo_physical_type_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoPhysicalTypeGuid?: string;

    @Column(
        {
            name: 'cd_geo_physical_type_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoPhysicalTypeName: string;

    @Column(
        {
            name: 'cd_geo_physical_type_description',
            length: 60,
            default: null
        })
    cdGeoPhysicalTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    @Column(
        {
            name: 'cd_geo_physical_type_type_id',
            default: null
        }
    )
    cdGeoPhysicalTypeTypeId?: number;


}
