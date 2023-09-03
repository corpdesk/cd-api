import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'invoice_total_settled_view',
    synchronize: false,
    expression: `
    select sum(cd_accts_transact_amount) as total_paid, cd_accts_int_invoice_id   from cd_accts_vendor_statement_view where debit = true
    GROUP BY cd_accts_int_invoice_id
    ORDER BY SUM(cd_accts_int_invoice_id) DESC;
    `
})

export class InvoiceTotalSettledViewModel {
    @ViewColumn(
        {
            name: 'total_paid'
        }
    )
    totalPaid: number;

    @ViewColumn(
        {
            name: 'cd_accts_int_invoice_id'
        }
    )
    cdAcctsIntInvoiceId: number;

    
}