import { Middleware } from 'telegraf';
import {TContext} from "../index";

export const checkValidUserId: Middleware<TContext> = async (ctx, next) => {
    if(process.env.VALID_TELEGRAM_IDS.includes(ctx.from!.id)) {
        await next()
    } else {
        await ctx.reply('Нет доступа.')
    }
}
