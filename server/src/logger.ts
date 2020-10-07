import chalk from 'chalk'

export const logger = {
    info: (arg: any) => console.log(chalk.blue(arg))
}