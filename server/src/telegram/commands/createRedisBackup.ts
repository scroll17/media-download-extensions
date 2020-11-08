/*external modules*/
import { Middleware } from 'telegraf';
/*telegram*/
import {TTelegrafContext} from "../index";
/*models*/
import {UserModel} from "../../db/models/user";
/*other*/
import jobWorker from '../../jobs/index'

export const createRedisBackup: Middleware<TTelegrafContext> = async (ctx) => {
    await jobWorker
        .getQueue('save-redis')
        .add({}, { delay: 0 })
}