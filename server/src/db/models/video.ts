/*external modules*/
import path from "path";
import {promises as fs} from "fs";
import {IgApiClient, MediaRepositoryConfigureResponseRootObject, PostingVideoOptions} from "instagram-private-api";
/*DB*/
import {sql} from "../sql";
import {$PhotoTable, Photo} from "../types/photo";
import {$VideoTable, Video} from "../types/video";
/*models*/
import { PhotoModel } from "./photo";
/*other*/
import { TFunction } from '@server/types';
import {logger} from "../../logger";

export namespace VideoModel {
    const mainDir = path.resolve(__dirname, '../../../', 'media');
    export const videoDir = path.resolve(mainDir, 'videos');

    export function getFilePath(fileName: string) {
        return path.resolve(videoDir, fileName)
    }

    export namespace create {
        export type TArgs = Omit<Video, 'id'>
        export type TReturn = Video;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$PhotoTable} (
                        "imageId",                        
                        "fileName",
                        "caption",
                        "usertags",
                        "location"
                    ) VALUES (
                        ${args.imageId},
                        ${args.fileName},
                        ${args.caption},
                        ${args.usertags && JSON.stringify(args.usertags)},
                        ${args.location && JSON.stringify(args.location)}
                    )
                `
            );

            return findById.exec(client, { videoId: lastID })
        }
    }

    export namespace findById {
        export type TArgs = { videoId: number }
        export type TReturn = Video;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const video = await client.get<Video>(
                sql`
                    SELECT * 
                    FROM ${$VideoTable}
                    WHERE "id" = ${args.videoId}
                `
            )

            return video
        }
    }

    export namespace getPhoto {
        export type TArgs = { videoId: number }
        export type TReturn = Photo;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const photo = await client.get<Photo>(
                sql`
                    SELECT photo.* 
                    FROM ${$VideoTable} video
                        INNER JOIN "${$PhotoTable}" photo ON photo."id" = video."imageId"
                    WHERE "id" = ${args.videoId}
                `
            )

            return photo
        }
    }

    export namespace publish {
        export type TArgs = {
            ig: IgApiClient
            videoId: number
        }
        export type TReturn = MediaRepositoryConfigureResponseRootObject;
        export const exec: TFunction.ReturnRequired<TArgs, TReturn> = async (client, args) => {
            const { ig, videoId } = args;

            logger.debug('--- PUBLISH VIDEO ---')

            const video = await findById.exec(client, { videoId })
            if(!video) throw new Error(`video not found`)

            const coverImage = await getPhoto.exec(client, { videoId });
            if(!coverImage) throw new Error(`coverImage not found`)

            const videoPath = getFilePath(video.fileName)
            const videoFile = await fs.readFile(videoPath);

            const coverImagePath = PhotoModel.getFilePath(coverImage.fileName);
            const coverImageFile = await fs.readFile(coverImagePath);

            const opts: PostingVideoOptions = {
                video: videoFile,
                coverImage: coverImageFile,
                caption: video.caption
            }

            if(typeof video.usertags === 'string') {
                opts.usertags = JSON.parse(video.usertags)
            }
            if(typeof video.location === 'string') {
                opts.location = JSON.parse(video.location)
            }

            const publishResult = await ig.publish.video(opts);

            logger.debug(`--- VIDEO PUBLISHED---`)

            return publishResult
        }
    }
}