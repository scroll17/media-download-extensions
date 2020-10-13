/*external modules*/
import {Job} from 'bull';
import axios from 'axios'
import fs from 'fs'
import _ from 'lodash';
import moment from 'moment'
/*DB*/
import {mainDB} from "../../db";
import {File, FileType} from "../../db/types/file";
import {Photo} from "../../db/types/photo";
import {Video} from "../../db/types/video";
import {Story} from "../../db/types/story";
/*models*/
import {VideoModel} from "../../db/models/video";
import {StoryModel} from "../../db/models/story";
import {PhotoModel} from "../../db/models/photo";
import {FileModel} from "../../db/models/file";
import {UserModel} from "../../db/models/user";
/*telegram*/
import {bot} from "../../telegram";
import {approveButtons} from "../../telegram/buttons";
/*other*/
import {Constants} from "../../constants";
import {logger} from '../../logger';
import {setEnv} from "../../env";

export type DownloadFileOptions = {
    desiredTime: string;
    userId: string;
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

    const {
        imgUrl,
        caption,
        videoUrl,
        userId
    } = job.data;

    await mainDB.getClientTransaction(async client => {
        let photo: Photo | undefined;
        let video: Video & { imgFilePath: string } | undefined;
        let story: Story & { imgFilePath: string } | undefined;

        switch (job.data.type) {
            case FileType.Photo: {
                const imgFileName = Date.now().toString();

                const imgFilePath = PhotoModel.getFilePath(imgFileName);
                await downloadFile(imgUrl, imgFilePath)

                photo = await PhotoModel.create.exec(
                    client, {
                        fileName: imgFileName,
                        caption
                    }
                )
                if(!photo) throw new Error(`photo not created`)

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

                const localVideo = await VideoModel.create.exec(
                    client,
                    {
                        imageId: photo.id,
                        fileName: videoFileName,
                        caption
                    }
                )
                if(!localVideo) throw new Error(`video not created`)

                video = {
                    ...localVideo,
                    imgFilePath
                }

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

                    _.set(storyData, 'videoId', video.id)
                } else {
                    _.set(storyData, 'imageId', photo.id)
                }

                const localStory = await StoryModel.create.exec(client, storyData)
                if(!localStory) throw new Error(`story not created`)

                story = {
                    ...localStory,
                    imgFilePath
                }

                break
            }
        }

        const fileData: FileModel.create.TArgs = {
            ..._.pick(job.data, ['type']),
            desiredTime: moment(job.data.desiredTime, Constants.DBDateTime).toDate(),
            userId: Number(userId),
            photoId: photo?.id,
            videoId: video?.id,
            storyId: story?.id
        }
        const file = await FileModel.create.exec(client, fileData);
        if(!file) throw new Error(`file mot created`);

        let filePath: string | undefined;
        if(photo) {
            filePath = PhotoModel.getFilePath(photo.fileName)
        } else {
            filePath = (video && video.imgFilePath) || (story && story.imgFilePath)
        }

        const mainUser = (await UserModel.findById.exec(client, { userId: Number(userId) }))!

        const instagramMembers = setEnv.VALID_TELEGRAM_IDS;

        const messageIdSet: File['messageIds'] = {};
        await Promise.all(
            _.map(instagramMembers, async memberId => {
                const user = memberId === mainUser.telegramId
                    ? mainUser
                    : await UserModel.findByTGId.exec(client, { telegramId: memberId })
                if(!user) return

                const result = await bot.telegram.sendPhoto(
                    user.chatId,
                    {
                        source: filePath!
                    },
                    {
                        caption: `"${mainUser.name}" хочет опубликовать (${job.data.type})`,
                        ...approveButtons(file.id),
                        disable_web_page_preview: undefined
                    }
                )

                messageIdSet[memberId] = {
                    messageId: result.message_id
                }
            })
        )

        await FileModel.update.exec(
            client,
            {
                id: file.id,
                data: {
                    messageIds: messageIdSet
                }
            }
        )
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

            if (_.get(err, 'code') === "EEXIST") {
                reject("File already exists");
            } else {
                fs.unlink(filePath, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}