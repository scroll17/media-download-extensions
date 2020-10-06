import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";

export const scheduler: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.reply('SCHEDULER')
}