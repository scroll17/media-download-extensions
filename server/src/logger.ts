import chalk from 'chalk'

export const logger = {
    info: (arg: any) => console.log(chalk.blue(arg)),
    error: (arg: any) => console.log(chalk.red(arg)),
    debug: (arg: any) => console.log(chalk.green(arg)),
}