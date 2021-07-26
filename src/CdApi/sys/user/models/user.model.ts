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

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    user_id?: number;

    @Column({
        length: 36,
        default: uuidv4()
    })
    user_guid?: string;

    @Column(
        'varchar',
        {
            length: 50,
            nullable: false
        }
    )
    username: string;

    @Column(
        'char',
        {
            length: 60,
            default: null
        })
    password: string;

    @Column(
        'varchar',
        {
            length: 60,
            unique: true,
            nullable: false
        }
    )
    @IsEmail()
    email: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    co_id?: number;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    doc_id?: number;

    @Column(
        {
            default: null
        }
    )
    mobile?: string;

    @Column(
        {
            default: null
        }
    )
    gender?: number;

    @Column(
        {
            default: null
        }
    )
    // @IsDate()
    dateobirth?: Date;

    @Column(
        {
            default: null
        }
    )
    postal_addr?: string;

    @Column(
        {
            default: null
        }
    )
    fname: string;

    @Column(
        {
            default: null
        }
    )
    mname?: string;

    @Column(
        {
            default: null
        }
    )
    lname: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    national_id?: number;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    passport_id?: number;

    @Column(
        {
            default: null
        }
    )
    trusted?: boolean;

    @Column(
        'char',
        {
            length: 5,
            default: null
        }
    )
    zipCode?: string;

    @Column(
        {
            length: 36,
            default: uuidv4()
        }
    )
    activationKey?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    professionID?: number;

    @Column(
        'text',
        {
            default: null
        }
    )
    // @IsJSON()
    avatar?: JSON;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    theme_id?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    signature_id?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    timezone_id?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    lang_id?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    designation_id?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    company_id?: string;

    @Column(
        {
            default: null
        }
    )
    // @IsInt()
    user_type_id?: string;

    @UpdateDateColumn()
    updated_at?: Date;

    @Column(
        'datetime',
        {
            default: null
        }
    )
    created_at?: string;

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
    done_avatar?: boolean;

    @BeforeInsert()
    async setPassword(password: string) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(password || this.password, salt);
    }

    @BeforeInsert()
    async Now() {
        const now = new Date();
        const date = await moment(
            now,
            'ddd MMM DD YYYY HH:mm:ss'
        );
        this.created_at = await date.format('YYYY-MM-DD HH:mm:ss'); // convert to mysql date
    }

    // @BeforeInsert()
    // validateEmail(email: string) {
    //     const re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    //     const isValid: boolean = re.test(String(email).toLowerCase());
    // }

    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
