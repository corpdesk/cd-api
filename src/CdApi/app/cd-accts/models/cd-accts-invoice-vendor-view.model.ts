import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'cd_accts_invoice_vendor_view',
    synchronize: false,
    expression: `
    select
        bill.bill_id AS bill_id,
        bill.bill_guid AS bill_guid,
        bill.bill_name AS bill_name,
        bill.bill_description AS bill_description,
        bill.cd_accts_int_invoice_id AS cd_accts_int_invoice_id,
        bill.client_id AS client_id,
        bill.vendor_id AS vendor_id,
        bill.bill_date AS bill_date,
        bill.bill_tax AS bill_tax,
        bill.bill_discount AS bill_discount,
        bill.bill_cost AS bill_cost,
        company.company_name AS company_name,
        company.postal_address AS postal_address,
        company.email AS email,
        cd_accts_int_invoice.cd_accts_transact_vendor_id AS cd_accts_transact_vendor_id,
        cd_accts_int_invoice.cd_accts_transact_client_id AS cd_accts_transact_client_id,
        cd_accts_transact.cd_accts_account_id AS cd_accts_account_id,
        cd_accts_transact.credit AS credit,
        cd_accts_transact.debit AS debit,
        cd_accts_transact.cd_accts_transact_media_id AS cd_accts_transact_media_id,
        cd_accts_transact.cd_accts_transact_state_id AS cd_accts_transact_state_id,
        cd_accts_transact.cd_accts_currency_id AS cd_accts_currency_id,
        cd_accts_transact.cd_accts_transact_amount AS cd_accts_transact_amount
    from
        (((bill
    join company on
        ((bill.client_id = company.company_id)))
    join cd_accts_int_invoice on
        ((bill.cd_accts_int_invoice_id = cd_accts_int_invoice.cd_accts_int_invoice_id)))
    join cd_accts_transact on
        ((cd_accts_transact.cd_accts_transact_id = cd_accts_int_invoice.cd_accts_transact_vendor_id)));
    `
})

// cd_accts_invoice_vendor_view:
// -----------------------------
// bill_id, bill_guid, bill_name, bill_description, cd_accts_int_invoice_id, client_id, 
// vendor_id, bill_date, bill_tax, bill_discount, bill_cost, company_name, postal_address, 
// email, cd_accts_transact_vendor_id, cd_accts_transact_client_id, cd_accts_account_id, credit, 
// debit, cd_accts_transact_media_id, cd_accts_transact_state_id, cd_accts_currency_id, 
// cd_accts_transact_amount

export class CdAcctsInvoiceVendorViewModel {
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
}