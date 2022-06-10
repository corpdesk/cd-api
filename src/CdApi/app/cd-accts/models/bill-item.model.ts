import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'bill_item',
        synchronize: false
    }
)
export class BillItemModel {
    @PrimaryGeneratedColumn(
        {
            name: 'bill_item_id'
        }
    )
    billItemId: number;

    @Column({
        name: 'bill_item_guid',
    })
    billItemGuid: string;

    @Column({
        name: 'bill_item_date',
    })
    billItemDate: string;

    @Column(
        {
            name: 'bill_item_name',
        }
    )
    billItemName: string;

    @Column(
        {
            name: 'bill_item_description',
        }
    )
    billItemDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'bill_rate_id',
        }
    )
    billRateId: number;

    @Column(
        {
            name: 'bill_unit_id',
        }
    )
    billUnitId: number;

    @Column(
        {
            name: 'bill_type_id',
        }
    )
    billItemTypeId: number;

    @Column({
        name: 'bill_id',
    })
    billId: number;

    @Column({
        name: 'bill_guid',
    })
    billGuid: string;

    @Column({
        name: 'units',
    })
    units: number;
}
