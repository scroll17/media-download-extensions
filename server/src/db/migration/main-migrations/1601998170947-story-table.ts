import { runInMainDB } from "../index";
import {STORY_TABLE} from "../../types/story";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
         CREATE TABLE "${STORY_TABLE}" (
            "id"            INTEGER PRIMARY KEY,
            "fileName"      TEXT    NOT NULL,
            "coverImage"    TEXT    NOT NULL,
            
            "caption"       TEXT,
            "link"          TEXT,
            "usertags"      TEXT,
            "location"      TEXT
          );
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TABLE ${STORY_TABLE}`)
})
