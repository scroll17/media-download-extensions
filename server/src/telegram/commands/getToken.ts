import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";
import {UserModel} from "../../db/models/user";
import {generateSecretToken} from "../../crypto/generateSecretToken";
import {TokenModel} from "../../db/models/token";

export const getToken: Middleware<TTelegrafContext> = async (ctx) => {
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

    if(user.tokenId) {
        await TokenModel.remove.exec(
            ctx.db.main,
            {
                tokenId: user.tokenId
            }
        )
    }

    const secretToken = generateSecretToken()
    const token = await TokenModel.create.exec(
        ctx.db.main,
        {
             data: secretToken
        }
    )
    if(!token) {
        await ctx.reply('Возникла проблема...')
        return;
    }

    await UserModel.update.exec(
        ctx.db.main,
        {
            id: user.id,
            tokenId: token.id
        }
    )

    await ctx.reply(secretToken)
}