import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_transact-media',
        synchronize: false
    }
)
export class CdAcctsTransactMediaModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_transact-media_id'
        }
    )
    cdAcctsTransactMediaId: number;

    @Column({
        name: 'cd_accts_transact-media_guid',
    })
    cdAcctsTransactMediaGuid: string;

    @Column(
        {
            name: 'cd_accts_transact-media_name',
        }
    )
    cdAcctsTransactMediaName: string;

    @Column(
        {
            name: 'cd_accts_transact-media_description',
        }
    )
    cdAcctsTransactMediaDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    
}
