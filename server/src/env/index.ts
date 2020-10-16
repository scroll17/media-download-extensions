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

export async function readConf<T = Record<string, string>>(name: string): Promise<T> {
    const confPath = path.resolve(__dirname, '../../', name);

    const confFile = await fs.readFile(confPath, { encoding: 'utf-8' });
    return JSON.parse(confFile);
}

export async function setEnv() {
    const conf = await readConf<SetEnv & Record<string, any>>('conf.json');

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