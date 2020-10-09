import { runInMainDB } from "../index";
import {JOB_TABLE, JobStatus} from "../../types/job";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
        CREATE TABLE ${JOB_TABLE} (
            "id"            INTEGER PRIMARY KEY,
            
            "name"          TEXT    NOT NULL,
            "status"        TEXT    NOT NULL        DEFAULT '${JobStatus.Undefined}', 
            
            "data"          TEXT    NOT NULL        DEFAULT '{}', 
            "error"         TEXT                    DEFAULT NULL, 
            
            "externalId"    TEXT                    DEFAULT NULL,
            
            "createdAt"     TEXT    NOT NULL        DEFAULT (datetime('now', 'localtime')),
            "updatedAt"     TEXT    NOT NULL        DEFAULT (datetime('now', 'localtime'))            
        )
    `);

    await db.run(`
        CREATE TRIGGER ${JOB_TABLE.toLowerCase()}_set_update_at
            AFTER UPDATE
            ON ${JOB_TABLE}
        BEGIN
            UPDATE ${JOB_TABLE}
            SET "updatedAt" = datetime('now', 'localtime')
            WHERE "id" = NEW.id;
        END;   
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TRIGGER ${JOB_TABLE.toLowerCase()}_set_update_at`);
    await db.run(`DROP TABLE "${JOB_TABLE}"`);
})
