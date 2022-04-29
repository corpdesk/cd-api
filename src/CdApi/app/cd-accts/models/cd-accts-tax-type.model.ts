import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_tax_type',
        synchronize: false
    }
)
export class CdAcctsTaxTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_tax_type_id'
        }
    )
    cdAcctsTaxTypeId: number;

    @Column({
        name: 'cd_accts_tax_type_guid',
    })
    cdAcctsTaxTypeGuid: string;

    @Column(
        {
            name: 'cd_accts_tax_type_name',
        }
    )
    cdAcctsTaxTypeName: string;

    @Column(
        {
            name: 'cd_accts_tax_type_description',
        }
    )
    cdAcctsTaxTypeDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

}
