/*external modules*/
import moment from 'moment'
/*DB*/
import {sql} from "../sql";
import {$FileTable, File, FileType} from "../types/file";
import {$UserTable} from "../types/user";
import {$JobTable, Job} from "../types/job";
/*other*/
import { TFunction, TArray } from '@server/types';
import {Constants} from "../../constants";

export namespace FileModel {
    export namespace create {
        export type TArgs = Omit<File, 'id' | 'published' | 'approved' | 'messageIds' | 'createdAt' | 'updatedAt'>
        export type TReturn = File;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { videoId, storyId, photoId } = args;

            const videoIdField = sql.insertField("videoId", videoId)
            const storyIdField = sql.insertField("storyId", storyId)
            const photoIdField = sql.insertField("photoId", photoId)

            const [vComm, sComm, pComm] = [
                sql.comm(videoId),
                sql.comm(storyId),
                sql.comm(photoId)
            ]

            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$FileTable} (
                        "userId",
                        "type",
                        "desiredTime"
                            ${vComm}
                        ${videoIdField}
                            ${sComm}        
                        ${storyIdField}
                            ${pComm}
                        ${photoIdField}                                   
                    ) VALUES (
                        ${args.userId},
                        ${args.type},
                        ${moment(args.desiredTime).format(Constants.DBDateTime)}
                            ${vComm}
                        ${sql.insertFieldValue(args.videoId)}
                            ${sComm}
                        ${sql.insertFieldValue(args.storyId)}
                            ${pComm}
                        ${sql.insertFieldValue(args.photoId)}
                    )
                `
            );

            return findById.exec(client, { fileId: lastID });
        }
    }

    export namespace update {
        export type TArgs = {
            id: File['id'],
            data: Partial<Pick<File, 'published' | 'approved' | 'messageIds' | 'jobId'>>
        }
        export type TReturn = File
        export const exec: TFunction.Update<TArgs, TReturn> = async (client, args) => {
            const { data } = args;

            await client.run(
                sql`
                    UPDATE ${$FileTable}
                    SET "published" = ${sql.setNewValue("published", data.published)},
                        "approved" = ${sql.setNewValue("approved", data.approved)},
                        "messageIds" = ${sql.setNewValue("messageIds", data.messageIds && JSON.stringify(data.messageIds))},
                        "jobId" = ${sql.setNewValue("jobId", data.jobId)}
                    WHERE "id" = ${args.id}
                `
            )

            return findById.exec(client, { fileId: args.id });
        }
    }

    export namespace findById {
        export type TArgs = { fileId: number }
        export type TReturn = File;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const file = await client.get<File>(
                sql`
                    SELECT *
                    FROM ${$FileTable}
                    WHERE "id" = ${args.fileId}
                `
            )

            return file
        }
    }

    export namespace getJob {
        export type TArgs = { fileId: number }
        export type TReturn = Job;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const job = await client.get<Job>(
                sql`
                    SELECT jobs.*
                    FROM ${$FileTable} files
                        INNER JOIN ${$JobTable} jobs ON jobs."id" = files."jobId" 
                    WHERE files."id" = ${args.fileId}
                `
            )

            return job
        }
    }

    export namespace getSchedule {
        export type TArgs = { limit: number }
        export type TReturn = Array<{
            desiredTime: string;
            type: FileType;
            name: string;
            published: number
        }>;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const schedules = await client.all<TArray.SingleType<TReturn>>(
                sql`
                    SELECT file."desiredTime", file."type", user."name", file."published"
                    FROM ${$FileTable} file
                        INNER JOIN ${$UserTable} user ON user."id" = file."userId"
                    WHERE file."approved" = 1
                      AND date(file."desiredTime") >= date(datetime('now', 'localtime'))
                    LIMIT ${args.limit};
                `
            )

            return schedules
        }
    }
}