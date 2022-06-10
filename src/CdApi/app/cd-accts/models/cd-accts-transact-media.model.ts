import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_transact_media',
        synchronize: false
    }
)
export class CdAcctsTransactMediaModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_transact_media_id'
        }
    )
    cdAcctsTransactMediaId: number;

    @Column({
        name: 'cd_accts_transact_media_guid',
    })
    cdAcctsTransactMediaGuid: string;

    @Column(
        {
            name: 'cd_accts_transact_media_name',
        }
    )
    cdAcctsTransactMediaName: string;

    @Column(
        {
            name: 'cd_accts_transact_media_description',
        }
    )
    cdAcctsTransactMediaDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

    // cdAcctsTransactMediaTypeId
    @Column(
        {
            name: 'cd_accts_transact_media_type_id',
        }
    )
    cdAcctsTransactMediaTypeId: number;

    
}
