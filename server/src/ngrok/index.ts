/*external modules*/
import ngrok from 'ngrok'
/*other*/
import { readConf } from "../env";

type TNgrokConfig = {
    authtoken: string;
}

async function setupNGROK() {
    const ngrokConf = await readConf<TNgrokConfig>('ngrok.json')
    const mainConf = await readConf<{ PORT: number }>('conf.json')

    await ngrok.connect({
        ...ngrokConf,
        addr: mainConf.PORT,
        // onLogEvent: event => logger.debug(':ngrok', event)
    })
}

export { ngrok, setupNGROK }