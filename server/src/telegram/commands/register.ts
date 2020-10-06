import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";

export const register: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.reply('REGISTER')
}