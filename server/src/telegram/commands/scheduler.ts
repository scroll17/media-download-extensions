/*external modules*/
import { Middleware } from 'telegraf';
import _ from 'lodash'
import moment from 'moment'
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
import {FileModel} from "../../db/models/file";
/*other*/
import {Constants} from "../../constants";

export const scheduler: Middleware<TTelegrafContext> = async (ctx) => {
    const schedules = await FileModel.getSchedule.exec(ctx.db.main, { limit: 30 })

    const result = _.chain(schedules)
        .groupBy(schedule => moment(schedule.desiredTime, Constants.DBDateTime).format('YYYY-MM-DD'))
        .map((value, key) => {
            const dataInString =_.chain(value)
                .map(v => {
                    const time = moment(v.desiredTime, Constants.DBDateTime);

                    return {
                        valueOf: time.valueOf(),
                        time: time.format('HH:mm'),
                        type: v.type,
                        name: v.name,
                        published: Boolean(v.published)
                    }
                })
                .sortBy('valueOf')
                .map(v => {
                    const published = v.published ? '+' : '-'
                    return `${v.time}    ${v.name}     ${published}    "${v.type}"`
                })
                .join('\n')
                .value();

            return `[ ${key} ]` + '\n' + dataInString
        })
        .join('\n\n')
        .value()

    await ctx.reply(_.isEmpty(result) ? 'Пусто' : result)
}