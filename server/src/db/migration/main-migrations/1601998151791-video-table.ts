import { runInMainDB } from "../index";
import {VIDEO_TABLE} from "../../types/video";
import {PHOTO_TABLE} from "../../types/photo";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
   await db.run(`
     CREATE TABLE "${VIDEO_TABLE}" (
        "id"            INTEGER PRIMARY KEY,
        
        "imageId"       INTEGER NOT NULL,
        
        "fileName"      TEXT    NOT NULL,
        "caption"       TEXT    NOT NULL      DEFAULT '',
        
        "usertags"      TEXT    NOT NULL      DEFAULT '{}',
        "location"      TEXT    NOT NULL      DEFAULT '{}',
        
        FOREIGN KEY ("imageId")
           REFERENCES "${PHOTO_TABLE}" ("id")
             ON DELETE RESTRICT                     
      );
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TABLE ${VIDEO_TABLE}`)
})
