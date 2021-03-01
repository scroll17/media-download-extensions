/*external modules*/
import {Job} from 'bull';
import _ from 'lodash';
/*DB*/
import {mainDB} from "../../db";
import {redis} from "../../db/redis";
/*models*/
import {UserModel} from "../../db/models/user";
/*telegram*/
import {bot} from "../../telegram";
/*other*/
import {logger} from '../../logger';
import {setEnv} from "../../env";
import {Constants} from "../../constants";

export type SaveRedisOptions = {}

export async function saveRedisConsumer(
    job: Job<SaveRedisOptions>
) {
    const scope = 'save-redis';
    logger.info(`Started: ${scope}.`, job.data);

    try {
        const result = await redis.save()

        if(result !== 'OK') {
            throw new Error('Result is not "OK" after save backup Redis.')
        }

        const instagramMembers = setEnv.VALID_TELEGRAM_IDS;
        await Promise.all(
            _.map(instagramMembers, async memberId => {
                const user = await UserModel.findByTGId.exec(mainDB, { telegramId: memberId })
                if(!user) return

                await bot.telegram.sendMessage(
                    user.chatId,
                    'Создана резервная копия redis.'
                )
            })
        )

        await redis.del(Constants.Redis.SaveRedisJob)
    } catch (error) {
        logger.error('Error create backup redis', error)
    }

    logger.info(`Completed: ${scope}.`, job.data);
}