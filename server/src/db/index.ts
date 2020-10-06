/*external modules*/
import sqlite3, { Database, RunResult } from 'sqlite3';
import path from "path";
/* other */
import { sql, SqlStatement } from "./sql";

export class DB {
    private constructor(private readonly _db: Database, private readonly _dbPath: string) {}

    static async connect(dbPath: string): Promise<DB>{
        return new Promise((resolve, reject) => {
            const dbInstance = sqlite3.cached.Database(dbPath, (err) => reject(err))
            resolve(new DB(dbInstance, dbPath))
        })
    }

    static syncConnect(dbPath: string): DB {
        const dbInstance = sqlite3.cached.Database(dbPath);

        dbInstance.once('error', err => {
            throw err;
        })

        return new DB(dbInstance, dbPath);
    }

    /**
     *   The trace event is emitted whenever a query is run.
     *   The first and only parameter to the callback is the SQL string that was sent to the database.
     * */
    onTrace(cb: (str: string) => void) {
        this._db.on('trace', cb)
    }

    /**
     *   The profile event is emitted whenever a query is finished.
     *   The first parameter is the SQL string that was sent to the database, the second parameter
     *   is the time approximate time it took to run in milliseconds.
     * */
    onProfile(cb: (str: string, time: number) => void) {
        this._db.on('profile', cb);
    }

    /**
     *   Runs the SQL query with the specified parameters and calls the callback afterwards. It does not retrieve any result data.
     *   return {
     *       lastID: string -> the last inserted row ID. (INSERT)
     *       changes: number -> the number of rows affected by this query respectively. (UPDATE or DELETE)
     *   }
     * */
    async run(sql: SqlStatement | string) {
        const text = sql instanceof SqlStatement ? sql.text : sql;
        const values = sql instanceof SqlStatement ? sql.values : [];

        return new Promise<RunResult>((resolve, reject) => {
            this._db.run(text, values,function (err) {
                if(err) reject(err);
                resolve(this);
            })
        })
    }

    /**
     *   Runs the SQL query with the specified parameters and return first result row afterwards.
     *   example:
     *      select * from users
     *      -> return users[0]
     * */
    async get<TReturn = undefined>(sql: SqlStatement | string) {
        const text = sql instanceof SqlStatement ? sql.text : sql;
        const values = sql instanceof SqlStatement ? sql.values : [];

        return new Promise<TReturn>((resolve, reject) => {
            this._db.get(text, values, function (err, row) {
                if(err) reject(err);
                resolve(row)
            })
        })
    }

    /**
     *   Runs the SQL query with the specified parameters and return all result row afterwards.
     *   example:
     *      select * from users
     *      -> return users
     * */
    async all<TReturn = undefined>(sql: SqlStatement | string) {
        const text = sql instanceof SqlStatement ? sql.text : sql;
        const values = sql instanceof SqlStatement ? sql.values : [];

        return new Promise<TReturn[]>((resolve, reject) => {
            this._db.all(text, values, function (err, rows) {
                if(err) reject(err);
                resolve(rows)
            })
        })
    }


    /**
     *   Runs all SQL queries in the supplied string. No result rows are retrieved.
     * */
    async exec(sql: string) {
        return new Promise<void>((resolve, reject) => {
            this._db.exec(sql, (err) => {
                if(err) reject(err);
                resolve()
            })
        })
    }


    /**
     *  Close connection to database.
     * */
    async close() {
        return new Promise<void>((resolve, reject) => {
            this._db.close(err => {
                if(err) reject(err);
                resolve()
            })
        })
    }

    async getClient<TReturn = undefined>(cb: (db: DB) => Promise<TReturn>) {
        const db = await DB.connect(this._dbPath);

        let result: TReturn;
        try {
            result = await cb(db);
        } catch (error) {
            console.error('SQLite error', error)
            throw error;
        } finally {
            await db.close()
        }

        return result;
    }

    async getClientTransaction<TReturn = undefined>(cb: (db: DB) => Promise<TReturn>) {
        const db = await DB.connect(this._dbPath);

        let result: TReturn;
        try {
            await db.exec('BEGIN TRANSACTION;');
            result = await cb(db);
            await db.exec('COMMIT;');
        } catch (error) {
            await db.exec('ROLLBACK;');

            console.error('SQLite error', error)
            throw error;
        }

        return result;
    }
}

const mainDB = DB.syncConnect(path.resolve(__dirname, 'exp', 'main.sqlite'));

export {
    sql,
    mainDB
}