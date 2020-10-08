import {Middleware} from "telegraf";
import {TTelegrafContext} from "../index";
import {UserModel} from "../../db/models/user";
import {generateSecretToken} from "../../crypto/generateSecretToken";
import {TokenModel} from "../../db/models/token";

export const getToken: Middleware<TTelegrafContext> = async (ctx) => {
   await ctx.db.main.getClientTransaction(async client => {
        const user = await UserModel.findByTGId.exec(
            client,
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
                client,
                {
                    tokenId: user.tokenId
                }
            )
        }

        const secretToken = generateSecretToken()
        const token = await TokenModel.create.exec(
            client,
            {
                data: secretToken
            }
        )
        if(!token) {
            await ctx.reply('Возникла проблема...')
            return;
        }

        await UserModel.update.exec(
            client,
            {
                id: user.id,
                tokenId: token.id
            }
        )

        await ctx.reply(secretToken)
    })
}