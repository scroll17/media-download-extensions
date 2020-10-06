/*external modules*/
import { Telegraf } from 'telegraf';
/*middlewares*/
import { checkValidUserId } from "./middleware";
/*commands*/
import {Commands, get_token, register, scheduler} from "./commands";

const bot = new Telegraf(process.env.TG_TOKEN);
type TContext = typeof bot['context'];

bot.start((ctx) => ctx.reply('Бот запущен.'))

bot.use(
    checkValidUserId
)

bot.command(Commands.Register, register);
bot.command(Commands.Scheduler, scheduler);
bot.command(Commands.GetToken, get_token);

export { TContext, bot }