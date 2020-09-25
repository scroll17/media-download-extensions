import { DB } from "../../index";

export function run<TDB extends DB>(db: TDB) {
    return function (cb: (db: DB) => Promise<void>) {
        return async () => {
            try {
                await db.transaction(cb);
            } catch (error) {
                throw error;
            }
        };
    }
}