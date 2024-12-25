import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    OneToMany
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';


@Entity(
    {
        name: 'abcd_efg_type',
        synchronize: false
    }
)
// @CdModel
export class AbcdEfgTypeModel {

    @PrimaryGeneratedColumn(
        {
            name: 'abcd_efg_type_id'
        }
    )
    abcdEfgTypeId?: number;

    @Column({
        name: 'abcd_efg_type_guid',
        length: 36,
        default: uuidv4()
    })
    abcdTypeGuid?: string;

    @Column(
        'varchar',
        {
            name: 'abcd_efg_type_name',
            length: 50,
            nullable: true
        }
    )
    abcdEfgTypeName: string;

    @Column(
        'varchar',
        {
            name: 'abcd_efg_type_description',
            length: 50,
            nullable: true
        }
    )
    abcdEfgTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        })
    docId: number;

}
