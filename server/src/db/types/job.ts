import {sql} from "../sql";
import {QueueNameList} from "../../jobs";

export const JOB_TABLE = 'Job';
export const $JobTable = sql.table(JOB_TABLE);

export enum JobStatus {
    Completed = 'Completed',
    Waiting = 'Waiting',
    Active = 'Active',
    Failed = 'Failed',
    Removed = 'Removed',
    Undefined = 'Undefined'
}

export interface Job<TData = Record<string, any>> {
    id: number;
    name: QueueNameList | string;
    status: JobStatus;

    data: Record<string, any>;
    error?: string

    externalId?: string;

    createdAt: Date;
    updatedAt: Date;
}
