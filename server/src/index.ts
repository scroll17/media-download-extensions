/*instagram*/
import {Auth} from "./instagram/Auth";
/*other*/
import {logger} from "./logger";
import momentTimezone from 'moment-timezone'

(async () => {
    logger.info('--- SET ENV ---')
    const { setEnv } = await import("./env");
    await setEnv();

    logger.info('--- SET TIMEZONE ---')
    momentTimezone.tz.setDefault('Europe/Zaporozhye')

    logger.info('--- CONNECT TO REDIS ---')
    const { redis } = await import('./db/redis/index');

    // logger.info('--- SETUP NGROK ---')
    // const { setupNGROK } = await import('./ngrok/index')
    // await setupNGROK()
    //
    // logger.info('--- BOT LAUNCH ---')
    // const { bot } = await import( "./telegram");
    // await bot.launch();

    console.log('redis get => ', await redis.get('test'))

    logger.info('--- IMPORT JOB WORKER ---')
    const { default: JobWorker } = await import('./jobs/index');
    await JobWorker.start()

    await redis.set('test', 5)
    await JobWorker.getQueue('save-redis').add({})

    // logger.info('--- IMPORT IG ---')
    // const { ig } = await import('./instagram/ig')
    //
    // logger.info('--- INSTAGRAM AUTH ---')
    // await Auth.login(ig);

    // const {mainDB, sql} = require("./db");
    // const {File}  = require("./db/types/file");
    // const moment = require("moment");
    // const {Constants} = require("./constants");
    // const {JobModel} = require("./db/models/job");

    // await mainDB.getClient(async client => {
    //     const files = await client.all<File>(
    //         sql`
    //             select *
    //             from "File"
    //             where strftime('%s', date("desiredTime")) >= (strftime('%s', date(datetime('now', 'localtime'))) - (1000 * 60 * 60 * 24))
    //         `
    //     )
    //
    //     await Promise.all(
    //         files.map(async file => {
    //             const desiredTime = moment(file.desiredTime, Constants.DBDateTime).valueOf();
    //             const timeNow = moment().tz('Europe/Zaporozhye').valueOf()
    //
    //             let delay: number;
    //             if(desiredTime <= timeNow) {
    //                 delay = 0
    //             } else {
    //                 delay = desiredTime - timeNow
    //             }
    //
    //             await JobModel.create.exec(client, {
    //                 name: "publish-content",
    //                 data: {
    //                     fileId: file.id
    //                 },
    //                 options: {
    //                     delay
    //                 }
    //             });
    //         })
    //     )
    // })

    // logger.info('--- SETUP SERVER ---')
    // const { setup } = await import('./app/index')
    // await setup()
})()