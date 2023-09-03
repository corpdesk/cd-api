import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'bill_view',
    synchronize: false,
    expression: `
    SELECT
        bill_id, bill_guid, bill_name, bill_description,cd_accts_int_invoice_id, client_id, vendor_id,
        bill_date, bill_tax, bill_discount, bill_cost,
        company_name, postal_address
    FROM bill
    INNER JOIN company ON
    client_id = company.company_id
    `
})

export class BillViewModel {
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
}