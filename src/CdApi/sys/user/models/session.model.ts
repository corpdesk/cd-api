import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Generated,
    BeforeInsert,
    BeforeUpdate,
    IsNull,
    Not,
    UpdateDateColumn
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import {
    validate,
    validateOrReject,
    Contains,
    IsInt,
    Length,
    IsEmail,
    IsFQDN,
    IsDate,
    Min,
    Max,
    IsJSON,
} from 'class-validator';

/**
 * SELECT session_id, current_user_id, cd_token, active, ttl, acc_time, start_time, consumer_guid, device_net_id
 * FROM cd1213.`session`;
 */

@Entity({ name: 'session', synchronize: false })
export class SessionModel {

    @PrimaryGeneratedColumn(
        {
            name: 'session_id'
        }
    )
    sessionId?: number;

    @Column(
        {
            name: 'current_user_id',
            default: 1000
        }
    )
    // @IsInt()
    currentUserId: number;

    @Column(
        {
            name: 'cd_token',
            default: null
        }
    )
    cdToken: string;

    @Column(
        {
            name: 'start_time',
            default: null
        }
    )
    // @IsJSON()
    startTime?: string;

    @Column(
        {
            name: 'acc_time',
            default: null
        }
    )
    // @IsInt()
    accTime?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    ttl?: number;

    @Column(
        {
            default: null
        }
    )
    active?: boolean;

    @Column(
        'json',
        {
            name: 'device_net_id',
            default: null
        }
    )
    // @IsInt()
    deviceNetId?: JSON;

    // @BeforeInsert()
    // async setPassword() {
    //     this.password = await bcrypt.hash(this.password, 10);
    // }

    @BeforeInsert()
    async Now() {
        const now = new Date();
        const date = await moment(
            now,
            'ddd MMM DD YYYY HH:mm:ss'
        );
        this.startTime = await date.format('YYYY-MM-DD HH:mm:ss'); // convert to mysql date
    }

    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
