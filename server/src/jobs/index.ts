/*external modules*/
import Queue, {Job, JobOptions, QueueOptions } from 'bull'
import _ from 'lodash'
/*DB*/
/*models*/
/*workers*/
import { downloadFileConsumer, DownloadFileOptions } from "./consumers/download-file";
/*other*/
import {SyncQueue, SyncQueueOptions } from "./SyncQueue";
import {logger} from "../logger";
import {setEnv} from "../env";

interface Consumer<T> {
    (job: Job<T>): Promise<void>;
}

export type QueueNameList =
    | 'download-file'

const FIVE_MINUTES_IN_MS = 1000 * 60 * 60 * 12;

export class JobWorker {
    readonly prefix: string;
    readonly logger: typeof logger;
    readonly config: {
        name: string;
        redis: QueueOptions['redis']
    }
    readonly queues: Record<string, SyncQueue> = {};
    readonly defaultJobOptions: JobOptions = { attempts: 3 };

    constructor() {
        this.logger = logger;
        this.config = {
            name: process.env.NODE_ENV,
            redis: setEnv.REDIS_CONF
        }
        this.prefix = `${this.config.name}:bull`
    }

    addQueue<T>(name: string, consumer: Consumer<T>, opts: SyncQueueOptions): SyncQueue<T> {
        const queue = (this.queues[name] = new SyncQueue<T>(name, opts));

        queue.process(10, consumer)
        queue.on('failed', (job, jobError) => {
            this.logger.error(`${queue.name} job failed => `, jobError);
        });

        this.logger.debug(`Queue "${name}" added.`);

        return queue
    }

    getQueue(name: QueueNameList): SyncQueue;
    getQueue(name: string): SyncQueue | undefined;
    getQueue(name: QueueNameList | string) {
        return this.queues[name];
    }

    async start() {
        this.logger.info('--- JOB WORKERS STARTING.. ---');

        const queueOpts: SyncQueueOptions = {
            redis: this.config.redis,
            prefix: this.prefix,
            defaultJobOptions: this.defaultJobOptions,
            syncJobStatus: true
        };
        const queueOptsWithBackoff: SyncQueueOptions = {
            ...queueOpts,
            defaultJobOptions: {
                ...queueOpts.defaultJobOptions,
                backoff: {
                    type: 'fixed',
                    delay: FIVE_MINUTES_IN_MS
                }
            }
        };

        /**
         * Download video and photo from instagram
         */
        this.addQueue<DownloadFileOptions>(
            'download-file',
            downloadFileConsumer,
            queueOpts
        )

        this.logger.info('--- JOB WORKERS STARTED. ---');
    }

    async stop() {
        await Promise.all(_.map(this.queues, queue => queue.close()));
        this.logger.debug('Job workers stopped.');
    }
}

export default new JobWorker();