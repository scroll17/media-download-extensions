/*external modules*/
import _ from 'lodash'
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
                const externalJob = await queue.add(args.data, args.options ?? {});

                job = await update.exec(
                    client,
                    {
                        id: job.id,
                        data: {
                            externalId: String(externalJob.id)
                        }
                    }
                );
            }

            return job
        }
    }

    export namespace update {
        export type TArgs = (
            Pick<Job, 'id'> | Required<Pick<Job, 'externalId'>>
        ) & {
            data: Partial<Pick<Job, 'status' | 'error' | 'externalId'>> & {
                jobData?: Job['data'];
            }
        }
        export type TReturn = Job
        export const exec: TFunction.Update<TArgs, TReturn> = async (client, args) => {
            let findByCondition;
            if('id' in args) {
                findByCondition = sql`"id" = ${args.id}`
            } else {
                findByCondition = sql`"externalId" = ${args.externalId}`
            }

            const { data } = args;
            await client.run(
                sql`
                    UPDATE ${$JobTable}
                    SET "status" = ${sql.setNewValue("status", data.status)},
                        "data" = ${sql.setNewValue("data", data.jobData && JSON.stringify(data.jobData))},
                        "error" = ${sql.setNewValue("error", data.error && String(data.error), true)},
                        "externalId" = ${sql.setNewValue("externalId", data.externalId, true)}
                    WHERE ${findByCondition}
                      AND ("status" != ${JobStatus.Completed} OR ${data.status} != ${JobStatus.Active})
                `
            )

            let job;
            if('id' in args) {
                job = await findById.exec(client, { jobId: args.id });
            } else {
                job = await findBy.exec(client, { externalId: args.externalId });
            }
            if(!job) return

            const queue = jobWorker.getQueue(job.name);
            if (queue) {
                const queueJob = await queue.getJob(job.externalId!);
                await queueJob?.update(
                    typeof job.data === "string"
                        ? JSON.parse(job.data)
                        : job.data
                );
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
                    const queueJob = await queue.getJob(job.externalId!);
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
        export type TArgs = Partial<Pick<Job, 'name' | 'status' | 'externalId'>>
        export type TReturn = Job;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            if(_.isEmpty(args)) return

            let statusWhereBlock = sql.raw`true`;
            if(args.status) {
                statusWhereBlock = sql`"status" = ${args.status}`;
            }

            let nameWhereBlock = sql.raw`true`
            if(args.name) {
                nameWhereBlock = sql`"name" = ${args.name}`;
            }

            let externalIdWhereBlock = sql.raw`true`
            if(args.externalId) {
                externalIdWhereBlock = sql`"externalId" = ${args.externalId}`;
            }

            const job = await client.get<Job>(
                sql`
                    SELECT *
                    FROM ${$JobTable}
                    WHERE ${nameWhereBlock}
                      AND ${statusWhereBlock}
                      AND ${externalIdWhereBlock}
                `
            )

            return job
        }
    }
}