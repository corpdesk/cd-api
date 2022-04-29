import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
// SELECT cd_accts_transact_type_id, cd_accts_transact_type_guid, cd_accts_transact_type_name, cd_accts_transact_type_description, doc_id, credit, debit
// FROM cd1213.cd_accts_transact_type;

@Entity(
    {
        name: 'cd_accts_transact-type',
        synchronize: false
    }
)
export class CdAcctsTransactTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_transact-type_id'
        }
    )
    cdAcctsTransactTypeId: number;

    @Column({
        name: 'cd_accts_transact-type_guid',
    })
    cdAcctsTransactTypeGuid: string;

    @Column(
        {
            name: 'cd_accts_transact-type_name',
        }
    )
    cdAcctsTransactTypeName: string;

    @Column(
        {
            name: 'cd_accts_transact-type_description',
        }
    )
    cdAcctsTransactTypeDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'credit',
        }
    )
    Credit: boolean;

    @Column(
        {
            name: 'debit',
        }
    )
    Debit: boolean;
}
