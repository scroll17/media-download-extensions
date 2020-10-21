/*external modules*/
import { Markup} from 'telegraf';
/*DB*/
import {FileApprove} from "../../db/types/file";
/*other*/
import {ButtonPrefix, withPrefix} from "./index";

export function approveButtons(fileId: number) {
    return [
        Markup.callbackButton('Approve', withPrefix(ButtonPrefix.Approve, fileId, { status: FileApprove.Approved })),
        Markup.callbackButton('Disable', withPrefix(ButtonPrefix.Approve, fileId, { status: FileApprove.Disabled }))
    ]
}