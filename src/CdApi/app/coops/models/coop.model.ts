import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';



/// ColumnNumericTransformer
export class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}

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
        {
            name: 'coop_name',
            length: 50,
            nullable: true
        }
    )
    coopName: string;

    @Column(
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
    docId?: number;

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
        'numeric', {
        name: 'coop_member_penetration',
        precision: 7,
        scale: 2,
        default: null,
        transformer: new ColumnNumericTransformer(),
    })
    coopMemberPenetration: number;

    @Column(
        {
            name: 'coop_date_label',
            default: null
        }
    )
    coopDateLabel?: string;

    @Column(
        {
            name: 'coop_woccu',
            default: null
        }
    )
    coopWoccu?: number;

    @Column(
        {
            name: 'coop_reserves',
            default: null
        }
    )
    coopReserves?: number;

    @Column(
        {
            name: 'coop_ref_id',
            default: null
        }
    )
    coopRefId?: number;


}
