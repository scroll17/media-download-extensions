/*instagram*/
import {Auth} from "./instagram/Auth";
/*other*/
import {logger} from "./logger";

(async () => {
    logger.info('--- SET ENV ---')
    const { setEnv } = await import("./env");
    await setEnv();

    logger.info('--- BOT LAUNCH ---')
    const { bot } = await import( "./telegram");
    await bot.launch();

    logger.info('--- CONNECT TO REDIS ---')
    await import('./db/redis/index');

    logger.info('--- IMPORT JOB WORKER ---')
    const { default: JobWorker } = await import('./jobs/index');
    await JobWorker.start()

    logger.info('--- IMPORT IG ---')
    const { ig } = await import('./instagram/ig')

    logger.info('--- INSTAGRAM AUTH ---')
    await Auth.login(ig);

    logger.info('--- SETUP SERVER ---')
    const { setup } = await import('./app/index')
    await setup()
})()