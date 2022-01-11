import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    OneToMany
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';
import { BaseService } from '../../base/base.service';
import { DocModel } from './doc.model';

// SELECT company_id, company_type_id, directory_category_id, company_name, postal_address, phone, e_mail, website, physical_location, city, country, area_of_specialization, logo, fax, password, trusted, doc_id, city_id, county_id, company_guid, company_description, parent_id, consumer_id
// FROM cd1213.company;



@Entity(
    {
        name: 'company',
        synchronize: false
    }
)
// @CdModel
export class CompanyModel {
    b: BaseService;

    @PrimaryGeneratedColumn(
        {
            name: 'company_id'
        }
    )
    companyId?: number;

    @Column({
        name: 'company_guid',
        length: 40,
    })
    companyGuid: string;

    @Column(
        'varchar',
        {
            name: 'company_name',
            length: 50,
            nullable: true
        }
    )
    companyName: string;

    @Column(
        {
            name: 'company_type_guid',
            default: null
        }
    )
    companyTypeGuid?: number;

    @Column(
        {
            name: 'directory_category_guid',
            default: null
        }
    )
    directoryCategoryGuid?: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    @Column(
        {
            name: 'company_enabled',
            default: null
        }
    )
    companyEnabled?: boolean;

    @Column(
        'varchar',
        {
            name: 'postal_address',
            length: 160,
            nullable: true
        }
    )
    postalAddress: string;

    @Column(
        'varchar',
        {
            name: 'phone',
            length: 20,
            nullable: true
        }
    )
    phone: string;

    @Column(
        'varchar',
        {
            name: 'mobile',
            length: 20,
            nullable: true
        }
    )
    mobile: string;

    @Column(
        'varchar',
        {
            name: 'email',
            length: 30,
            nullable: true
        }
    )
    email: string;

    @Column(
        'varchar',
        {
            name: 'physical_location',
            length: 20,
            nullable: true
        }
    )
    physicalLocation: string;

    @Column(
        'varchar',
        {
            name: 'city',
            length: 20,
            nullable: true
        }
    )
    city: string;

    @Column(
        'varchar',
        {
            name: 'country',
            length: 20,
            nullable: true
        }
    )
    country: string;

    @Column(
        'varchar',
        {
            name: 'logo',
            length: 20,
            nullable: true
        }
    )
    logo: string;

    @Column(
        'varchar',
        {
            name: 'city_guid',
            length: 20,
            nullable: true
        }
    )
    cityGuid: string;

    @Column({
        name: 'company_description',
        length: 300,
    })
    company_description?: string;

    @Column({
        name: 'parent_guid',
        length: 40,
    })
    parentGuid?: string;

    @Column({
        name: 'consumer_guid',
        length: 40,
    })
    consumerGuid?: string;

    @Column({
        name: 'search_tags',
        length: 255,
    })
    searchTags?: string;

}
