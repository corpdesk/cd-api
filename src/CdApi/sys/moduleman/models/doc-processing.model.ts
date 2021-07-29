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
 * SELECT sid, device_id, browser_sid, login_time, page_accessed, pg_access_time, sess_expire_time, current_user_id, logout_time, comp_name, browser_fingerprint, log_info, cd_token, active, cookie, `_id`, p_sid, ttl, acc_time_int, acc_time_h, exp_time_int, exp_time_h, valid, start_time_int, start_h, consumer_guid
 * FROM cd1212.`session`;
 */

@Entity({name:'docprocessing', synchronize: false})
export class Session {

    @PrimaryGeneratedColumn()
    sid?: number;

    @Column({
        length: 36,
        default: uuidv4()
    })
    deviceId?: string;

    @Column(
        'varchar',
        {
            length: 50,
            nullable: false
        }
    )
    browserSid: string;

    @Column(
        'char',
        {
            length: 60,
            default: null
        })
    loginTime: string;

    @Column(
        'varchar',
        {
            length: 60,
            unique: true,
            nullable: false
        }
    )
    @IsEmail()
    pageAccessed: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    pgAccessTime?: number;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    currentUserId?: number;

    @Column(
        {
            default: null
        }
    )
    logoutTime?: string;

    @Column(
        {
            default: null
        }
    )
    compName?: number;

    @Column(
        {
            default: null
        }
    )
    // @IsDate()
    browserFingerprint?: Date;

    @Column(
        {
            default: null
        }
    )
    logInfo?: string;

    @Column(
        {
            default: null
        }
    )
    cdToken: string;

    @Column(
        {
            default: null
        }
    )
    active?: string;

    @Column(
        {
            default: null
        }
    )
    cookie: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    pSid?: number;

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
    accTime_int?: boolean;

    @Column(
        'char',
        {
            length: 5,
            default: null
        }
    )
    accTime_h?: string;

    // exp_time_int, exp_time_h, valid, start_time_int, start_h, consumer_guid
    @Column(
        {
            length: 36,
            default: uuidv4()
        }
    )
    expTimeInt?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    valid?: number;

    @Column(
        'text',
        {
            default: null
        }
    )
    // @IsJSON()
    startTimeInt?: JSON;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    startH?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    consumerGuid?: string;

    @UpdateDateColumn()
    updatedAt?: Date;

    @Column(
        'datetime',
        {
            default: null
        }
    )
    createdAt?: string;

    @Column(
        {
            default: null
        }
    )
    temp?: boolean;

    @Column(
        {
            default: null
        }
    )
    doneAvatar?: boolean;

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
        this.createdAt = await date.format('YYYY-MM-DD HH:mm:ss'); // convert to mysql date
    }

    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
