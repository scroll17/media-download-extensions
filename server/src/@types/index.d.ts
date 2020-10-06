import { DB } from '../db'
import {Context, Query, QueryReturnType} from "@server/types";

/**
 * Helper types that are reused across app.
 *
 * Example:
 * import { TFunction } from '@beyrep/types';
 * const arg0: TFunction.Arg0<typeof (a: number): number> = 10;
 */
declare module '@server/types' {
    export namespace TFunction {
        export interface Query<TArgs, TReturn, T extends QueryReturnType> {
            (client: DB, args: TArgs): Promise<
                T extends QueryReturnType.PossibleUndefined
                    ? TReturn | undefined
                    : TReturn
                >;
        }

        export type ReturnRequired<TArgs, TReturn> = Query<
            TArgs,
            TReturn,
            QueryReturnType.ReturnRequired
        >;
        export type Insert<TArgs, TReturn> = ReturnRequired<TArgs, TReturn>;
        export type SelectMany<TArgs, TReturn> = ReturnRequired<TArgs, TReturn>;
        export type PossibleUndefined<TArgs, TReturn> = Query<
            TArgs,
            TReturn,
            QueryReturnType.PossibleUndefined
        >;
        export type SelectOne<TArgs, TReturn> = PossibleUndefined<TArgs, TReturn>;
        export type Update<TArgs, TReturn> = PossibleUndefined<TArgs, TReturn>;
        export type Delete<TArgs, TReturn> = PossibleUndefined<TArgs, TReturn>;
    }
    export namespace TObject {

    }

    export namespace TType {

    }
}
