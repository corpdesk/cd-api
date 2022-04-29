import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_tax',
        synchronize: false
    }
)
export class CdAcctsTaxModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_tax_id'
        }
    )
    cdAcctsTaxId: number;

    @Column({
        name: 'cd_accts_tax_guid',
    })
    cdAcctsTaxGuid: string;

    @Column(
        {
            name: 'cd_accts_tax_name',
        }
    )
    cdAcctsTaxName: string;

    @Column(
        {
            name: 'cd_accts_tax_description',
        }
    )
    cdAcctsTaxDescription?: string;

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
            name: 'cd_accts_tax_type_id',
        }
    )
    cdAcctsTaxTypeId: number;

    
}
