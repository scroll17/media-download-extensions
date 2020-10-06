import {Middleware} from "telegraf";
import {TContext} from "../index";

export const register: Middleware<TContext> = async (ctx) => {
    await ctx.reply('REGISTER')
}