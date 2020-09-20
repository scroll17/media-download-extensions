/*external modules*/
import { IgApiClient } from 'instagram-private-api'
/*other*/

export namespace Auth {
    export async function login(ig: IgApiClient, prePostFlow = true) {
        console.debug('--- generate device ---')
        ig.state.generateDevice(process.env.IG_USERNAME);

        if(prePostFlow) {
            console.debug('--- preLogin flow ---')
            await ig.simulate.preLoginFlow()
        }

        const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

        if(prePostFlow) {
            console.debug('--- postLogin flow ---')
            await ig.simulate.postLoginFlow()
        }

        console.info('--- login in ---')
        return loggedInUser
    }
}