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
    }
}

setEnv.REDIS_CONF = {} as SetEnv['REDIS_CONF'];

export async function setEnv() {
    const confPath = path.resolve(__dirname, '../../', 'conf.json');

    const confFile = await fs.readFile(confPath, { encoding: 'utf-8' });
    const conf = JSON.parse(confFile);

    Object
        .keys(requiredOptions)
        .forEach(key => {
            if(!conf[key]) throw new Error(`${key} is required in conf.`)

            if(key === 'REDIS_CONF') {
                setEnv.REDIS_CONF = conf[key]
            } else {
                process.env[key] = conf[key];
            }
        })

    return conf;
}