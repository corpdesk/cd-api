import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity(
    {
        name: 'cd_accts_payment_type',
        synchronize: false
    }
)
export class CdAcctsPaymentTypeModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_accts_payment_type_id'
        }
    )
    cdAcctsPaymentTypeId: number;

    @Column({
        name: 'cd_accts_payment_type_guid',
    })
    cdAcctsPaymentTypeGuid: string;

    @Column(
        {
            name: 'cd_accts_payment_type_name',
        }
    )
    cdAcctsPaymentTypeName: string;

    @Column(
        {
            name: 'cd_accts_payment_type_description',
        }
    )
    cdAcctsPaymentTypeDescription?: string;

    @Column(
        {
            name: 'doc_id',
        }
    )
    docId: number;

}
