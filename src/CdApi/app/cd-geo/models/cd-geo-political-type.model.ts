import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';



@Entity(
    {
        name: 'cd_geo_political_type',
        synchronize: false
    }
)
export class CdGeoPoliticalTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_political_type_id'
        }
    )
    cdGeoPoliticalTypeId?: number;

    @Column({
        name: 'cd_geo_political_type_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoPoliticalTypeGuid?: string;

    @Column(
        {
            name: 'cd_geo_political_type_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoPoliticalTypeName: string;

    @Column(
        {
            name: 'cd_geo_political_type_description',
            length: 60,
            default: null
        })
    cdGeoPoliticalTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

}
