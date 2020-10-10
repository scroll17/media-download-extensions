/*external modules*/
import {Job} from 'bull';
import axios from 'axios'
import fs from 'fs'
import _ from 'lodash';
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
/*instagram*/
import { ig } from '../../instagram/ig'
/*other*/
import {logger} from '../../logger';
import {setEnv} from "../../env";

export type PublishContentOptions = {
    fileId: number;
}

export async function publishContentConsumer(
    job: Job<PublishContentOptions>
) {
    const scope = 'publish-content';

    logger.info(`Started: ${scope}.`, job.data);

    await mainDB.getClient(async client => {
        const file = await FileModel.findById.exec(
            client,
            {
                fileId: job.data.fileId
            }
        )
        if(!file) throw new Error('file not found');

        const messagesSet: File['messageIds'] = JSON.parse(file.messageIds as unknown as string);

        try {
            switch (file.type) {
                case FileType.Photo: {
                    await PhotoModel.publish.exec(
                        client,
                        {
                            photoId: file.photoId!,
                            ig
                        }
                    )

                    break;
                }
                case FileType.Video: {
                    await VideoModel.publish.exec(
                        client,
                        {
                            videoId: file.videoId!,
                            ig
                        }
                    )

                    break;
                }
                case FileType.Story: {
                    await StoryModel.publish.exec(
                        client,
                        {
                            storyId: file.storyId!,
                            ig
                        }
                    )

                    break;
                }
            }

            await Promise.all(
                _.map(messagesSet, async (value, memberId) => {
                    const user = await UserModel.findByTGId.exec(
                        client,
                        {
                            telegramId: Number(memberId)
                        }
                    )
                    if(!user) throw new Error('user not found');

                    await bot.telegram.sendMessage(
                        user.chatId,
                        'Опубликовано.',
                        {
                            reply_to_message_id: value.messageId
                        }
                    )
                })
            )
        } catch (e) {
            console.log(e);

            await Promise.all(
                _.map(messagesSet, async (value, memberId) => {
                    const user = await UserModel.findByTGId.exec(
                        client,
                        {
                            telegramId: Number(memberId)
                        }
                    )
                    if(!user) throw new Error('user not found');

                    await bot.telegram.sendMessage(
                        user.chatId,
                        'Не опубликовано.',
                        {
                            reply_to_message_id: value.messageId
                        }
                    )
                    await bot.telegram.sendMessage(
                        user.chatId,
                        'Ошибка:\n ' + e.stack,
                    )
                })
            )

            throw e
        }
    })

    logger.info(`Completed: ${scope}.`, job.data);
}