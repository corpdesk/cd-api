import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'bill_rate',
        synchronize: false
    }
)
export class BillRateModel {
    @PrimaryGeneratedColumn(
        {
            name: 'bill_rate_id'
        }
    )
    billRateId: number;

    @Column({
        name: 'bill_rate_guid',
    })
    billRateGuid: string;

    @Column(
        {
            name: 'bill_rate_name',
        }
    )
    billRateName: string;

    @Column(
        {
            name: 'bill_rate_description',
        }
    )
    billRateDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'bill_rate_amount',
        }
    )
    billRateAmount: number;

    @Column(
        {
            name: 'bill_rate_short',
        }
    )
    billRateShort: string;
}
