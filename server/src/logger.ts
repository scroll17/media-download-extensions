/*external modules*/
import chalk from 'chalk'
import {Console} from "console";
import fs from 'fs'
import moment from "moment";
import _ from 'lodash'
/*other*/
import {Constants} from "./constants";

function log(type: keyof Console) {
    return (message: any, ...args: any[]) => {
        let text!: string
        switch (type) {
            case 'info': {
                text = chalk.blue(message)
                break;
            }
            case 'error': {
                text = chalk.red(message)
                break;
            }
            case 'debug': {
                text = chalk.green(message)
                break;
            }
            case 'warn': {
                text = chalk.yellow(message)
                break
            }
        }

        const time = moment().format('DD:HH:mm')
        const data = `[${time}]: ${message} ${(args ?? []).map(arg => _.isObject(arg) ? JSON.stringify(arg) : arg).join(' ')}\n`

        fs.appendFile(Constants.LogPath, data, (err) => {
            if(err) {
                logger.error('Error log:', err)
            }

            console.log(text, ...args)
        })
    }
}

export const logger = {
    info: log('info'),
    error: log('error'),
    debug: log('debug'),
    warn: log('warn')
}