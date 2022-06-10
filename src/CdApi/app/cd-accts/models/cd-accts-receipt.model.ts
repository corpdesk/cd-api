import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_receipt',
        synchronize: false
    }
)
export class CdAcctsReceiptModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_receipt_id'
        }
    )
    cdAcctsReceiptId: number;

    @Column({
        name: 'cd_accts_receipt_guid',
    })
    cdAcctsReceiptGuid: string;

    @Column(
        {
            name: 'cd_accts_receipt_name',
        }
    )
    cdAcctsReceiptName: string;

    @Column(
        {
            name: 'cd_accts_receipt_description',
        }
    )
    cdAcctsReceiptDescription?: string;

    // cd_accts_receipt_amount
    @Column(
        {
            name: 'cd_accts_receipt_amount',
        }
    )
    cdAcctsReceiptAmount: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'cd_accts_int_invoice_id',
        }
    )
    cdAcctsIntInvoiceId: number;

    @Column(
        {
            name: 'cd_accts_receipt_type_id',
        }
    )
    cdAcctsReceiptTypeId: number;

    @Column(
        {
            name: 'cd_accts_transact_vendor_id',
        }
    )
    cdAcctsTransactVendorId?: number;

    @Column(
        {
            name: 'cd_accts_transact_client_id',
        }
    )
    cdAcctsTransactClientId?: number;
   
}
