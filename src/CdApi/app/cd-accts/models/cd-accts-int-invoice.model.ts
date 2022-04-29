import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_int_invoice',
        synchronize: false
    }
)
export class CdAcctsIntInvoiceModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_int_invoice_id'
        }
    )
    cdAcctsIntInvoiceId?: number;

    @Column({
        name: 'cd_accts_int_invoice_guid',
    })
    cdAcctsIntInvoiceGuid?: string;

    @Column(
        {
            name: 'cd_accts_int_invoice_name',
        }
    )
    cdAcctsIntInvoiceName: string;

    @Column(
        {
            name: 'cd_accts_int_invoice_description',
        }
    )
    cdAcctsIntInvoiceDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId?: number;

    ////////////

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
            name: 'cd_accts_int_invoice_tax',
        }
    )
    cdAcctsIntInvoiceTax: number;

    @Column(
        {
            name: 'cd_accts_int_invoice_discount',
        }
    )
    cdAcctsIntInvoiceDiscount: number;

    @Column(
        {
            name: 'cd_accts_int_invoice_cost',
        }
    )
    cdAcctsIntInvoiceCost: number;

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
