import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_expenditure_type',
        synchronize: false
    }
)
export class CdAcctsExpenditureTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_expenditure_type_id'
        }
    )
    cdAcctsExpenditureTypeId: number;

    @Column({
        name: 'cd_accts_expenditure_type_guid',
    })
    cdAcctsExpenditureTypeGuid: string;

    @Column(
        {
            name: 'cd_accts_expenditure_type_name',
        }
    )
    cdAcctsExpenditureTypeName: string;

    @Column(
        {
            name: 'cd_accts_expenditure_type_description',
        }
    )
    cdAcctsExpenditureTypeDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

}
