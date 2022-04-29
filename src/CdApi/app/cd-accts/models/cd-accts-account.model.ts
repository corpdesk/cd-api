import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_account',
        synchronize: false
    }
)
export class CdAcctsAccountModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_account_id'
        }
    )
    cdAcctsAccountId?: number;

    @Column({
        name: 'cd_accts_account_guid',
    })
    cdAcctsAccountGuid?: string;

    @Column(
        {
            name: 'cd_accts_account_name',
        }
    )
    cdAcctsAccountName: string;

    @Column(
        {
            name: 'cd_accts_account_description',
        }
    )
    cdAcctsAccountDescription?: string;

    @Column(
        {
            name: 'cd_accts_account_type_id',
        }
    )
    cdAcctsAccountTypeId?: number;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId?: number;

    @Column(
        {
            name: 'cd_accts_coa_id',
        }
    )
    
    cdAcctsCoaId?: number;

    @Column(
        {
            name: 'parent_id',
        }
    )
    parentId: number;

    @Column(
        {
            name: 'credit',
        }
    )
    credit?: number;

    @Column(
        {
            name: 'debit',
        }
    )
    debit?: number;

    @Column(
        {
            name: 'company_id',
        }
    )
    companyId: number;

    @Column(
        {
            name: 'client_id',
        }
    )
    clientId: number;

    @Column(
        {
            name: 'vendor_id',
        }
    )
    vendorId: number;
}

