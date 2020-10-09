import { Middleware } from 'telegraf';
import {TTelegrafContext} from "../index";
import {setEnv} from "../../env";

export const checkValidUserId: Middleware<TTelegrafContext> = async (ctx, next) => {
    if(setEnv.VALID_TELEGRAM_IDS.includes(ctx.from!.id)) {
        await next()
    } else {
        await ctx.reply('Нет доступа.')
    }
}
