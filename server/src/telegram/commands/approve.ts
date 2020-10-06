import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";

export const approve: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.reply('APPROVE')
}