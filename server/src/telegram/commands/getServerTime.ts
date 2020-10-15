/*external modules*/
import { Middleware } from 'telegraf';
import moment from 'moment'
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
/*other*/
import {Constants} from "../../constants";

export const getServerTime: Middleware<TTelegrafContext> = async (ctx) => {
    return await ctx.reply(moment().format(Constants.DBDateTime))
}