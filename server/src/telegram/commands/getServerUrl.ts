/*external modules*/
import { Middleware } from 'telegraf';
import {ngrok} from "../../ngrok/index";
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
/*other*/

export const getServerUrl: Middleware<TTelegrafContext> = async (ctx) => {
    const api = ngrok.getApi()
    if(!api) return await ctx.reply('ngrok не подключён.')

    const res = await api('api/tunnels')
    const { tunnels: [currentTunnel] } = JSON.parse(res as unknown as string)

    await ctx.reply(currentTunnel?.public_url ?? 'Нету туннелей.')
}