import {Middleware} from "telegraf";
import {TContext} from "../index";

export const scheduler: Middleware<TContext> = async (ctx) => {
    await ctx.reply('SCHEDULER')
}