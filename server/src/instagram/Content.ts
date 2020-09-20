/*external modules*/
import path from "path";
import {promises as fs} from "fs";
import {IgApiClient, PostingPhotoOptions, PostingStoryVideoOptions, PostingVideoOptions} from "instagram-private-api";
/*other*/

export namespace Content {
    export namespace Media {
        const mainDir = path.resolve(__dirname, '../../', 'media');

        export const imagesDir = path.resolve(mainDir, 'images');
        export function getImagePath(imageName: string) {
            return path.resolve(imagesDir, imageName)
        }

        export const videoDir = path.resolve(mainDir, 'videos');
        export function getVideoPath(videoName: string) {
            return path.resolve(videoDir, videoName)
        }

        export const storyDir = path.resolve(mainDir, 'stories');
        export function getStoryPath(storyName: string) {
            return path.resolve(storyDir, storyName)
        }
    }

    export namespace Publish {
        export async function photo(fileName: string, ig: IgApiClient, options: Omit<PostingPhotoOptions, 'file'> = {}) {
            const imagePath = Media.getImagePath(fileName);

            console.debug(`--- publish image: "${fileName}" ---`)
            const publishResult = await ig.publish.photo({
                file: await fs.readFile(imagePath),
                ...options
            });
            console.debug(`--- image: "${fileName}" published ---`)

            return publishResult
        }

        export async function video(fileName: string, ig: IgApiClient, options: Omit<PostingVideoOptions, 'video' | 'coverImage'> = {}) {
            const coverImagePath = Media.getImagePath(fileName);
            const videoPath = Media.getVideoPath(fileName);

            console.debug(`--- publish video: "${fileName}" ---`)
            const publishResult = await ig.publish.video({
                video: await fs.readFile(videoPath),
                coverImage: await fs.readFile(coverImagePath),
                ...options
            });
            console.debug(`--- video: "${fileName}" published ---`)

            return publishResult
        }

        export async function story(fileName: string, ig: IgApiClient, options: Omit<PostingStoryVideoOptions, 'video' | 'coverImage'> = {}) {
            const storyPath = Media.getStoryPath(fileName);
            const coverImagePath = Media.getImagePath('test.jpg');

            console.debug(`--- publish story: "${fileName}" ---`)
            await ig.publish.story({
                video: await fs.readFile(storyPath),
                coverImage: await fs.readFile(coverImagePath)
            });
            console.debug(`--- story: "${fileName}" published ---`)
        }
    }
}