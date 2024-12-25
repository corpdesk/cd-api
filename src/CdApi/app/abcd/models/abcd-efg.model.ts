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
import { AbcdEfgViewModel } from './abcd-efg-view.model';

@Entity(
    {
        name: 'abcd_efg',
        synchronize: false
    }
)
// @CdModel
export class AbcdEfgModel {

    @PrimaryGeneratedColumn(
        {
            name: 'abcd_efg_id'
        }
    )
    abcdEfgId?: number;

    @Column({
        name: 'abcd_efg_guid',
        length: 40,
        default: uuidv4()
    })
    abcdEfgGuid?: string;

    @Column(
        {
            name: 'abcd_efg_type_id',
            nullable: true
        }
    )
    abcdEfgTypeId: number;

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
            name: 'abcd_efg_enabled',
            nullable: true
        }
    )
    abcdEfgEnabled: boolean;

    @Column(
        {
            name: 'abcd_id',
            nullable: true
        }
    )
    abcdId: number;

    @Column(
        {
            name: 'abcd_active',
            nullable: true
        }
    )
    abcdActive: boolean;

    @Column(
        {
            name: 'abcd_efg_profile',
            nullable: true
        }
    )
    abcdEfgProfile: string;

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

// export interface IAbcdEfgProfile {
//     userProfile: IUserProfile;
//     // abcdEfgFieldPermissions: IMemberProfileAccess; // accessibility of personal data
//     abcdEfgship: { 
//         memberData: AbcdEfgViewModel[];
//         acl: MemberMeta[]; // affilication with various SACCOS(privilage related data in various SACCOS)
//     }
// }

export interface IAbcdEfgProfile extends IUserProfile {
    abcdEfgship: { 
        memberData: AbcdEfgViewModel[];
        acl: MemberMeta[]; // affiliation with various SACCOS (privilege-related data in various SACCOS)
    };
}

export interface MemberMeta {
    abcdId: number|null,
    abcdActive: boolean,
    abcdRole: IAbcdRole;
    aclRole?: IAclRole
    abcdEfgData?: AbcdEfgViewModel[]; // affilication with various SACCOS(selection of abcd_efg_view where the current user appears)
}

// Define a type that excludes 'abcdEfgship' from IAbcdEfgProfile
export type IUserProfileOnly = Omit<IAbcdEfgProfile, 'abcdEfgship'>;

/**
 * Note that abcd membership prrofile is an extension of user profile
 * Note that the first item is userProfile and by default has a value imported from userProfileDefault,
 * On load, date will be set from database.
 * the data below is just a default,
 * details are be managed with 'roles' features
 * 
 */

export const abcdEfgProfileDefault: IAbcdEfgProfile = {
    ...userProfileDefault,  // Copy all properties from userProfileDefault
    abcdEfgship:
    {
        memberData: [
            {
                userName: "",
                fName: "",
                lName: "",
            }
        ],
        acl: [
            {
                abcdId: -1,
                abcdActive: false,
                abcdRole: [
                    { scope: AbcdsAclScope.COOPS_GUEST, geoLocationId: null },
                ],
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
}

/**
 * Example usage
 * const role: AbcdsRoles = AbcdsRoles.COOPS_GUEST;
 * console.log(role); // Output: 11
 */

// Enum for ACL Scope
export const enum AbcdsAclScope {
    COOPS_GUEST = 11,
    COOPS_USER = 12,
    COOPS_MEMBER = 13,
    COOPS_SACCO_ADMIN = 14,
    COOPS_REGIONAL_ADMIN = 15,
    COOPS_NATIONAL_ADMIN = 16,
    COOPS_CONTINENTAL_ADMIN = 17,
    COOPS_GLOBAL_ADMIN = 18
}

// Interface for IAbcdAcl
export interface IAbcdAcl {
    scope: AbcdsAclScope;
    geoLocationId: number | null;
}


/**
 * Interface for AbcdScope, which is an array of AbcdAcl
 * Usage:
 * const abcdScope: AbcdScope = [
  { scope: AbcdsAclScope.COOPS_GUEST, geoLocationId: null },
  { scope: AbcdsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 123 },
  { scope: AbcdsAclScope.COOPS_GLOBAL_ADMIN, geoLocationId: 456 }
];

console.log(abcdScope);
 */
export interface IAbcdRole extends Array<IAbcdAcl> { }


