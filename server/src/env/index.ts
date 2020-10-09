/*external modules*/
import { promises as fs } from 'fs';
import path from 'path';
/*@types*/
import { ProcessEnv } from "../@types/environment";
/*other*/
import requiredOptions from './required'

interface SetEnv {
    (): Promise<ProcessEnv>;
    REDIS_CONF: {
        port: number,
        host: string,
        password: string
    },
    VALID_TELEGRAM_IDS: number[]
}

setEnv.REDIS_CONF = {} as SetEnv['REDIS_CONF'];
setEnv.VALID_TELEGRAM_IDS = [] as SetEnv['VALID_TELEGRAM_IDS'];

export async function setEnv() {
    const confPath = path.resolve(__dirname, '../../', 'conf.json');

    const confFile = await fs.readFile(confPath, { encoding: 'utf-8' });
    const conf = JSON.parse(confFile);

    Object
        .keys(requiredOptions)
        .forEach(key => {
            if(!conf[key]) throw new Error(`${key} is required in conf.`)

            switch (key) {
                case 'VALID_TELEGRAM_IDS': {
                    setEnv.VALID_TELEGRAM_IDS = conf[key]
                    break;
                }
                case 'REDIS_CONF': {
                    setEnv.REDIS_CONF = conf[key]
                    break;
                }
                default: {
                    process.env[key] = conf[key];
                    break;
                }
            }
        })

    return conf;
}