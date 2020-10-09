/*external modules*/
import {Extra, Markup} from 'telegraf';
/*other*/
import {ButtonPrefix, withPrefix} from "./index";

export function approveButtons(fileId: number) {
    return Markup
        .inlineKeyboard([
            Markup.callbackButton('Approve', withPrefix(ButtonPrefix.Approve, fileId, { status: 1 })),
            Markup.callbackButton('Disable', withPrefix(ButtonPrefix.Approve, fileId, { status: 0 }))
        ])
        .extra()
}