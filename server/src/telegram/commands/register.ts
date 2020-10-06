/*external modules*/
import {Middleware} from "telegraf";
/*DB*/
import {UserModel} from "../../db/models/user";
/*telegram*/
import {TTelegrafContext} from "../index";
/*other*/

export const register: Middleware<TTelegrafContext> = async (ctx) => {
    const userExist = await UserModel.findByTGId.exec(
        ctx.db.main,
        {
            telegramId: ctx.from?.id!
        }
    )

    if(userExist) {
        await ctx.reply('Вы уже зарегестрированы.')
    } else {
       await UserModel.create.exec(
            ctx.db.main,
            {
                telegramId: ctx.from?.id!,
                name: ctx.from?.first_name!,
                username: ctx.from?.username!
            }
        )

        await ctx.reply('Вы успешно зарегестрировалтсь.')
    }
}