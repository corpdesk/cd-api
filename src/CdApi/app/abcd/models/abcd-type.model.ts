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
        name: 'abcd_type',
        synchronize: false
    }
)
// @CdModel
export class AbcdTypeModel {

    @PrimaryGeneratedColumn(
        {
            name: 'abcd_type_id'
        }
    )
    abcdTypeId?: number;

    @Column({
        name: 'abcd_type_guid',
        length: 36,
        default: uuidv4()
    })
    abcdTypeGuid?: string;

    @Column(
        'varchar',
        {
            name: 'abcd_type_name',
            length: 50,
            nullable: true
        }
    )
    abcdTypeName: string;

    @Column(
        'varchar',
        {
            name: 'abcd_type_description',
            length: 50,
            nullable: true
        }
    )
    abcdTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        })
    docId: number;

    @Column(
        {
            name: 'parent_guid',
            default: null
        })
    parentGuid: string;

    @Column(
        {
            name: 'abcd_type_enabled',
            default: null
        })
    abcdTypeEnabled: boolean;



    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
