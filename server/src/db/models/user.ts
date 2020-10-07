/*external modules*/
/*DB*/
import {sql} from "../sql";
import {$UserTable, User} from "../types/user";
import {$TokenTable, Token} from "../types/token";
/*other*/
import { TFunction } from '@server/types';

export namespace UserModel {
    export namespace create {
        export type TArgs = Pick<User, 'name' | 'username' | 'telegramId' | 'chatId'>
        export type TReturn = User;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$UserTable} (
                        "name",
                        "username",
                        "telegramId",
                        "chatId"
                    ) VALUES (
                        ${args.name},
                        ${args.username},
                        ${args.telegramId},
                        ${args.chatId}
                    )
                `
            );

            return findById.exec(client, { userId: lastID })
        }
    }

    export namespace update {
        export type TArgs = Pick<User, 'id'> & Partial<Pick<User, 'tokenId' | 'name' | 'username'>>
        export type TReturn = User
        export const exec: TFunction.Update<TArgs, TReturn> = async (client, args) => {
            await client.run(
                sql`
                    UPDATE ${$UserTable}
                    SET "tokenId" = ${sql.setNewValue("tokenId", args.tokenId)},
                        "name" = ${sql.setNewValue("name", args.name)},
                        "username" = ${sql.setNewValue("username", args.username)}
                    WHERE "id" = ${args.id}
                `
            )

            return findById.exec(client, { userId: args.id })
        }
    }

    export namespace findById {
        export type TArgs = { userId: number }
        export type TReturn = User;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const user = await client.get<User>(
                sql`
                    SELECT * 
                    FROM ${$UserTable}
                    WHERE "id" = ${args.userId}
                `
            )

            return user
        }
    }

    export namespace findByTGId {
        export type TArgs = { telegramId: number }
        export type TReturn = User;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const user = await client.get<User>(
                sql`
                    SELECT * 
                    FROM ${$UserTable}
                    WHERE "telegramId" = ${args.telegramId}
                `
            )

            return user
        }
    }

    export namespace getToken {
        export type TArgs = { userId: number }
        export type TReturn = Token;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const token = await client.get<Token>(
                sql`
                    SELECT token.* 
                    FROM ${$UserTable} user
                        INNER JOIN ${$TokenTable} token ON token.id = user."tokenId"
                    WHERE user."id" = ${args.userId}
                `
            )

            return token
        }
    }
}