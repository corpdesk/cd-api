import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';

@Entity(
    {
        name: 'consumer_resource',
        synchronize: false
    }
)
// @CdModel
export class ConsumerResourceModel {

    @PrimaryGeneratedColumn(
        {
            name: 'consumer_resource_id'
        }
    )
    consumerResourceId?: number;

    @Column({
        name: 'consumer_resource_guid',
        length: 36,
        default: uuidv4()
    })
    consumerResourceGuid?: string;

    @Column({
        name: 'doc_id',
        default: null
    })
    docId?: number;

    @Column({
        name: 'cd_obj_type_id',
        default: null
    })
    cdObjTypeId?: number;

    @Column({
        name: 'enabled',
        default: null
    })
    enabled?: boolean;

    @Column({
        name: 'consumer_id',
        default: null
    })
    consumerId?: number;

    @Column({
        name: 'cd_obj_id',
        default: null
    })
    cdObjId?: number;

}
