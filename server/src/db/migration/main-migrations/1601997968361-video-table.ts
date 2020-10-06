import { runInMainDB } from "../index";
import {VIDEO_TABLE} from "../../types/video";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
   await db.run(`
     CREATE TABLE "${VIDEO_TABLE}" (
        "id"            INTEGER PRIMARY KEY,
        "fileName"      TEXT    NOT NULL,
        "coverImage"    TEXT    NOT NULL,
        "caption"       TEXT    NOT NULL,
        
        "usertags"      TEXT,
        "location"      TEXT
      );
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TABLE ${VIDEO_TABLE}`)
})
