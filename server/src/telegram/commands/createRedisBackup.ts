/*external modules*/
import { Middleware } from 'telegraf';
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
/*other*/
import {logger} from "../../logger";
import {redis} from "../../db/redis";

export const createRedisBackup: Middleware<TTelegrafContext> = async (ctx) => {
    try {
        const result = await redis.save()

        if(result === 'OK') {
            await ctx.reply('Бэкап успешно создан.')
        } else {
            await ctx.reply('Ошибка при создании бэкапа.')
        }
    } catch (e) {
        await ctx.reply('Ошибка.')
        logger.error('Error create backup redis', e)
    }
}