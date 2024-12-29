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
        name: 'cd_cli_type',
        synchronize: false
    }
)
// @CdModel
export class CdCliTypeModel {

    @PrimaryGeneratedColumn(
        {
            name: 'cd_cli_type_id'
        }
    )
    cdCliTypeId?: number;

    @Column({
        name: 'cd_cli_type_guid',
        length: 36,
        default: uuidv4()
    })
    cdCliTypeGuid?: string;

    @Column(
        'varchar',
        {
            name: 'cd_cli_type_name',
            length: 50,
            nullable: true
        }
    )
    cdCliTypeName: string;

    @Column(
        'varchar',
        {
            name: 'cd_cli_type_description',
            length: 50,
            nullable: true
        }
    )
    cdCliTypeDescription: string;

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
            name: 'cd_cli_type_enabled',
            default: null
        })
    cdCliTypeEnabled: boolean;



    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
