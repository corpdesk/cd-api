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
        name: 'cd_geo_type',
        synchronize: false
    }
)
// @CdModel
export class CdGeoViewModel {

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
        'varchar',
        {
            name: 'cd_geo_type_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoTypeName: string;

    @Column(
        'varchar',
        {
            name: 'cd_geo_type_description',
            length: 50,
            nullable: true
        }
    )
    cdGeoTypeDescription: string;

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
        parentGuid: number;


    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
