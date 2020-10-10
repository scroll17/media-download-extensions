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
import _ from "lodash";

export namespace VideoModel {
    const mainDir = path.resolve(__dirname, '../../../', 'media');
    export const videoDir = path.resolve(mainDir, 'videos');

    export function getFilePath(fileName: string) {
        return path.resolve(videoDir, fileName)
    }

    export namespace create {
        export type TArgs = Omit<Video, 'id' | 'caption'> & Partial<Pick<Video, 'caption'>>
        export type TReturn = Video;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const usertags = args.usertags && JSON.stringify(args.usertags)
            const location = args.location && JSON.stringify(args.location)

            const captionField = sql.insertField("caption", args.caption)
            const usertagsField = sql.insertField("usertags", usertags)
            const locationField = sql.insertField("location", location)

            const [cComm, uComm, lComm] = [
                sql.comm(args.caption),
                sql.comm(usertags),
                sql.comm(location)
            ]

            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$VideoTable} (
                        "imageId",                        
                        "fileName"
                            ${cComm}
                        ${captionField}
                            ${uComm}
                        ${usertagsField}
                            ${lComm}
                        ${locationField}
                    ) VALUES (
                        ${args.imageId},
                        ${args.fileName}
                            ${cComm}
                        ${sql.insertFieldValue(args.caption)}
                            ${uComm}
                        ${sql.insertFieldValue(usertags)}
                            ${lComm}
                        ${sql.insertFieldValue(location)}
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
                        INNER JOIN ${$PhotoTable} photo ON photo."id" = video."imageId"
                    WHERE video."id" = ${args.videoId}
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
                const parse = JSON.parse(video.usertags)
                if(!_.isEmpty(parse)) opts.usertags = parse
            }
            if(typeof video.location === 'string') {
                const parse = JSON.parse(video.location)
                if(!_.isEmpty(parse)) opts.location = parse
            }

            const publishResult = await ig.publish.video(opts);

            logger.debug(`--- VIDEO PUBLISHED---`)

            return publishResult
        }
    }
}