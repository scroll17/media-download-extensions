/*external modules*/
import { Middleware } from 'telegraf';
import moment from 'moment'
/*telegram*/
import {TTelegrafContext} from "../index";
import {parseButtonData} from "../buttons";
import {getInlineKeyboard} from "../utils/getInlineKeyboard";
/*models*/
import {FileModel} from "../../db/models/file";
/*other*/
import {Constants} from "../../constants";

export const getTimeToPublish: Middleware<TTelegrafContext> = async (ctx) => {
    const result = getInlineKeyboard(ctx.message, 'хочет опубликовать')

    if(result[0] === 0) {
        const [, message] = result
        if(message) await ctx.reply(message)

        return
    } else {
        const [ approveButtonObject ] = result[1][0]
        const callbackData = approveButtonObject.callback_data

        const { value: fileId } = parseButtonData(callbackData!)
        const file = await FileModel.findById.exec(
            ctx.db.main,
            {
                fileId: Number(fileId)
            }
        )
        if(!file) return await ctx.reply('Публикация не найдена.')

        if(file.published === 1) {
            return await  ctx.reply('Уже опубликовано.')
        } else {
            const desiredTime = moment(file.desiredTime, Constants.DBDateTime).valueOf();
            const timeNow = moment().valueOf()

            const delay = desiredTime - timeNow
            if(delay <= 0 ) return await ctx.reply('Время вышло.')

            const sec = delay / 1000
            const min = sec / 60
            const hour = min / 60
            const day = hour / 24

            const message = `${sec.toFixed(0)} сек. / ${min.toFixed(0)} мин. / ${hour.toFixed(1)} часов / ${day.toFixed(0)} дней`
            return await ctx.reply(`Публикация через: \n${message}`)
        }
    }
}