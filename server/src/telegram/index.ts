/*external modules*/
import { Telegraf, Context } from 'telegraf';
/*middlewares*/
import { checkValidUserId } from "./middleware";
/*commands*/
import {approve, Commands, getToken, register, scheduler} from "./commands";
import {forApproval} from "./commands/forApproval";
/*DB*/
import {DB, mainDB} from "../db";
import {Databases} from "../db/migration";
import {getId} from "./commands/getId";

interface TCustomTelegrafContext extends Context {
    db: Record<Databases, DB>
}

const bot = new Telegraf<TCustomTelegrafContext>(process.env.TG_TOKEN);
type TTelegrafContext = typeof bot['context'];

bot.context.db = {
    [Databases.Main]: mainDB
}

bot.start((ctx) => ctx.reply('Бот запущен.'))

bot.use(
    checkValidUserId
)

bot.command(Commands.Register, register);
bot.command(Commands.Scheduler, scheduler);
bot.command(Commands.GetToken, getToken);
bot.command(Commands.GetId, getId);
// bot.command(Commands.Approve, approve);
// bot.command(Commands.ForApproval, forApproval);

export { TTelegrafContext, bot }