import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { IQuery } from '../../../sys/base/IBase';


// `cd_geo_track`.`cd_geo_track_id`,
//     `cd_geo_track`.`lat`,
//     `cd_geo_track`.`long`,
//     `cd_geo_track`.`place_id`,
//     `cd_geo_track`.`timestampMs`,
//     `cd_geo_track`.`accuracy`,
//     `cd_geo_track`.`cd_obj_type_id`,
//     `cd_geo_track`.`cd_obj_id`,
//     `cd_geo_track`.`t`,
//     `cd_geo_track`.`mitch_id`,
//     `cd_geo_track`.`un`,
//     `cd_geo_track`.`doc_id`,
//     `cd_geo_track`.`cd_geo_track_guid`

@Entity(
    {
        name: 'cd_geo_track',
        synchronize: false
    }
)
export class CdGeoTrackModel {
    @PrimaryGeneratedColumn(
        {
            name: 'cd_geo_track_id'
        }
    )
    cdGeoTrackId?: number;

    @Column({
        name: 'cd_geo_track_guid',
        length: 36,
        default: uuidv4()
    })
    cdGeoTrackGuid?: string;

    @Column(
        {
            name: 'cd_geo_track_name',
            length: 50,
            nullable: true
        }
    )
    cdGeoTrackName: string;

    @Column(
        {
            name: 'cd_geo_track_description',
            length: 60,
            default: null
        })
    cdGeoTrackDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    @Column(
        {
            name: 'lat',
            default: null
        }
    )
    lat?: number;

    @Column(
        {
            name: 'long',
            default: null
        }
    )
    long?: number;

    @Column(
        {
            name: 'place_id',
            default: null
        }
    )
    placeId?: number;

    // timestampMs

    @Column(
        {
            name: 'timestampMs'
        }
    )
    timestampMs: string;

    // accuracy
    @Column(
        {
            name: 'accuracy',
            default: null
        }
    )
    accuracy?: number;

    // cd_obj_type_id
    @Column(
        {
            name: 'cd_obj_type_id',
            default: null
        }
    )
    cdObjType_id?: number;

    // cd_obj_id
    @Column(
        {
            name: 'cd_obj_id',
            default: null
        }
    )
    cdObjId?: number;

    // t
    @Column(
        {
            name: 't'
        }
    )
    t: string;

    // mitch_id
    @Column(
        {
            name: 'mitch_id',
            default: null
        }
    )
    mitchId?: number;

    // un
    @Column(
        {
            name: 'un'
        }
    )
    un: string;
    
}
