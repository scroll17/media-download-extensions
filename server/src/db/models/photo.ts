/*external modules*/
import path from "path";
import {IgApiClient, MediaRepositoryConfigureResponseRootObject, PostingPhotoOptions} from "instagram-private-api";
import {promises as fs} from "fs";
/*DB*/
import {sql} from "../sql";
import {$PhotoTable, Photo} from "../types/photo";
/*other*/
import { TFunction } from '@server/types';
import {logger} from "../../logger";

export namespace PhotoModel {
    const mainDir = path.resolve(__dirname, '../../../', 'media');
    export const imagesDir = path.resolve(mainDir, 'images');

    export function getFilePath(fileName: string) {
        return path.resolve(imagesDir, fileName)
    }

    export namespace create {
        export type TArgs = Omit<Photo, 'id'>
        export type TReturn = Photo;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$PhotoTable} (
                        "fileName",
                        "caption",
                        "usertags",
                        "location"
                    ) VALUES (
                        ${args.fileName},
                        ${args.caption},
                        ${args.usertags && JSON.stringify(args.usertags)},
                        ${args.location && JSON.stringify(args.location)}
                    )
                `
            );

            return findById.exec(client, { photoId: lastID })
        }
    }

    export namespace findById {
        export type TArgs = { photoId: number }
        export type TReturn = Photo;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const photo = await client.get<Photo>(
                sql`
                    SELECT * 
                    FROM ${$PhotoTable}
                    WHERE "id" = ${args.photoId}
                `
            )

            return photo
        }
    }

    export namespace publish {
        export type TArgs = {
            ig: IgApiClient
            photoId: number
        }
        export type TReturn = MediaRepositoryConfigureResponseRootObject;
        export const exec: TFunction.ReturnRequired<TArgs, TReturn> = async (client, args) => {
            const { ig, photoId } = args;

            logger.debug('--- PUBLISH PHOTO ---')

            const photo = await findById.exec(client, { photoId })
            if(!photo) throw new Error(`photo not found`)

            const imagePath = getFilePath(photo.fileName)
            const file = await fs.readFile(imagePath)

            const opts: PostingPhotoOptions = {
                file,
                caption: photo.caption
            }

            if(typeof photo.usertags === 'string') {
                opts.usertags = JSON.parse(photo.usertags)
            }
            if(typeof photo.location === 'string') {
                opts.location = JSON.parse(photo.location)
            }

            const publishResult = await ig.publish.photo(opts);

            logger.debug(`--- PHOTO PUBLISHED---`)

            return publishResult
        }
    }
}