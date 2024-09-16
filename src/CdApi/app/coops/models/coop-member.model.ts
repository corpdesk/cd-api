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
        length: 36,
        default: uuidv4()
    })
    coopMemberGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_guid_parent',
            length: 50,
            nullable: true
        }
    )
    coopStatGuidParent: string;

    @Column(
        'varchar',
        {
            name: 'member_guid',
            length: 50,
            nullable: true
        }
    )
    memberGuid: string;

     @Column(
        {
            name: 'user_id_member',
            nullable: true
        }
    )
    userIdMember: number;

    @Column(
        {
            name: 'doc_id',
            nullable: true
        }
    )
    docId?: number;

    @Column(
        {
            name: 'cd_obj_type_id',
            nullable: true
        }
    )
    cdObjTypeId: number;

    @Column(
        {
            name: 'coop_member_parent_id',
            nullable: true
        }
    )
    coopMemberParentId?: number;

    @Column(
        {
            name: 'coop_member_enabled',
            nullable: true
        }
    )
    coopMemberEnabled: boolean;

    @Column(
        {
            name: 'coop_invitation_id',
            nullable: true
        }
    )
    coopInvitationId?: number;

    @Column(
        'varchar',
        {
            name: 'coop_id_parent',
            length: 50,
            nullable: true
        }
    )
    coopStatIdParent: string;

    @Column(
        'varchar',
        {
            name: 'member_id',
            nullable: true
        }
    )
    memberId?: number;

}
