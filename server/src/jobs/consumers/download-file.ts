/*external modules*/
import { Job } from 'bull';
/*DB*/
/*models*/
/*other*/
import { logger } from '../../logger';

export interface DownloadFileOptions {

}

export async function downloadFileConsumer(
    job: Job<DownloadFileOptions>
) {
    const scope = 'download-file';

    logger.info(`Started: ${scope}.`, job.data);

    logger.info(`Completed: ${scope}.`, job.data);
}
