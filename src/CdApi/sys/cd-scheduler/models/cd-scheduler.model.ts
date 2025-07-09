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

// src/CdCli/sys/cd-scheduler/models/cd-scheduler.model.ts


@Entity()
export class Scheduler {

    @PrimaryGeneratedColumn()
    comm_id?: number;

    @Column({
        length: 36,
        default: uuidv4()
    })
    comm_guid?: string;

    @Column(
        'varchar',
        {
            length: 50,
            nullable: true
        }
    )
    comm_name: string;

}



// export interface CdSchedulerDescriptor extends BaseDescriptor {
//   targetModule: string;             // E.g. "dev-descriptor", "workflow", "reporting"
//   targetService: string;            // E.g. "CICdRunnerService"
//   targetMethod: string;             // Method to be invoked (could be a workflow, report, etc.)
//   schedule: ScheduleConfig;         // Time config for execution
//   metadata?: Record<string, any>;   // Any additional data
//   transitions?: Record<string, TransitionRule[]>; // Flow transitions (if any)
//   retry?: RetryConfig;
//   timeout?: number;
//   enabled?: boolean;
// }

// export interface ScheduleConfig {
//   isRecurring?: boolean;
//   cron?: string;                // e.g. "0 0 * * *"
//   intervalMs?: number;          // e.g. 3600000 for 1h
//   runOnceAt?: string;           // ISO timestamp
//   window?: ExecutionWindow;     // Define when it can run (optional)
//   repeatUntil?: string;         // End date (ISO) for recurrence
//   skipIfMissed?: boolean;
//   catchUp?: boolean;
// }

