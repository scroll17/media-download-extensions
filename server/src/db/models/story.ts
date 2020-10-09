/*external modules*/
import {promises as fs} from "fs";
import {PostingStoryPhotoOptions, PostingStoryVideoOptions} from "instagram-private-api/dist/types";
import {IgApiClient, MediaRepositoryConfigureResponseRootObject} from "instagram-private-api";
/*DB*/
import {sql} from "../sql";
import {$PhotoTable, Photo} from "../types/photo";
import {$VideoTable, Video} from "../types/video";
import {$StoryTable, Story} from "../types/story";
/*models*/
import {PhotoModel} from "./photo";
import { VideoModel} from "./video";
/*other*/
import { TFunction } from '@server/types';
import {logger} from "../../logger";

export namespace StoryModel {
    export namespace create {
        export type TArgs = Story & { id: never }
        export type TReturn = Story;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const videoId = ('videoId' in args) && args.videoId
            const imageId = ('imageId' in args) && args.imageId

            const captionField = sql.insertField("caption", args.caption)
            const linkField = sql.insertField("link", args.link);

            const [cComm, lComm] = [
                sql.comm(args.caption),
                sql.comm(args.link)
            ]

            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$StoryTable} (
                        "videoId",                        
                        "imageId"
                            ${cComm}
                        ${captionField}
                            ${lComm}
                        ${linkField}
                    ) VALUES (
                        ${videoId},
                        ${imageId}
                            ${cComm}
                        ${sql.insertFieldValue(args.caption)}
                            ${lComm}
                        ${sql.insertFieldValue(args.link)}
                    )
                `
            );

            return findById.exec(client, { storyId: lastID })
        }
    }

    export namespace findById {
        export type TArgs = { storyId: number }
        export type TReturn = Story;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const story = await client.get<Story>(
                sql`
                    SELECT * 
                    FROM ${$StoryTable}
                    WHERE "id" = ${args.storyId}
                `
            )

            return story
        }
    }

    export namespace getPhoto {
        export type TArgs = { storyId: number }
        export type TReturn = Photo;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const photo = await client.get<Photo>(
                sql`
                    SELECT photo.* 
                    FROM ${$StoryTable} story
                        INNER JOIN "${$PhotoTable}" photo ON photo."id" = story."imageId"
                    WHERE "id" = ${args.storyId}
                `
            )

            return photo
        }
    }

    export namespace getVideo {
        export type TArgs = { storyId: number }
        export type TReturn = Video;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const video = await client.get<Video>(
                sql`
                    SELECT video.* 
                    FROM ${$StoryTable} story
                        INNER JOIN "${$VideoTable}" video ON video."id" = story."videoId"
                    WHERE "id" = ${args.storyId}
                `
            )

            return video
        }
    }

    export namespace publish {
        export type TArgs = {
            ig: IgApiClient
            storyId: number
        }
        export type TReturn = MediaRepositoryConfigureResponseRootObject;
        export const exec: TFunction.ReturnRequired<TArgs, TReturn> = async (client, args) => {
            const { ig, storyId } = args;

            logger.debug('--- PUBLISH STORY ---')

            const story = await findById.exec(client, { storyId });
            if(!story) throw new Error('story not found');

            let opts: PostingStoryPhotoOptions | PostingStoryVideoOptions = {} as any

            if(story.caption) {
                opts.caption = story.caption;
            }
            if(story.link) {
                opts.link = story.link;
            }

            if('videoId' in story) {
                const video = await getVideo.exec(client, { storyId })
                if(!video) throw new Error(`video not found`)

                const coverImage = await VideoModel.getPhoto.exec(
                    client, {
                        videoId: video.id
                    }
                );
                if(!coverImage) throw new Error(`coverImage not found`);

                const videoPath = VideoModel.getFilePath(video.fileName)
                const videoFile = await fs.readFile(videoPath);

                const coverImagePath = PhotoModel.getFilePath(coverImage.fileName);
                const coverImageFile = await fs.readFile(coverImagePath);

                (opts as PostingStoryVideoOptions).video = videoFile;
                (opts as PostingStoryVideoOptions).coverImage = coverImageFile;
            } else {
                const photo = await getPhoto.exec(client, { storyId });
                if(!photo) throw new Error(`photo not found`);

                const imagePath = PhotoModel.getFilePath(photo.fileName);

                (opts as PostingStoryPhotoOptions).file = await fs.readFile(imagePath);
            }

            const publishResult = await ig.publish.story(opts);

            logger.debug(`--- STORY PUBLISHED---`)

            return publishResult
        }
    }
}