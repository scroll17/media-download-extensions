/*external modules*/
/*DB*/
/*other*/
import {sql} from "../sql";

export const JOB_TABLE = 'Job';
export const $JobTable = sql.table(JOB_TABLE);

export enum JobStatus {
    'Completed' = 'Completed',
    'Waiting' = 'Waiting',
    'Active' = 'Active',
    'Failed' = 'Failed'
}

export interface Job<TData extends object = {}> {
    id: string;
    type: string;
    status: JobStatus;
    data: Record<string, any>;
    opts: Record<string, any>;
    externalId: string;
    createdAt: Date;
    updatedAt: Date;
}
