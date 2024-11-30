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
        name: 'coop_ref',
        synchronize: false
    }
)
// @CdModel
export class CoopStatRefModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_ref_id'
        }
    )
    coopStatRefId?: number;

    @Column({
        name: 'coop_ref_guid',
        length: 36,
        default: uuidv4()
    })
    coopStatRefGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_ref_name',
            length: 50,
            nullable: true
        }
    )
    coopStatRefName: string;

    @Column(
        'varchar',
        {
            name: 'coop_ref_description',
            length: 50,
            nullable: true
        }
    )
    coopStatRefDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        })
    docId: number;


    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
