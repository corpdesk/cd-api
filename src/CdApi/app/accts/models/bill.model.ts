import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'bill',
        synchronize: false
    }
)
export class BillModel {
    @PrimaryGeneratedColumn(
        {
            name: 'bill_id'
        }
    )
    billId: number;

    @Column({
        name: 'bill_guid',
    })
    billGuid: string;

    @Column(
        {
            name: 'bill_name',
        }
    )
    billName: string;

    @Column(
        {
            name: 'bill_description',
        }
    )
    billDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'vendor_id',
        }
    )
    vendorId: number;

    @Column(
        {
            name: 'client_id',
        }
    )
    clientId: number;

    // date, tax, discount, cost

    @Column(
        {
            name: 'bill_date',
        }
    )
    billDate: string;

    @Column(
        {
            name: 'bill_tax',
        }
    )
    billTax: number;

    @Column(
        {
            name: 'bill_discount',
        }
    )
    billDiscount: number;

    @Column(
        {
            name: 'bill_cost',
        }
    )
    billCost: number;
}
