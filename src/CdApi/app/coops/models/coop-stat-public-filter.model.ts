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
        name: 'coop_stat_public_filter',
        synchronize: false
    }
)
// @CdModel
export class CoopStatPublicFilterModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_stat_public_filter_id'
        }
    )
    coopStatPublicFilterId?: number;

    @Column({
        name: 'coop_stat_public_filter_guid',
        length: 36,
        default: uuidv4()
    })
    coopStatPublicFilterGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_stat_public_filter_name',
            length: 50,
            nullable: true
        }
    )
    coopStatPublicFilterName: string;

    @Column(
        'varchar',
        {
            name: 'coop_stat_public_filter_description',
            length: 50,
            nullable: true
        }
    )
    coopStatPublicFilterDescription: string;

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
