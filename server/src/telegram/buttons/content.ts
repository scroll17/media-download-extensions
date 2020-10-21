/*external modules*/
import { Markup} from 'telegraf';
/*DB*/
/*other*/
import {ButtonPrefix, withPrefix} from "./index";

export function contentButton(fileId: number, text: string) {
    return [
        Markup.callbackButton(text, withPrefix(ButtonPrefix.Content, fileId, {})),
    ]
}