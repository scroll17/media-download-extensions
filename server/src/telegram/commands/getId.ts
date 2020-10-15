/*external modules*/
import { Middleware } from 'telegraf';
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
import {UserModel} from "../../db/models/user";
/*other*/

export const getId: Middleware<TTelegrafContext> = async (ctx) => {
    const user = await UserModel.findByTGId.exec(
        ctx.db.main,
        {
            telegramId: ctx.from?.id!
        }
    )
    if(!user) {
        return await ctx.reply('Вы не зареестрированы.')
    }

    await ctx.reply(`Ваш id: ${user.id}`)
}