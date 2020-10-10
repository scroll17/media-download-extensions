/*external modules*/
import { IgApiClient } from 'instagram-private-api'
/*other*/
import {logger} from "../logger";

export namespace Auth {
    export async function login(ig: IgApiClient, prePostFlow = true) {
        logger.debug('--- generate device ---')
        ig.state.generateDevice(process.env.IG_USERNAME);

        if(prePostFlow) {
            logger.debug('--- preLogin flow ---')
            await ig.simulate.preLoginFlow()
        }

        const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

        if(prePostFlow) {
            logger.debug('--- postLogin flow ---')
            await ig.simulate.postLoginFlow()
        }

        logger.info('--- login in ---')
        return loggedInUser
    }
}