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
} from "typeorm";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
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
} from "class-validator";

// /**
//  * {
//     startTime: '2021-09-05 20:06:22',
//     cdToken: '9b7064ac-7b61-4e21-8ab3-18b4bc33a1f7',
//     currentUserId: 1003,
//     accTime: '2021-09-05 20:06:22',
//     ttl: 600,
//     active: true,
//     deviceNetId: {
//       client: [Object],
//       os: [Object],
//       device: [Object],
//       bot: null,
//       net: [Object]
//     },
//     consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD'
//   }
//  */

@Entity({ name: "session", synchronize: false })
export class SessionModel {
  @PrimaryGeneratedColumn({
    name: "session_id",
  })
  sessionId?: number;

  @Column({
    name: "current_user_id",
    default: 1000,
  })
  // @IsInt()
  currentUserId: number;

  @Column({
    name: "cd_token",
  })
  cdToken: string;

  @Column({
    name: "start_time",
    default: null,
  })
  // @IsJSON()
  startTime?: string;

  @Column({
    name: "acc_time",
    default: null,
  })
  // @IsInt()
  accTime?: string;

  @Column({
    default: null,
  })
  // @IsInt()
  ttl?: number;

  @Column({
    default: null,
  })
  active?: boolean;

  @Column("json", {
    name: "device_net_id",
    default: null,
  })
  // @IsInt()
  deviceNetId?: JSON;

  // consumer_guid:
  @Column({
    name: "consumer_guid",
    length: 36,
    // default: uuidv4()
  })
  consumerGuid?: string;

  // @BeforeInsert()
  // async Now() {
  //     const now = new Date();
  //     const date = await moment(
  //         now,
  //         'ddd MMM DD YYYY HH:mm:ss'
  //     );
  //     this.startTime = await date.format('YYYY-MM-DD HH:mm:ss'); // convert to mysql date
  // }

  // // HOOKS
  // @BeforeInsert()
  // @BeforeUpdate()
  // async validate() {
  //     await validateOrReject(this);
  // }
}

export const defaultSession: SessionModel = {
  sessionId: -1,
  currentUserId: 1000,
  cdToken: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx",
  startTime: "2000-01-01T01:00:00.000Z",
  accTime: null,
  ttl: 600,
  active: false,
  deviceNetId: null,
  consumerGuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx",
};
