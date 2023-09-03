import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'cd_accts_account_view',
    synchronize: false,
    expression: `
    select
        cd_accts_account.cd_accts_account_id AS cd_accts_account_id,
        cd_accts_account.cd_accts_account_guid AS cd_accts_account_guid,
        cd_accts_account.cd_accts_account_name AS cd_accts_account_name,
        cd_accts_account.cd_accts_account_description AS cd_accts_account_description,
        cd_accts_account.doc_id AS doc_id,
        cd_accts_account.cd_accts_coa_id AS cd_accts_coa_id,
        cd_accts_account.parent_id AS parent_id,
        cd_accts_account.credit AS credit,
        cd_accts_account.debit AS debit,
        cd_accts_account.cd_accts_account_type_id AS cd_accts_account_type_id,
        cd_accts_account_type.cd_accts_account_type_guid AS cd_accts_account_type_guid,
        cd_accts_account_type.cd_accts_account_type_name AS cd_accts_account_type_name,
        cd_accts_account_type.cd_accts_account_type_description AS cd_accts_account_type_description
    from
        (cd_accts_account
    join cd_accts_account_type on
        ((cd_accts_account.cd_accts_account_type_id = cd_accts_account_type.cd_accts_account_type_id)));
    `
})

export class CdAcctsAccountViewModel {
    @ViewColumn(
        {
            name: 'cd_accts_account_id'
        }
    )
    cdAcctsAccountId: number;

    @ViewColumn(
        {
            name: 'cd_accts_account_guid'
        }
    )
    cdAcctsAccountGuid: string;

    @ViewColumn(
        {
            name: 'cd_accts_account_name'
        }
    )
    cdAcctsAccountName: string;

    @ViewColumn(
        {
            name: 'cd_accts_account_description'
        }
    )
    cdAcctsAccountDescription: string;

    @ViewColumn(
        {
            name: 'doc_id'
        }
    )
    docId: number;

    @ViewColumn(
        {
            name: 'cd_accts_coa_id'
        }
    )
    cdAcctsCoaId: number;

    @ViewColumn(
        {
            name: 'parent_id'
        }
    )
    parentId: number;

    @ViewColumn(
        {
            name: 'credit'
        }
    )
    credit: boolean;

    @ViewColumn(
        {
            name: 'debit'
        }
    )
    debit: boolean;

    @ViewColumn(
        {
            name: 'cd_accts_account_type_id'
        }
    )
    cdAcctsAccountTypeId: number;

    @ViewColumn(
        {
            name: 'cd_accts_account_type_guid'
        }
    )
    cdAcctsAccountTypeGuid: string;

    @ViewColumn(
        {
            name: 'cd_accts_account_type_name'
        }
    )
    cdAcctsAccountTypeName: string;

    @ViewColumn(
        {
            name: 'cd_accts_account_type_description'
        }
    )
    cdAcctsAccountTypeDescription: string;

}