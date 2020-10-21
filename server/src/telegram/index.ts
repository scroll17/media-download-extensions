/*external modules*/
import { Telegraf, Context } from 'telegraf';
/*middlewares*/
import { checkValidUserId } from "./middleware";
/*commands*/
import {
    Commands,
    getToken,
    getId,
    register,
    scheduler,
    getTimeToPublish,
    getServerTime,
    getServerUrl,
    getContent,
    getLogs
} from "./commands";
/*actions*/
import {approveAction, contentAction} from "./actions";
/*DB*/
import {DB, mainDB} from "../db";
import {Databases} from "../db/migration";
/*other*/

interface TCustomTelegrafContext extends Context {
    db: Record<Databases, DB>
}

const bot = new Telegraf<TCustomTelegrafContext>(process.env.TG_TOKEN);
type TTelegrafContext = typeof bot['context'];

bot.context.db = {
    [Databases.Main]: mainDB
}

bot.start((ctx) => ctx.reply('Бот запущен.'))

bot.use(checkValidUserId)

bot.command(Commands.Register, register);
bot.command(Commands.Scheduler, scheduler);
bot.command(Commands.GetToken, getToken);
bot.command(Commands.GetId, getId);
bot.command(Commands.GetTimeToPublish, getTimeToPublish);
bot.command(Commands.GetServerTime, getServerTime);
bot.command(Commands.GetServerUrl, getServerUrl);
bot.command(Commands.GetContent, getContent);
bot.command(Commands.GetLogs, getLogs);

bot.action(/approve/, approveAction)
bot.action(/content/, contentAction)

export { TTelegrafContext, bot }