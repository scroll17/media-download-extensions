/*external modules*/
/*telegram*/
import {TTelegrafContext} from "../index";
/*DB*/
/*models*/
import {FileModel} from "../../db/models/file";
import {PhotoModel} from "../../db/models/photo";
import {VideoModel} from "../../db/models/video";
import {StoryModel} from "../../db/models/story";
import {FileType} from "../../db/types/file";
/*other*/

type TGetContent = (ctx: TTelegrafContext, fileId: number) => Promise<unknown>

export const sendFileContent: TGetContent = async (ctx, fileId) => {
    const client = ctx.db.main;

    const file = await FileModel.findById.exec(
        client,
        {
            fileId: Number(fileId)
        }
    )
    if(!file) return await ctx.reply('Публикация не найдена.')

    switch (file.type) {
        case FileType.Photo: {
            const photo = await PhotoModel.findById.exec(
                client,
                {
                    photoId: file.photoId!
                }
            )
            if(!photo) return await ctx.reply('Фотография не найдена.')

            const filePath = PhotoModel.getFilePath(photo.fileName)

            await ctx.replyWithPhoto(
                {
                    source: filePath
                },
                {
                    caption: file.type
                }
            )
            break;
        }
        case FileType.Video: {
            const video = await VideoModel.findById.exec(
                client,
                {
                    videoId: file.videoId!
                }
            )
            if(!video) return await ctx.reply('Видео не найдено.')

            const filePath = VideoModel.getFilePath(video.fileName)

            await ctx.replyWithVideo(
                {
                    source: filePath
                },
                {
                    caption: file.type
                }
            )
            break;
        }
        case FileType.Story: {
            const story = await StoryModel.findById.exec(
                client,
                {
                    storyId: file.storyId!
                }
            )
            if(!story) return await ctx.reply('История не найдена.')

            let filePath: string
            if('videoId' in story && story.videoId) {
                const video = await StoryModel.getVideo.exec(
                    client,
                    {
                        storyId: story.id
                    }
                )
                if(!video) return await ctx.reply('Видео для истории не найдено.')

                filePath = VideoModel.getFilePath(video.fileName)
            } else {
                const photo = await StoryModel.getPhoto.exec(
                    client,
                    {
                        storyId: story.id
                    }
                )
                if(!photo) return await ctx.reply('Фотография для истории не найдена.')

                filePath = PhotoModel.getFilePath(photo.fileName)
            }

            await ctx.replyWithVideo(
                {
                    source: filePath
                },
                {
                    caption: file.type
                }
            )
            break;
        }
    }
}