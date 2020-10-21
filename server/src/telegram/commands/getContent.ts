/*external modules*/
import { Middleware } from 'telegraf';
/*telegram*/
import {TTelegrafContext} from "../index";
import {parseButtonData} from "../buttons";
import {getInlineKeyboard} from "../utils/getInlineKeyboard";
/*DB*/
/*models*/
import { sendFileContent } from "../utils/sendFileContent";
/*other*/

export const getContent: Middleware<TTelegrafContext> = async (ctx) => {
    const result = getInlineKeyboard(ctx.message, 'хочет опубликовать')

    if(result[0] === 0) {
        const [, message] = result
        if(message) await ctx.reply(message)

        return
    } else {
        const [ approveButtonObject ] = result[1][0]
        const callbackData = approveButtonObject.callback_data

        const { value: fileId } = parseButtonData(callbackData!)

        await sendFileContent(
            ctx,
            Number(fileId)
        )
    }
}