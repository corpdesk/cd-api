/**
 * Root Entity
 * Base Name: abcd
 */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


@Entity(
    {
        name: 'abcd',
        synchronize: false
    }
)
export class AbcdModel {
    @PrimaryGeneratedColumn(
        {
            name: 'abcd_id'
        }
    )
    abcdId?: number;

    @Column({
        name: 'abcd_guid',
        length: 36,
        default: uuidv4()
    })
    abcdGuid?: string;

    @Column(
        {
            name: 'abcd_name',
            length: 50,
            nullable: true
        }
    )
    abcdName: string;

    @Column(
        {
            name: 'abcd_description',
            length: 60,
            default: null
        })
    abcdDescription: string;

    /**
     *link to DocModel
     * Doc model stores metadata for all transaction 
     * See Documentation on Doc Processing 
     */
    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    @Column(
        {
            name: 'abcd_type_id',
            default: null
        }
    )
    abcdTypeId?: number;

    @Column(
        {
            name: 'company_id',
            default: null
        }
    )
    companyId?: number;

    /**
     * this is the geo-scope of a given abcd...or SACCO or Credit Union
     */
    @Column(
        {
            name: 'cd_geo_location_id',
            default: null
        }
    )
    cdGeoLocationId?: number;

    @Column(
        'boolean',
        {
            name: 'abcd_enabled',
            default: null
        }
    )
    abcdEnabled?: boolean;  
}
