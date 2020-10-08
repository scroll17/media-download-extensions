/*external modules*/
import Queue, {JobId, JobOptions} from "bull";
import _ from 'lodash'
/*DB*/
import { sql, mainDB } from "../db";
import {JobStatus} from "../db/types/job";
/*models*/
import {JobModel} from "../db/models/job";
/*other*/

export type SyncQueueOptions = Queue.QueueOptions & {
    syncJobStatus?: boolean;
};

export class SyncQueue<T = any> extends Queue<T> {
    readonly syncJobStatus: boolean = false;
    readonly defaultJobOptions: JobOptions = {};

    constructor(queueName: string, opts: SyncQueueOptions) {
        super(queueName, opts);

        this.defaultJobOptions = opts.defaultJobOptions ?? {};
        if(!_.isUndefined(opts.syncJobStatus)) {
            this.syncJobStatus = opts.syncJobStatus;
        }

        if(this.syncJobStatus) {
            this.on('waiting', async jobId =>
                this.changeJobStatus(jobId, JobStatus.Waiting)
            );
            this.on('active', async job =>
                this.changeJobStatus(job.id, JobStatus.Active)
            );
            this.on('completed', async job =>
                this.changeJobStatus(job.id, JobStatus.Completed)
            );
            this.on('failed', async (job, error) =>
                this.changeJobStatus(job.id, JobStatus.Failed, error)
            );
        }
    }

    async changeJobStatus(jobId: JobId, status: JobStatus, error?: Error) {
       // TODO
        // return mainDB.getClient(client => {
        //     const jobData: JobModel.update.TArgs = {
        //         id: jobId as string,
        //         status: status
        //     };
        //
        //     if(error) _.set(jobData, 'error', error)
        //
        //     return JobModel.update.exec(client, jobData, { sql, events: [] });
        // });
    }
}
