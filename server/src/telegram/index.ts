/*external modules*/
import { Telegraf, Context, Extra } from 'telegraf';
/*middlewares*/
import { checkValidUserId } from "./middleware";
/*commands*/
import {approve, Commands, getToken, register, scheduler} from "./commands";
import {forApproval} from "./commands/forApproval";
/*DB*/
import {DB, mainDB} from "../db";
import {Databases} from "../db/migration";
import {getId} from "./commands/getId";
import {approveButtons, ButtonPrefix, parseButtonData} from "./buttons";
import {PhotoModel} from "../db/models/photo";

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
// bot.command(Commands.Approve, approve);
// bot.command(Commands.ForApproval, forApproval);


bot.hears('test', async (ctx) => {
    const result = await ctx.reply('test message', approveButtons(1));
})
bot.hears('photo', async (ctx) => {
    await ctx.replyWithPhoto(
        {
            source: PhotoModel.getFilePath('1602280651914'),
        },
        {
            caption: `${'денис'} хочет опубликовать`,
            ...approveButtons(5),
            disable_web_page_preview: undefined
        }
    )
})



bot.action(/approve/, async (ctx) => {
    console.log('parse => ', parseButtonData(ctx.callbackQuery?.data!))

    await ctx.reply(ctx.callbackQuery?.data!);
})

export { TTelegrafContext, bot }