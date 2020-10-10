/*external modules*/
import { Middleware } from 'telegraf';
import _ from 'lodash'
/*telegram*/
import {TTelegrafContext} from "../index";
/*DB*/
import {File, FileApprove} from "../../db/types/file";
/*models*/
import {UserModel} from "../../db/models/user";
import {FileModel} from "../../db/models/file";
import {JobModel} from "../../db/models/job";
/*other*/
import {setEnv} from "../../env";
import {parseButtonData} from "../buttons";

export const approveAction: Middleware<TTelegrafContext> = async (ctx) => {
    const { value: fileId, options } = parseButtonData<{ status: FileApprove }>(ctx.callbackQuery?.data!);

    await ctx.db.main.getClientTransaction(async client => {
        const file = await FileModel.findById.exec(client, { fileId: Number(fileId) });
        if(!file) throw new Error('file not found');

        if(file.approved !== FileApprove.NotSeen) {
            return await ctx.reply('Выбор уже сделан.')
        }

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

        const messagesSet: File['messageIds'] = JSON.parse(file.messageIds as unknown as string);
        const [mainUserMessage, otherUserMessage] = messagesToReply

        await Promise.all(
            _.map(setEnv.VALID_TELEGRAM_IDS, async memberId => {
                const { messageId } = messagesSet![memberId];

                if(memberId === ctx.from?.id) {
                    await ctx.reply(mainUserMessage, {
                        reply_to_message_id: Number(messageId)
                    })
                } else {
                    const user = await UserModel.findByTGId.exec(client, { telegramId: memberId });
                    if(!user) return

                    await ctx.telegram.sendMessage(user.chatId, otherUserMessage, {
                        reply_to_message_id: Number(messageId)
                    })
                }
            })
        )

        if(options.status === FileApprove.Disabled) return;

        let delay: number;
        const desiredTime = new Date(file.desiredTime).valueOf();
        if(desiredTime <= Date.now()) {
            delay = 0
        } else {
            delay = desiredTime - Date.now()
        }

        const jobData: JobModel.create.TArgs = {
            name: "publish-content",
            data: {
                fileId: file.id
            }
        }
        if(delay) _.set(jobData, ['options', 'delay'], delay)

        await JobModel.create.exec(client, jobData);
    })
}