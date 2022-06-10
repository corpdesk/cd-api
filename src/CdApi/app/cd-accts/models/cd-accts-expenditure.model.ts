import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_expenditure',
        synchronize: false
    }
)
export class CdAcctsExpenditureModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_expenditure_id'
        }
    )
    cdAcctsExpenditureId: number;

    @Column({
        name: 'cd_accts_expenditure_guid',
    })
    cdAcctsExpenditureGuid: string;

    @Column(
        {
            name: 'cd_accts_expenditure_name',
        }
    )
    cdAcctsExpenditureName: string;

    @Column(
        {
            name: 'cd_accts_expenditure_description',
        }
    )
    cdAcctsExpenditureDescription?: string;

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
            name: 'cd_accts_expenditure_type_id',
        }
    )
    cdAcctsExpenditureTypeId: number;

    @Column(
        {
            name: 'cd_accts_transact_id',
        }
    )
    cdAcctsTransactId: number;
   
}
