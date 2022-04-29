import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_payment',
        synchronize: false
    }
)
export class CdAcctsPaymentModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_payment_id'
        }
    )
    cdAcctsPaymentId: number;

    @Column({
        name: 'cd_accts_payment_guid',
    })
    cdAcctsPaymentGuid: string;

    @Column(
        {
            name: 'cd_accts_payment_name',
        }
    )
    cdAcctsPaymentName: string;

    @Column(
        {
            name: 'cd_accts_payment_description',
        }
    )
    cdAcctsPaymentDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'cd_accts_ext_invoice_id',
        }
    )
    cdAcctsExtInvoiceId: number;

    @Column(
        {
            name: 'cd_accts_payment_type_id',
        }
    )
    cdAcctsPaymentTypeId: number;

    @Column(
        {
            name: 'cd_accts_transact_id',
        }
    )
    cdAcctsTransactId: number;
   
}
