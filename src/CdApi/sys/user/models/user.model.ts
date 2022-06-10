import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Generated,
    BeforeInsert,
    BeforeUpdate,
    IsNull,
    Not,
    UpdateDateColumn,
    OneToMany
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
import { CdModel, IsUnique } from '../../base/decorators/validators';
import { UniqueOnDatabase } from '../../base/decorators/UniqueValidation';
import { BaseService } from '../../base/base.service';
import { DocModel } from '../../moduleman/models/doc.model';

@Entity(
    {
        name: 'user',
        synchronize: false
    }
)
// @CdModel
export class UserModel {
    b: BaseService;

    @PrimaryGeneratedColumn(
        {
            name: 'user_id'
        }
    )
    userId?: number;

    @Column({
        name: 'user_guid',
        length: 36,
        default: uuidv4()
    })
    userGuid?: string;

    @Column(
        'varchar',
        {
            name: 'user_name',
            length: 50,
            nullable: true
        }
    )
    userName: string;

    @Column(
        'char',
        {
            name: 'password',
            length: 60,
            default: null
        })
    password: string;

    @Column(
        'varchar',
        {
            length: 60,
            unique: true,
            nullable: true
        }
    )

    @IsEmail()
    email: string;

    @Column(
        {
            name: 'company_id',
            default: null
        }
    )
    // @IsInt()
    companyId?: number;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    // @IsInt()
    docId?: number;

    @Column(
        {
            name: 'mobile',
            default: null
        }
    )
    mobile?: string;

    @Column(
        {
            name: 'gender',
            default: null
        }
    )
    gender?: number;

    @Column(
        {
            name: 'birth_date',
            default: null
        }
    )
    // @IsDate()
    birthDate?: Date;

    @Column(
        {
            name: 'postal_addr',
            default: null
        }
    )
    postalAddr?: string;

    @Column(
        {
            name: 'f_name',
            default: null
        }
    )
    fName: string;

    @Column(
        {
            name: 'm_name',
            default: null
        }
    )
    mName?: string;

    @Column(
        {
            name: 'l_name',
            default: null
        }
    )
    lName: string;

    @Column(
        {
            name: 'national_id',
            default: null
        }
    )
    // @IsInt()
    nationalId?: number;

    @Column(
        {
            name: 'passport_id',
            default: null
        }
    )
    // @IsInt()
    passportId?: number;

    @Column(
        {
            name: 'user_enabled',
            default: null
        }
    )
    userEnabled?: boolean;

    @Column(
        'char',
        {
            name: 'zip_code',
            length: 5,
            default: null
        }
    )
    zipCode?: string;

    @Column(
        {
            name: 'activation_key',
            length: 36,
            default: uuidv4()
        }
    )
    activationKey?: string;

    @Column(
        {
            name: 'user_type_id',
            default: null
        }
    )
    // @IsInt()
    userTypeId?: string;

    @OneToMany(type => DocModel, doc => doc.user) // note: we will create user property in the Docs class
    docs: DocModel[];

    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
