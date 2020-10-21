/*external modules*/
import { Middleware } from 'telegraf';
/*telegram*/
import {TTelegrafContext} from "../index";
import {parseButtonData} from "../buttons";
import {sendFileContent} from "../utils/sendFileContent";
/*DB*/
/*models*/
import {FileModel} from "../../db/models/file";
/*other*/

export const contentAction: Middleware<TTelegrafContext> = async (ctx) => {
    const { value: fileId } = parseButtonData(ctx.callbackQuery?.data!);

    await ctx.db.main.getClient(async client => {
        const file = await FileModel.findById.exec(client, { fileId: Number(fileId) });
        if(!file) return await ctx.reply('Файл не найден.');

        await sendFileContent(ctx, Number(file.id))
    })
}