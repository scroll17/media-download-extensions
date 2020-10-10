import {Middleware} from "telegraf";
import _ from 'lodash'
import {TTelegrafContext} from "../index";
import {parseButtonData} from "../buttons";
import {FileModel} from "../../db/models/file";
import {File, FileApprove} from "../../db/types/file";
import {setEnv} from "../../env";

export const approveAction: Middleware<TTelegrafContext> = async (ctx) => {
    const { value: fileId, options } = parseButtonData<{ status: FileApprove }>(ctx.callbackQuery?.data!);

    await ctx.db.main.getClientTransaction(async client => {
        const file = await FileModel.findById.exec(client, { fileId: Number(fileId) });
        if(!file) throw new Error('file not found');

        if(file.approved !== FileApprove.NotSeen) {
            return await ctx.reply('Выбор уже сделан.')
        }

        const messagesSet: File['messageIds'] = JSON.parse(file.messageIds as unknown as string);

        await FileModel.update.exec(
            client,
            {
                id: file.id,
                data: {
                    approved: options.status
                }
            }
        );

        let messagesToReply: string[]
        if(options.status === FileApprove.Disabled) {
            messagesToReply = ['Вы отклонили эту публикацию.', `"${ctx.from?.first_name}" отклонил публикацию.`];
        } else {
            messagesToReply = ['Вы подтвердили эту публикацию.', `"${ctx.from?.first_name}" подтвердил публикацию.`];
        }

        const [mainUserMessage, otherUserMessage] = messagesToReply
        await Promise.all(
            _.map(setEnv.VALID_TELEGRAM_IDS, async memberId => {
                const { messageId } = messagesSet![memberId];

                if(memberId === ctx.from?.id) {
                    await ctx.reply(mainUserMessage, {
                        reply_to_message_id: Number(messageId)
                    })
                } else {
                    await ctx.reply(otherUserMessage, {
                        reply_to_message_id: Number(messageId)
                    })
                }
            })
        )

        if(options.status === FileApprove.Disabled) return;


    })
}