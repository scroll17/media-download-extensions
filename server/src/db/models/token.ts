/*external modules*/
/*DB*/
import {sql} from "../sql";
import {$TokenTable, Token} from "../types/token";
/*other*/
import { TFunction } from '@server/types';

export namespace TokenModel {
    export namespace findById {
        export type TArgs = { tokenId: number }
        export type TReturn = Token;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const token = await client.get<Token>(
                sql`
                    SELECT * 
                    FROM ${$TokenTable}
                    WHERE "id" = ${args.tokenId}
                `
            )

            return token
        }
    }

    export namespace findBySecret {
        export type TArgs = { data: string }
        export type TReturn = Token;
        export const exec: TFunction.SelectOne<TArgs, TReturn> = async (client, args) => {
            const token = await client.get<Token>(
                sql`
                    SELECT * 
                    FROM ${$TokenTable}
                    WHERE "data" = ${args.data}
                `
            )

            return token
        }
    }

    export namespace create {
        export type TArgs = Pick<Token, 'data'>
        export type TReturn = Token;
        export const exec: TFunction.Insert<TArgs, TReturn> = async (client, args) => {
            const { lastID } = await client.run(
                sql`
                    INSERT INTO ${$TokenTable} (
                        "data"
                    ) VALUES (
                        ${args.data}
                    )
                `
            );

            return findById.exec(client, { tokenId: lastID })
        }
    }

    export namespace remove {
        export type TArgs = { tokenId: number }
        export type TReturn = void
        export const exec: TFunction.Delete<TArgs, TReturn> = async (client, args) => {
            await client.run(
                sql`
                    DELETE 
                    FROM ${$TokenTable}
                    WHERE "id" = ${args.tokenId}
                `
            )
        }
    }
}