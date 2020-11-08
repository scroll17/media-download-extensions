/*external modules*/
import { Telegraf, Context } from 'telegraf';
import _  from 'lodash'
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
    getLogs,
    createRedisBackup
} from "./commands";
/*actions*/
import {approveAction, contentAction} from "./actions";
/*DB*/
import {DB, mainDB} from "../db";
import {Databases} from "../db/migration";
/*other*/

interface TTelegrafContext extends Context {
    db: Record<Databases, DB>;
    events: Array<() => Promise<any>>;
    resolveEvents: () => Promise<void>
}

const bot = new Telegraf<TTelegrafContext>(process.env.TG_TOKEN);

bot.context = Object.assign(bot.context, {
    db: {
        [Databases.Main]: mainDB
    },
    events: [],
    async resolveEvents() {
        const events = this.events as TTelegrafContext['events']

        if(!_.isEmpty(events))  {
            await Promise.all(_.map(events, event => event()))
        }
    }
})

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
bot.command(Commands.CreateRedisBackup, createRedisBackup);

bot.action(/approve/, approveAction)
bot.action(/content/, contentAction)

export { TTelegrafContext, bot }