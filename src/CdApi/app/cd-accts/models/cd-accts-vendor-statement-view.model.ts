import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'cd_accts_vendor_statement_view',
    synchronize: false,
    expression: `
    select
        'cd_accts_invoice_vendor_view'.'bill_id' AS 'bill_id',
        'cd_accts_invoice_vendor_view'.'bill_guid' AS 'bill_guid',
        'cd_accts_invoice_vendor_view'.'bill_name' AS 'bill_name',
        'cd_accts_invoice_vendor_view'.'bill_description' AS 'bill_description',
        'cd_accts_invoice_vendor_view'.'cd_accts_int_invoice_id' AS 'cd_accts_int_invoice_id',
        'cd_accts_invoice_vendor_view'.'client_id' AS 'client_id',
        'cd_accts_invoice_vendor_view'.'vendor_id' AS 'vendor_id',
        'cd_accts_invoice_vendor_view'.'bill_date' AS 'bill_date',
        'cd_accts_invoice_vendor_view'.'bill_tax' AS 'bill_tax',
        'cd_accts_invoice_vendor_view'.'bill_discount' AS 'bill_discount',
        'cd_accts_invoice_vendor_view'.'bill_cost' AS 'bill_cost',
        'cd_accts_invoice_vendor_view'.'company_name' AS 'company_name',
        'cd_accts_invoice_vendor_view'.'postal_address' AS 'postal_address',
        'cd_accts_invoice_vendor_view'.'email' AS 'email',
        'cd_accts_invoice_vendor_view'.'cd_accts_transact_vendor_id' AS 'cd_accts_transact_vendor_id',
        'cd_accts_invoice_vendor_view'.'cd_accts_transact_client_id' AS 'cd_accts_transact_client_id',
        'cd_accts_invoice_vendor_view'.'cd_accts_account_id' AS 'cd_accts_account_id',
        'cd_accts_invoice_vendor_view'.'credit' AS 'credit',
        'cd_accts_invoice_vendor_view'.'debit' AS 'debit',
        'cd_accts_invoice_vendor_view'.'cd_accts_transact_media_id' AS 'cd_accts_transact_media_id',
        'cd_accts_invoice_vendor_view'.'cd_accts_transact_state_id' AS 'cd_accts_transact_state_id',
        'cd_accts_invoice_vendor_view'.'cd_accts_currency_id' AS 'cd_accts_currency_id',
        'cd_accts_invoice_vendor_view'.'cd_accts_transact_amount' AS 'cd_accts_transact_amount',
        'cd_accts_invoice_vendor_view'.'cd_accts_transact_media_date' AS 'cd_accts_transact_media_date'
    from
        'cd_accts_invoice_vendor_view'
    union
    select
        'cd_accts_receipt_vendor_view'.'bill_id' AS 'bill_id',
        'cd_accts_receipt_vendor_view'.'bill_guid' AS 'bill_guid',
        'cd_accts_receipt_vendor_view'.'bill_name' AS 'bill_name',
        'cd_accts_receipt_vendor_view'.'bill_description' AS 'bill_description',
        'cd_accts_receipt_vendor_view'.'cd_accts_int_invoice_id' AS 'cd_accts_int_invoice_id',
        'cd_accts_receipt_vendor_view'.'client_id' AS 'client_id',
        'cd_accts_receipt_vendor_view'.'vendor_id' AS 'vendor_id',
        'cd_accts_receipt_vendor_view'.'bill_date' AS 'bill_date',
        'cd_accts_receipt_vendor_view'.'bill_tax' AS 'bill_tax',
        'cd_accts_receipt_vendor_view'.'bill_discount' AS 'bill_discount',
        'cd_accts_receipt_vendor_view'.'bill_cost' AS 'bill_cost',
        'cd_accts_receipt_vendor_view'.'company_name' AS 'company_name',
        'cd_accts_receipt_vendor_view'.'postal_address' AS 'postal_address',
        'cd_accts_receipt_vendor_view'.'email' AS 'email',
        'cd_accts_receipt_vendor_view'.'cd_accts_transact_vendor_id' AS 'cd_accts_transact_vendor_id',
        'cd_accts_receipt_vendor_view'.'cd_accts_transact_client_id' AS 'cd_accts_transact_client_id',
        'cd_accts_receipt_vendor_view'.'cd_accts_account_id' AS 'cd_accts_account_id',
        'cd_accts_receipt_vendor_view'.'credit' AS 'credit',
        'cd_accts_receipt_vendor_view'.'debit' AS 'debit',
        'cd_accts_receipt_vendor_view'.'cd_accts_transact_media_id' AS 'cd_accts_transact_media_id',
        'cd_accts_receipt_vendor_view'.'cd_accts_transact_state_id' AS 'cd_accts_transact_state_id',
        'cd_accts_receipt_vendor_view'.'cd_accts_currency_id' AS 'cd_accts_currency_id',
        'cd_accts_receipt_vendor_view'.'cd_accts_transact_amount' AS 'cd_accts_transact_amount',
            'cd_accts_receipt_vendor_view'.'cd_accts_transact_media_date' AS 'cd_accts_transact_media_date'
    from
        'cd_accts_receipt_vendor_view';
    `
})

/**
 * 
 * SELECT 
 * bill_id, bill_guid, bill_name, bill_description, cd_accts_int_invoice_id, client_id, 
 * vendor_id, bill_date, bill_tax, bill_discount, bill_cost, company_name, postal_address, 
 * email, cd_accts_transact_vendor_id, cd_accts_transact_client_id, cd_accts_account_id, 
 * credit, debit, cd_accts_transact_media_id, cd_accts_transact_state_id, cd_accts_currency_id, 
 * cd_accts_transact_amount, cd_accts_transact_media_date 
 * FROM cd1213.cd_accts_vendor_statement_view;
 */



export class CdAcctsVendorStatementViewModel {
    @ViewColumn(
        {
            name: 'bill_id'
        }
    )
    billId: number;

    @ViewColumn(
        {
            name: 'bill_guid'
        }
    )
    billGuid: number;

    @ViewColumn(
        {
            name: 'bill_name'
        }
    )
    billName: string;

    @ViewColumn(
        {
            name: 'bill_description'
        }
    )
    billDescription: string;

    @ViewColumn(
        {
            name: 'cd_accts_int_invoice_id'
        }
    )
    cdAcctsIntInvoiceId: number;

    @ViewColumn(
        {
            name: 'client_id'
        }
    )
    clientId: number;

    @ViewColumn(
        {
            name: 'vendor_id'
        }
    )
    vendorId: string;

    @ViewColumn(
        {
            name: 'bill_date'
        }
    )
    billDate: string;

    @ViewColumn(
        {
            name: 'bill_tax'
        }
    )
    billTax: string;

    @ViewColumn(
        {
            name: 'bill_discount'
        }
    )
    billDiscount: string;

    @ViewColumn(
        {
            name: 'bill_cost'
        }
    )
    billCost: string;

    @ViewColumn(
        {
            name: 'company_name'
        }
    )
    companyName: string;

    @ViewColumn(
        {
            name: 'postal_address'
        }
    )
    postalAddress: string;

    @ViewColumn(
        {
            name: 'email'
        }
    )
    email: string;

    @ViewColumn(
        {
            name: 'cd_accts_transact_vendor_id',
        }
    )
    cdAcctsTransactVendorId?: number;

    @ViewColumn(
        {
            name: 'cd_accts_transact_client_id',
        }
    )
    cdAcctsTransactClientId?: number;

    @ViewColumn(
        {
            name: 'cd_accts_account_id',
        }
    )
    cdAcctsAccountId?: number;

    @ViewColumn(
        {
            name: 'credit',
        }
    )
    credit: boolean;

    @ViewColumn(
        {
            name: 'debit',
        }
    )
    debit: boolean;

    @ViewColumn(
        {
            name: 'cd_accts_transact_media_id',
        }
    )
    cdAcctsTransactMediaId: number;

    @ViewColumn(
        {
            name: 'cd_accts_transact_state_id',
        }
    )

    cdAcctsTransactStateId: number;

    @ViewColumn(
        {
            name: 'cd_accts_currency_id',
        }
    )
    cdAcctsCurrencyId: number;

    @ViewColumn(
        {
            name: 'cd_accts_transact_amount',
        }
    )
    cdAcctsTransactAmount: number;

    @ViewColumn(
        {
            name: 'cd_accts_transact_media_date',
        }
    )
    cdAcctsTransactMediaDate: string;

    @ViewColumn(
        {
            name: 'cd_accts_transact_id',
        }
    )
    cdAcctsTransactId: number;

    @ViewColumn(
        {
            name: 'cd_accts_transact_balance',
        }
    )
    cdAcctsTransactBalance: number;

    @ViewColumn(
        {
            name: 'doc_date',
        }
    )
    docDate: string;
}