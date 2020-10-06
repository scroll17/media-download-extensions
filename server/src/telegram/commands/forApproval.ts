import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";

export const forApproval: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.reply('FOR APPROVAL')
}