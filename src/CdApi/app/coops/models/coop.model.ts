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
import Decimal from 'decimal.js';

@Entity(
    {
        name: 'coop',
        synchronize: false
    }
)
export class CoopModel {
    @PrimaryGeneratedColumn(
        {
            name: 'coop_id'
        }
    )
    coopId?: number;

    @Column({
        name: 'coop_guid',
        length: 36,
        default: uuidv4()
    })
    coopGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_name',
            length: 50,
            nullable: true
        }
    )
    coopName: string;

    @Column(
        'varchar',
        {
            name: 'coop_description',
            length: 60,
            default: null
        })
        coopDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: string;

    @Column(
        {
            name: 'coop_type_id',
            default: null
        }
    )
    coopTypeId?: number;

    @Column(
        {
            name: 'cd_geo_location_id',
            default: null
        }
    )
    cdGeoLocationId?: number;

    @Column(
        {
            name: 'coop_count',
            default: null
        }
    )
    coopCount?: number;

    @Column(
        {
            name: 'coop_members_count',
            default: null
        }
    )
    coopMembersCount?: number;

    @Column(
        {
            name: 'coop_saves_shares',
            default: null
        }
    )
    coopSavesShares?: number;

    @Column(
        {
            name: 'coop_loans',
            default: null
        }
    )
    coopLoans?: number;

    @Column(
        {
            name: 'coop_assets',
            default: null
        }
    )
    coopAssets?: number;

    @Column(
        {
            name: 'coop_member_penetration',
            default: null
        }
    )
    coopMemberPenetration?: Decimal;

    @Column(
        {
            name: 'date_label',
            default: null
        }
    )
    dateLabel?: Decimal;
    
    @Column(
        {
            name: 'coop_woccu',
            default: null
        }
    )
    coopWoccu?: Decimal;

    @Column(
        {
            name: 'coop_reserves',
            default: null
        }
    )
    coopReserves?: Decimal;
    

}
