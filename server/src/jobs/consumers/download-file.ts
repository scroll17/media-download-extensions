/*external modules*/
import { Job } from 'bull';
import axios from 'axios'
import fs from 'fs'
/*DB*/
import {FileType} from "../../db/types/file";
/*models*/
/*other*/
import { logger } from '../../logger';

export interface DownloadFileOptions {
    delayedToPublish: number;
    type: FileType;
    imgUrl: string;
    videoUrl?: string;
    caption?: string;
}

export async function downloadFileConsumer(
    job: Job<DownloadFileOptions>
) {
    const scope = 'download-file';

    logger.info(`Started: ${scope}.`, job.data);

    const { type, imgUrl } = job.data;
    switch (type) {
        case FileType.Photo: {
            const fileName = Date.now();

        }
    }


    logger.info(`Completed: ${scope}.`, job.data);
}

async function downloadFile(url: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath, { flags: "wx" });

        axios.get(url, { responseType: 'stream' })
            .then(response => {
                if (response.status === 200) {
                    response.data.pipe(file);
                } else {
                    file.close();
                    fs.unlink(filePath, () => {}); // Delete temp file
                    reject(`Instagram server error: ${response.status}: ${response.statusText}`);
                }
            });


        file.on("finish", () => {
            resolve(filePath);
        });

        file.on("error", err => {
            file.close();

            if (err.code === "EEXIST") {
                reject("File already exists");
            } else {
                fs.unlink(filePath, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}