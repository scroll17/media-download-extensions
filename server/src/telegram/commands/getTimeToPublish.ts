/*external modules*/
import { Middleware } from 'telegraf';
import _ from 'lodash'
import moment from 'moment'
/*telegram*/
import {TTelegrafContext} from "../index";
import {parseButtonData} from "../buttons";
/*models*/
import {FileModel} from "../../db/models/file";
/*other*/
import {Constants} from "../../constants";

export const getTimeToPublish: Middleware<TTelegrafContext> = async (ctx) => {
    if(_.isEmpty(_.get(ctx, ['message', 'reply_to_message']))) {
        return await ctx.reply('Запись не имеет данных о публикациию')
    } else {
        const replyMessage = _.get(ctx, ['message', 'reply_to_message']);

        if(_.get(replyMessage, ['from', 'username']) !== 'insta_publisher_bot') return
        if(!_.get(replyMessage, 'caption', '').includes('хочет опубликовать')) return

        const [ approveButtonObject ] = _.get(replyMessage, ['reply_markup', 'inline_keyboard', 0])

        const { value: fileId } = parseButtonData(approveButtonObject.callback_data)

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