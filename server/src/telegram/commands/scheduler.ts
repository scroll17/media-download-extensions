import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";
import {FileModel} from "../../db/models/file";
import _ from 'lodash'
import moment from 'moment'

export const scheduler: Middleware<TTelegrafContext> = async (ctx) => {
    const schedules = await FileModel.getSchedule.exec(ctx.db.main, { limit: 30 })

    const parseFormat = 'YYYY-DD-MM HH:mm:ss';
    const result = _.chain(schedules)
        .groupBy(schedule => moment(schedule.desiredTime, parseFormat).format('YYYY-MM-DD'))
        .map((value, key) => {
            const dataInString =_.chain(value)
                .map(v => {
                    const time = moment(v.desiredTime, parseFormat);

                    return {
                        valueOf: time.valueOf(),
                        time: time.format('HH:mm'),
                        type: v.type,
                        name: v.name
                    }
                })
                .sortBy('valueOf')
                .map(v => `${v.time}    ${v.name}     "${v.type}"`)
                .join('\n')
                .value();

            return `[ ${key} ]` + '\n' + dataInString
        })
        .join('\n\n')
        .value()

    await ctx.reply(result)
}