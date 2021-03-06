import { runInMainDB } from "../index";
import {PHOTO_TABLE} from "../../types/photo";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
         CREATE TABLE "${PHOTO_TABLE}" (
            "id"            INTEGER PRIMARY KEY,
            
            "fileName"      TEXT    NOT NULL,
            "caption"       TEXT    NOT NULL     DEFAULT '',
            
            "usertags"      TEXT    NOT NULL     DEFAULT '{}',
            "location"      TEXT    NOT NULL     DEFAULT '{}'
          );
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TABLE ${PHOTO_TABLE}`)
})
