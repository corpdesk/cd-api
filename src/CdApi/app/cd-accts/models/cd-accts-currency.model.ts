import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
@Entity(
    {
        name: 'cd_accts_currency',
        synchronize: false
    }
)
export class CdAcctsCurrencyModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_currency_id'
        }
    )
    cdAcctsCurrencyId: number;

    @Column({
        name: 'cd_accts_currency_guid',
    })
    cdAcctsCurrencyGuid: string;

    @Column(
        {
            name: 'cd_accts_currency_name',
        }
    )
    cdAcctsCurrencyName: string;

    @Column(
        {
            name: 'cd_accts_currency_description',
        }
    )
    cdAcctsCurrencyDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'cd_accts_currency_type_id',
        }
    )
    cdAcctsCurrencyTypeId: number;

    
}
