import {logger} from "./logger";

(async () => {
    logger.info('--- SET ENV ---')
    const { setEnv } = await import("./env");
    await setEnv();

    logger.info('--- BOT LAUNCH ---')
    const { bot } = await import( "./telegram");
    await bot.launch();

    logger.info('--- SETUP SERVER ---')
    const { setup } = await import('./app/index')
    await setup()

    logger.info('--- CONNECT TO REDIS ---')
    await import('./db/redis/index');

    logger.info('--- IMPORT JOB WORKER ---')
    const { default: JobWorker } = await import('./jobs/index');
    await JobWorker.start()

    // const {JobModel} = await import("./db/models/job");
    // const {mainDB} = await import("./db");
    //
    // try {
    //     await JobModel.create.exec(
    //         mainDB,
    //         {
    //             name: 'download-file',
    //             data: {
    //                 text: 'test'
    //             }
    //         }
    //     )
    // } catch (e) {
    //     logger.error('--------------------------- ERROR ---------------------')
    //     console.trace(e)
    // }
    //
    // //await JobWorker.getQueue('download-file').add({ text: 'test' })
})()

// const ig = new IgApiClient();
//
// (async () => {
//    const server = http.createServer((req, res) => {});
//    server.listen(3001, () => console.log(`SERVER RUN ON ${3001} PORT`));
//
//    await setEnv();
//
//    /** instagram api */
//    await Auth.login(ig);
//
//    await Content.Publish.story('1600595339720.mp4', ig, { transcodeDelay: 1000 })
// })()