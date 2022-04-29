import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { DecimalTransformer, DecimalToString, ColumnNumericTransformer } from '../../../sys/base/decimal-transformer';
import { Transform } from 'class-transformer';

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
            name: 'cd_accts_int_invoice_id',
        }
    )
    cdAcctsIntInvoiceId: number;

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

    @Column(
        {
            name: 'bill_date',
        }
    )
    billDate: string;

    // transformer: new ColumnNumericTransformer()
    @Column(
        {
            name: 'bill_tax',
            type: 'numeric',
            precision: 10,
            scale: 2,
            default: 0.0,
            nullable: true,
            transformer: new ColumnNumericTransformer()
        }
    )
    billTax: number;

    @Column(
        {
            name: 'bill_discount',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0.0,
            nullable: true,
            transformer: new ColumnNumericTransformer()
        }
    )
    billDiscount: number;

    @Column(
        {
            name: 'bill_cost',
            type: 'decimal',
            precision: 13,
            scale: 2,
            default: 0.0,
            nullable: true,
            transformer: new ColumnNumericTransformer()
        }
    )
    billCost: number;

    // 
    // @Column(
    //     {
    //         name: 'cd_accts_int_invoice_id',
    //     }
    // )
    // cdAcctsIntInvoiceId: number;

}
