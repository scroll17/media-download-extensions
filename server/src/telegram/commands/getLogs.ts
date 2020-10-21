/*external modules*/
import { Middleware } from 'telegraf';
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
/*other*/
import {Constants} from "../../constants";

export const getLogs: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.replyWithDocument({
        source: Constants.LogPath
    })
}