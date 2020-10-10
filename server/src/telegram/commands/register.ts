/*external modules*/
import {Middleware} from "telegraf";
/*models*/
import {UserModel} from "../../db/models/user";
/*telegram*/
import {TTelegrafContext} from "../index";
/*other*/

export const register: Middleware<TTelegrafContext> = async (ctx) => {
    await ctx.db.main.getClientTransaction(async client => {
        const userExist = await UserModel.findByTGId.exec(
            client,
            {
                telegramId: ctx.from?.id!
            }
        )

        if(userExist) {
            await ctx.reply('Вы уже зарегестрированы.')
        } else {
            const data: UserModel.create.TArgs = {
                telegramId: ctx.from?.id!,
                name: ctx.from?.first_name!,
                username: ctx.from?.username!,
                chatId: ctx.chat?.id!
            }
            await UserModel.create.exec(client, data)

            await ctx.reply('Вы успешно зарегестрировались.')
        }
    })
}