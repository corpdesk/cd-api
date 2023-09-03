import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'bill_item_view',
    synchronize:false,
    expression: `
    SELECT
    bill_item_id, bill_item_guid, bill_item_name, bill_item_description, bill_item.doc_id,
    bill_item.bill_rate_id, bill_item.bill_unit_id, bill_item.bill_type_id, bill_item.bill_id, bill_item.bill_item_date,
    bill_rate_amount, bill_unit_name,
    client_id, company_name, postal_address, physical_location, email, units, (select (bill_rate_amount * units)) AS cost
    FROM bill_item
    INNER JOIN bill ON bill_item.bill_id = bill.bill_id
    INNER JOIN bill_rate ON bill_item.bill_rate_id = bill_rate.bill_rate_id
    INNER JOIN bill_unit ON bill_item.bill_unit_id = bill_unit.bill_unit_id
    INNER JOIN company ON bill.client_id = company.company_id
    `
})

export class BillItemViewModel {
    @ViewColumn(
        {
            name: 'bill_item_id'
        }
    )
    billItemId: number;

    @ViewColumn(
        {
            name: 'bill_item_guid'
        }
    )
    billItemGuid: string;

    @ViewColumn(
        {
            name: 'bill_item_name'
        }
    )
    billItemName: string;

    @ViewColumn(
        {
            name: 'bill_item_description'
        }
    )
    billItemDescription: string;

    // bill_item_date
    @ViewColumn(
        {
            name: 'bill_item_date'
        }
    )
    billItemDate: string;

    @ViewColumn(
        {
            name: 'doc_id'
        }
    )
    docId: number;

    @ViewColumn(
        {
            name: 'bill_rate_id'
        }
    )
    billRateId: number;

    @ViewColumn(
        {
            name: 'bill_unit_id'
        }
    )
    billUnitId: number;

    @ViewColumn(
        {
            name: 'bill_type_id'
        }
    )
    billTypeId: number;

    @ViewColumn(
        {
            name: 'bill_id'
        }
    )
    billId: number;

    @ViewColumn(
        {
            name: 'bill_rate_amount'
        }
    )
    billRateAmount: number;

    @ViewColumn(
        {
            name: 'bill_rate_short'
        }
    )
    billRateShort: number;

    @ViewColumn(
        {
            name: 'bill_unit_name'
        }
    )
    billUnitName: string;

    @ViewColumn(
        {
            name: 'bill_unit_short'
        }
    )
    billUnitShort: string;

    @ViewColumn(
        {
            name: 'bill_unit_rate'
        }
    )
    billUnitRate: string;

    @ViewColumn(
        {
            name: 'client_id'
        }
    )
    clientId: number;

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
            name: 'physical_location'
        }
    )
    physicalLocation: string;

    @ViewColumn(
        {
            name: 'email'
        }
    )
    email: string;

    @ViewColumn(
        {
            name: 'units'
        }
    )
    units: number;

    @ViewColumn(
        {
            name: 'cost'
        }
    )
    cost: number;

}