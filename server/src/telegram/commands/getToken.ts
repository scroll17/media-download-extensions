/*external modules*/
import {Middleware} from "telegraf";
/*models*/
import {UserModel} from "../../db/models/user";
import {TokenModel} from "../../db/models/token";
/*telegram*/
import {TTelegrafContext} from "../index";
/*other*/
import {generateSecretToken} from "../../crypto/generateSecretToken";

export const getToken: Middleware<TTelegrafContext> = async (ctx) => {
   await ctx.db.main.getClientTransaction(async client => {
        const user = await UserModel.findByTGId.exec(
            client,
            {
                telegramId: ctx.from?.id!
            }
        )
        if(!user) {
            return await ctx.reply('Вы не зареестрированы.')
        }

        if(user.tokenId) {
            await TokenModel.remove.exec(
                client,
                {
                    tokenId: user.tokenId
                }
            )
        }

        const token = await TokenModel.create.exec(
            client,
            {
                data: generateSecretToken()
            }
        )
        if(!token) {
            await ctx.reply('Возникла проблема...')

            throw new Error(`token not found`)
        }

        await UserModel.update.exec(
            client,
            {
                id: user.id,
                tokenId: token.id
            }
        )

        await ctx.reply(token.data)
    })
}