import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_account_type',
        synchronize: false
    }
)
export class CdAcctsAccountTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_account_type_id'
        }
    )
    cdAcctsAccountTypeId: number;

    @Column({
        name: 'cd_accts_account_type_guid',
    })
    cdAcctsAccountTypeGuid: string;

    @Column(
        {
            name: 'cd_accts_account_type_name',
        }
    )
    cdAcctsAccountTypeName: string;

    @Column(
        {
            name: 'cd_accts_account_type_description',
        }
    )
    cdAcctsAccountTypeDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

}
