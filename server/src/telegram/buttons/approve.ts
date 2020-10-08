/*external modules*/
import {Extra} from 'telegraf';
/*other*/
import {ButtonPrefix, withPrefix} from "./index";

export function approveButtons(fileId: number) {
    return Extra
        .markdown()
        .markup((m) => m.inlineKeyboard([
            m.callbackButton('Approve', withPrefix(ButtonPrefix.Approve, fileId, { status: 1 })),
            m.callbackButton('Disable', withPrefix(ButtonPrefix.Approve, fileId, { status: 0 }))
        ]))
}