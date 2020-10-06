import { Middleware } from 'telegraf';
import {TTelegrafContext} from "../index";

export const checkValidUserId: Middleware<TTelegrafContext> = async (ctx, next) => {
    if(process.env.VALID_TELEGRAM_IDS.includes(ctx.from!.id)) {
        await next()
    } else {
        await ctx.reply('Нет доступа.')
    }
}
