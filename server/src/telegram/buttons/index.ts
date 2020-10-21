/*external modules*/
import {InlineKeyboardButton} from "telegraf/typings/markup";
import {Markup} from "telegraf";
/*other*/
import {approveButtons} from "./approve";

export enum ButtonPrefix {
    Approve = 'approve',
    Content = 'content'
}

export type TButtonStatus = -1 | 0 | 1
export type TOptions = {
    status?: TButtonStatus;
    messageId?: string;
}

function withPrefix(prefix: ButtonPrefix, value: string | number, options: TOptions = {}) {
    return `${prefix}:${value}:${JSON.stringify(options)}`
}

function parseButtonData<TOpts = Record<string, any>>(text: string) {
    const [prefix, value, ...options] = text.split(':');

    return {
        prefix,
        value: value,
        options: JSON.parse(options.join(':')) as TOpts
    }
}

function createInlineKeyboard(buttons: InlineKeyboardButton[] | InlineKeyboardButton[][]) {
    return Markup
        .inlineKeyboard(buttons)
        .extra()
}

export { withPrefix, parseButtonData, createInlineKeyboard }

export { approveButtons } from './approve'
export { contentButton } from './content'