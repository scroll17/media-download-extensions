/*external modules*/
import {Job} from 'bull';
import axios from 'axios'
import fs from 'fs'
/*DB*/
import {mainDB} from "../../db";
import {FileType} from "../../db/types/file";
/*models*/
import {VideoModel} from "../../db/models/video";
import {StoryModel} from "../../db/models/story";
import {PhotoModel} from "../../db/models/photo";
/*other*/
import {logger} from '../../logger';

export type DownloadFileOptions = {
    delayed: number;
    imgUrl: string;
    caption?: string;
    type: FileType.Photo | FileType.Story;
} & {
    type: FileType.Video;
    videoUrl: string;
}

export async function downloadFileConsumer(
    job: Job<DownloadFileOptions>
) {
    const scope = 'download-file';

    logger.info(`Started: ${scope}.`, job.data);

    const { type, imgUrl, caption, videoUrl } = job.data;

    await mainDB.getClientTransaction(async client => {
        switch (type) {
            case FileType.Photo: {
                const imgFileName = Date.now().toString();

                const imgFilePath = PhotoModel.getFilePath(imgFileName);
                await downloadFile(imgUrl, imgFilePath)

                const photo = await PhotoModel.create.exec(
                    client, {
                        fileName: imgFileName,
                        caption
                    }
                )
                // TODO _

                break;
            }
            case FileType.Video: {
                const imgFileName = Date.now().toString();
                const videoFileName = Date.now().toString();

                const imgFilePath = PhotoModel.getFilePath(imgFileName);
                await downloadFile(imgUrl, imgFilePath)

                const photo = await PhotoModel.create.exec(
                    client, {
                        fileName: imgFileName
                    }
                )
                if(!photo) throw new Error(`photo not created`)

                const videoFilePath = VideoModel.getFilePath(videoFileName);
                await downloadFile(videoUrl, videoFilePath)

                const video = await VideoModel.create.exec(
                    client,
                    {
                        imageId: photo.id,
                        fileName: videoFileName,
                        caption
                    }
                )
                // TODO _

                break;
            }
            case FileType.Story: {
                const imgFileName = Date.now().toString();
                const videoFileName = Date.now().toString();

                const storyData: StoryModel.create.TArgs = {
                    caption
                } as any;

                const imgFilePath = PhotoModel.getFilePath(imgFileName);
                await downloadFile(imgUrl, imgFilePath)

                const photo = await PhotoModel.create.exec(
                    client, {
                        fileName: imgFileName
                    }
                )
                if(!photo) throw new Error(`photo not created`)

                if(videoUrl) {
                    const videoFilePath = VideoModel.getFilePath(videoFileName);
                    await downloadFile(videoUrl, videoFilePath)

                    const video = await VideoModel.create.exec(
                        client,
                        {
                            imageId: photo.id,
                            fileName: videoFileName
                        }
                    )
                    if(!video) throw new Error(`video not created`)

                    storyData.videoId = video.id;
                } else {
                    storyData.imageId = photo.id;
                }


                const story = await StoryModel.create.exec(client, storyData)

                // TODO _

                break
            }
        }
    })

    logger.info(`Completed: ${scope}.`, job.data);
}

async function downloadFile(url: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath, { flags: "wx" });

        axios.get(url, { responseType: 'stream' })
            .then(response => {
                if (response.status === 200) {
                    response.data.pipe(file);
                } else {
                    file.close();
                    fs.unlink(filePath, () => {}); // Delete temp file
                    reject(`Instagram server error: ${response.status}: ${response.statusText}`);
                }
            });


        file.on("finish", () => {
            resolve(filePath);
        });

        file.on("error", err => {
            file.close();

            if (err.code === "EEXIST") {
                reject("File already exists");
            } else {
                fs.unlink(filePath, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}