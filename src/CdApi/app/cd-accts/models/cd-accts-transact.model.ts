import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_transact',
        synchronize: false
    }
)
export class CdAcctsTransactModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_transact_id'
        }
    )
    cdAcctsTransactId?: number;

    @Column({
        name: 'cd_accts_transact_guid',
    })
    cdAcctsTransactGuid?: string;

    @Column(
        {
            name: 'cd_accts_transact_name',
        }
    )
    cdAcctsTransactName: string;

    @Column(
        {
            name: 'cd_accts_transact_description',
        }
    )
    cdAcctsTransactDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId?: number;

    // SELECT cd_accts_transact_id, cd_accts_transact_guid, cd_accts_transact_name, cd_accts_transact_description, doc_id, 
    // cd_accts_account_id, cd_accts_transact_media_id, cd_accts_transact_state_id, credit, debit, cd_accts_currency_id, cd_accts_transact_type_id, company_id, cd_accts_transact_amount, cd_accts_transact_parent_id
    // FROM cd1213.cd_accts_transact;

    @Column(
        {
            name: 'cd_accts_transact_type_id',
        }
    )
    cdAcctsTransactTypeId?: number;

    @Column(
        {
            name: 'cd_accts_account_id',
        }
    )
    cdAcctsAccountId: number;

    @Column(
        {
            name: 'cd_accts_transact_media_id',
        }
    )
    cdAcctsTransactMediaId: number;

    @Column(
        {
            name: 'cd_accts_transact_state_id',
        }
    )
    cdAcctsTransactStateId: number;

    @Column(
        {
            name: 'credit',
        }
    )
    credit: boolean;

    @Column(
        {
            name: 'debit',
        }
    )
    debit: boolean;

    @Column(
        {
            name: 'cd_accts_currency_id',
        }
    )
    cdAcctsCurrencyId: number;

    @Column(
        {
            name: 'company_id',
        }
    )
    companyId: number;

    @Column(
        {
            name: 'cd_accts_transact_amount',
        }
    )
    cdAcctsTransactAmount: number;

    @Column(
        {
            name: 'cd_accts_transact_balance',
        }
    )
    cdAcctsTransactBalance: number;

    @Column(
        {
            name: 'cd_accts_transact_parent_id',
        }
    )
    cdAcctsTransactParentId?: number;

    @Column(
        {
            name: 'cd_accts_transact_media_date',
        }
    )
    cdAcctsTransactMediaDate?: number;

}
