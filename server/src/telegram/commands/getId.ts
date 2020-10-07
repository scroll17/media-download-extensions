import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";
import {UserModel} from "../../db/models/user";
import {generateSecretToken} from "../../crypto/generateSecretToken";
import {TokenModel} from "../../db/models/token";

export const getId: Middleware<TTelegrafContext> = async (ctx) => {
    const user = await UserModel.findByTGId.exec(
        ctx.db.main,
        {
            telegramId: ctx.from?.id!
        }
    )

    if(!user) {
        await ctx.reply('Вы не зареестрированы.')
        return
    }

    await ctx.reply(`Ваш id: ${user.id}`)
}