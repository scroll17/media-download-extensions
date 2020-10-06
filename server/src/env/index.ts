/*external modules*/
import { promises as fs } from 'fs';
import path from 'path';
/*@types*/
import { ProcessEnv } from "../@types/environment";
/*other*/
import requiredOptions from './required'

export async function setEnv(): Promise<ProcessEnv> {
    const confPath = path.resolve(__dirname, '../../', 'conf.json');

    const confFile = await fs.readFile(confPath, { encoding: 'utf-8' });
    const conf = JSON.parse(confFile);

    Object
        .keys(requiredOptions)
        .forEach(key => {
            if(!conf[key]) throw new Error(`${key} is required in conf.`)

            process.env[key] = conf[key];
        })

    return conf;
}
