import chalk from 'chalk'

export const logger = {
    info: (message: any, ...args: any[]) => console.log(chalk.blue(message), ...args),
    error: (message: any, ...args: any[]) => console.log(chalk.red(message), ...args),
    debug: (message: any, ...args: any[]) => console.log(chalk.green(message), ...args),
    warn: (message: any, ...args: any[]) => console.log(chalk.yellow(message), ...args)
}