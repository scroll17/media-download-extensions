/*external modules*/
/*DB*/
/*other*/
import {sql} from "../sql";

export const JOB_TABLE = 'Job';
export const $JobTable = sql.table(JOB_TABLE);

export enum JobStatus {
    Completed = 'Completed',
    Waiting = 'Waiting',
    Active = 'Active',
    Failed = 'Failed',
    Removed = 'Removed'
}

export interface Job<TData = Record<string, any>> {
    id: number;
    name: string;
    status: JobStatus;

    data: Record<string, any>;
    error?: Record<string, any>;

    externalId: string;

    createdAt: Date;
    updatedAt: Date;
}
