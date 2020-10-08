/*external modules*/
/*other*/

export enum ButtonPrefix {
    Approve = 'approve'
}
export type TButtonStatus = -1 | 0 | 1
export type TOptions = {
    status?: TButtonStatus;
    messageId?: string;
}

function withPrefix(prefix: ButtonPrefix, value: string | number, options: TOptions = {}) {
    console.log('stringify => ', `${prefix}:${value}:${JSON.stringify(options)}`)
    return `${prefix}:${value}:${JSON.stringify(options)}`
}

function parseButtonData(text: string) {
    const [prefix, value, ...options] = text.split(':');

    return {
        prefix,
        value: value,
        options: JSON.parse(options.join(':'))
    }
}

export { withPrefix, parseButtonData }
export { approveButtons } from './approve'