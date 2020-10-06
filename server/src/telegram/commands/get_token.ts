import {Middleware} from "telegraf";
import {TContext} from "../index";

export const get_token: Middleware<TContext> = async (ctx) => {
    await ctx.reply('GET TOKEN')
}