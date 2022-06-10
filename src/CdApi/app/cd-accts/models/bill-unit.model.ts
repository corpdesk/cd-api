import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'bill_unit',
        synchronize: false
    }
)
export class BillUnitModel {
    @PrimaryGeneratedColumn(
        {
            name: 'bill_unit_id'
        }
    )
    billUnitId: number;

    @Column({
        name: 'bill_unit_guid',
    })
    billUnitGuid: string;

    @Column(
        {
            name: 'bill_unit_name',
        }
    )
    billUnitName: string;

    @Column(
        {
            name: 'bill_unit_short',
        }
    )
    billUnitShort: string;

    @Column(
        {
            name: 'bill_unit_description',
        }
    )
    billUnitDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'bill_unit_rate',
        }
    )
    billUnitRate: number;
}
