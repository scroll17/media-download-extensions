/*external modules*/
import { Context } from 'telegraf'
import { InlineKeyboardMarkup } from 'telegram-typings'
import {Constants} from "../../constants";
/*telegram*/

type TReplyMarkup = { reply_markup: InlineKeyboardMarkup }
type IncomingMessage = (Required<Pick<Context, 'message'>>)['message']

export type TMessageWithMarkup = IncomingMessage
    & TReplyMarkup
    & {
        reply_to_message: IncomingMessage['reply_to_message'] & TReplyMarkup
    }

/**
 *   0 - non valid
 *   1 - valid
 * */
type TValid = [1, InlineKeyboardMarkup['inline_keyboard']]
type TNonValid = [0, string | null]

export function getInlineKeyboard(message: IncomingMessage | TMessageWithMarkup | undefined, replyMessageCaption?: string): TValid | TNonValid {
    if(!message) return [0, null]

    const replyMessage = message.reply_to_message
    if(!replyMessage) {
        return [0, 'Сообщение не имеет данных о публикациию.']
    }

    const messageFrom = replyMessage.from?.username
    if(messageFrom !== Constants.BotName) {
        return [0, 'Сообщение не предналежит боту.']
    }

    const caption = replyMessage.caption
    if(replyMessageCaption) {
        if(!caption) return [0, null]
        if(!caption.includes(replyMessageCaption)) return [0, null]
    }

    const inlineKeyboard = (replyMessage as TMessageWithMarkup)?.reply_markup.inline_keyboard
    if(!inlineKeyboard) return [0, 'Сообщение должно быть уведомлением бота о выборе действия для публикации.']

    return [1, inlineKeyboard]
}