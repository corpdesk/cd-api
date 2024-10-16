import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';
import { IUserProfile, userProfileDefault } from '../../../sys/user/models/user.model';
import { IAclRole } from '../../../sys/base/IBase';
import { CoopMemberViewModel } from './coop-member-view.model';

// `coop_member`.`coop_member_id`,
// `coop_member`.`coop_member_guid`,
// `coop_member`.`coop_member_type_id`,
// `coop_member`.`user_id`,
// `coop_member`.`doc_id`,
// `coop_member`.`coop_member_enabled`,
// `coop_member`.`coop_id`



@Entity(
    {
        name: 'coop_member',
        synchronize: false
    }
)
// @CdModel
export class CoopMemberModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_member_id'
        }
    )
    coopMemberId?: number;

    @Column({
        name: 'coop_member_guid',
        length: 40,
        default: uuidv4()
    })
    coopMemberGuid?: string;

    @Column(
        {
            name: 'coop_member_type_id',
            nullable: true
        }
    )
    coopMemberTypeId: number;

    @Column(
        {
            name: 'user_id',
            nullable: true
        }
    )
    userId: number;

    @Column(
        {
            name: 'doc_id',
            nullable: true
        }
    )
    docId: number;

    @Column(
        {
            name: 'coop_member_enabled',
            nullable: true
        }
    )
    coopMemberEnabled: boolean;

    @Column(
        {
            name: 'coop_id',
            nullable: true
        }
    )
    coopId: number;

    @Column(
        {
            name: 'coop_active',
            nullable: true
        }
    )
    coopActive: boolean;

    @Column(
        {
            name: 'coop_member_profile',
            nullable: true
        }
    )
    coopMemberProfile: string;

}

export interface IMemberProfileAccess {
    userPermissions: IProfileMemberAccess[],
    groupPermissions: IProfileGroupAccess[]
}

/**
 * Improved versin should have just one interface and 
 * instead of userId or groupId, cdObjId is applied.
 * This would then allow any object permissions to be set
 * Automation and 'role' concept can then be used to manage permission process
 */
export interface IProfileMemberAccess {
    userId: number,
    hidden: boolean,
    field: string,
    read: boolean,
    write: boolean,
    execute: boolean
}

export interface IProfileGroupAccess {
    groupId: number,
    field: string,
    hidden: boolean,
    read: boolean,
    write: boolean,
    execute: boolean
}

export interface ICoopMemberProfile {
    userProfile: IUserProfile;
    // coopMemberFieldPermissions: IMemberProfileAccess; // accessibility of personal data
    coopMemberData: CoopMemberViewModel[]; // affilication with various SACCOS
    coopMembership?: MemberMeta[];
}

export interface MemberMeta {
    coopId: number,
    coopActive: boolean,
    aclRole: IAclRole
}

/**
 * Note that coop membership prrofile is an extension of user profile
 * Note that the first item is userProfile and by default has a value imported from userProfileDefault,
 * On load, date will be set from database.
 * the data below is just a default,
 * details are be managed with 'roles' features
 * 
 */

export const coopMemberProfileDefault: ICoopMemberProfile = {
    userProfile: userProfileDefault,
    coopMemberData: [
        {
            userName: "",
            fName: "",
            lName: "",
        }
    ],
    coopMembership: [
        {
            coopId: -1,
            coopActive: false,
            /**
             * specified permission setting for given members to specified fields
             */
            aclRole: {
                aclRoleName: "guest",
                permissions: {
                    userPermissions: [
                        {
                            cdObjId: 0,
                            hidden: true,
                            field: "",
                            read: false,
                            write: false,
                            execute: false
                        }
                    ],
                    groupPermissions: [
                        {
                            cdObjId: 0,
                            hidden: true,
                            field: "",
                            read: false,
                            write: false,
                            execute: false
                        }

                    ]
                }
            }
        }
    ]
}


