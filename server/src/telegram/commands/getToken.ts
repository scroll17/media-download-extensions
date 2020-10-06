import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";

export const getToken: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.reply('GET TOKEN')
}