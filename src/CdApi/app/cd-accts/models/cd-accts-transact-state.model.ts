import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_transact-state',
        synchronize: false
    }
)
export class CdAcctsTransactStateModel {

    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_transact-state_id'
        }
    )

    cdAcctsTransactStateId: number;

    @Column({
        name: 'cd_accts_transact-state_guid',
    })
    
    cdAcctsTransactStateGuid: string;

    @Column(
        {
            name: 'cd_accts_transact-state_name',
        }
    )
    cdAcctsTransactStateName: string;

    @Column(
        {
            name: 'cd_accts_transact-state_description',
        }
    )
    cdAcctsTransactStateDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    @Column(
        {
            name: 'cd_accts_ext_invoice_id',
        }
    )
    cdAcctsExtInvoiceId: number;

    @Column(
        {
            name: 'cd_accts_transact-state_type_id',
        }
    )
    cdAcctsTransactStateTypeId: number;
}
