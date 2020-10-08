/*external modules*/
import {JobOptions} from "bull";
/*DB*/
import {sql} from "../sql";
import {$JobTable, Job, JobStatus} from "../types/job";
/*other*/
import { TFunction } from '@server/types';
import jobWorker from '../../jobs'

export namespace JobModel {
    export namespace create {
        export type TArgs = Pick<Job, 'name' | 'data'> & { options?: JobOptions }
        export type TReturn = Job;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$JobTable} (
                        "name",
                        "data"
                    ) VALUES (
                        ${args.name},
                        ${JSON.stringify(args.data)}
                    )
                `
            );

            let job = await findById.exec(client, { jobId: lastID });
            if(!job) throw new Error('Job not found')

            const queue = jobWorker.getQueue(job.name);

            if (queue) {
                const externalJob = await queue.add(job.data, args.options ?? {});

                job = await update.exec(
                    client,
                    {
                        id: job.id,
                        externalId: String(externalJob.id)
                    }
                );
            }

            return job
        }
    }

    export namespace update {
        export type TArgs = Pick<Job, 'id'> & Partial<Pick<Job, 'status' | 'data' | 'error' | 'externalId'>>
        export type TReturn = Job
        export const exec: TFunction.Update<TArgs, TReturn> = async (client, args) => {
            await client.run(
                sql`
                    UPDATE ${$JobTable}
                    SET "status" = ${sql.setNewValue("status", args.status)},
                        "data" = ${sql.setNewValue("data", args.data && JSON.stringify(args.data))},
                        "error" = ${sql.setNewValue("error", args.error, true)},
                        "externalId" = ${sql.setNewValue("externalId", args.externalId)}
                    WHERE "id" = ${args.id}
                      AND ("status" != ${JobStatus.Completed} OR ${args.status} != ${JobStatus.Active})
                `
            )

            const job = await findById.exec(client, { jobId: args.id });

            if(!job) return

            const queue = jobWorker.getQueue(job.name);

            if (queue) {
                const queueJob = await queue.getJob(job.externalId);
                await queueJob?.update(job.data);
            }

            return job
        }
    }

    export namespace remove {
        export type TArgs = { jobId: number }
        export type TReturn = Job;
        export const exec: TFunction.Delete<TArgs, TReturn> = async (client, args) => {
            await client.run(
                sql`
                    UPDATE ${$JobTable}
                    SET "status" = '${JobStatus.Removed}'
                    WHERE "id" = ${args.jobId}
                `
            )

            const job = await findById.exec(client, { jobId: args.jobId });

            if (job) {
                const queue = jobWorker.getQueue(job.name);

                if (queue) {
                    const queueJob = await queue.getJob(job.externalId);
                    await queueJob?.remove();
                }
            }

            return job
        }
    }

    export namespace findById {
        export type TArgs = { jobId: number }
        export type TReturn = Job;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const job = await client.get<Job>(
                sql`
                    SELECT * 
                    FROM ${$JobTable}
                    WHERE "id" = ${args.jobId}
                `
            )

            return job
        }
    }

    export namespace findBy {
        export type TArgs = Pick<Job, 'name'> & Partial<Pick<Job, 'status'>>
        export type TReturn = Job;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            let statusWhereBlock = sql.raw`true`;
            if(args.status) {
                statusWhereBlock = sql`"status" = ${args.status}`;
            }

            const job = await client.get<Job>(
                sql`
                    SELECT * 
                    FROM ${$JobTable}
                    WHERE "name" = ${args.name}
                      AND ${statusWhereBlock}
                `
            )

            return job
        }
    }
}