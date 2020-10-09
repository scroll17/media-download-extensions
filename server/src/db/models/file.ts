/*external modules*/
/*DB*/
import {sql} from "../sql";
import {$FileTable, File} from "../types/file";
/*other*/
import { TFunction } from '@server/types';

export namespace FileModel {
    export namespace create {
        export type TArgs = Omit<File, 'id' | 'published' | 'approved' | 'messageId' | 'createdAt' | 'updatedAt'>
        export type TReturn = File;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$FileTable} (
                        "userId",
                        "type",
                        "desiredTime",
                        "videoId",                       
                        "storyId",                       
                        "photoId"                       
                    ) VALUES (
                        ${args.userId},
                        ${args.type},
                        ${args.desiredTime.toString()},
                        ${args.videoId},
                        ${args.storyId},
                        ${args.photoId}
                    )
                `
            );

            return findById.exec(client, { jobId: lastID });
        }
    }

    export namespace update {
        export type TArgs = {
            id: File['id'],
            data: Partial<Pick<File, 'published' | 'approved' | 'messageId'>>
        }
        export type TReturn = File
        export const exec: TFunction.Update<TArgs, TReturn> = async (client, args) => {
            const { data } = args;

            await client.run(
                sql`
                    UPDATE ${$FileTable}
                    SET "published" = ${sql.setNewValue("published", data.published)},
                        "approved" = ${sql.setNewValue("approved", data.approved)},
                        "messageId" = ${sql.setNewValue("messageId", data.messageId)}
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
}