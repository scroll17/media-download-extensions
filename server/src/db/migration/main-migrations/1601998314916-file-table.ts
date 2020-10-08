import { runInMainDB } from "../index";
import {FILE_TABLE} from "../../types/file";
import {USER_TABLE} from "../../types/user";
import {VIDEO_TABLE} from "../../types/video";
import {STORY_TABLE} from "../../types/story";
import {PHOTO_TABLE} from "../../types/photo";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
        CREATE TABLE ${FILE_TABLE} (
            "id"            INTEGER PRIMARY KEY,
            "userId"        INTEGER NOT NULL,
            "type"          TEXT    NOT NULL,
            "published"     INTEGER NOT NULL        DEFAULT 0,
            "approved"      INTEGER NOT NULL        DEFAULT 0,
            "desiredTime"   TEXT    NOT NULL,
            
            "messageId"     INTEGER                 DEFAULT NULL,
            
            "videoId"       INTEGER                 DEFAULT NULL,
            "storyId"       INTEGER                 DEFAULT NULL,
            "photoId"       INTEGER                 DEFAULT NULL,
            
            "createdAt"     TEXT    NOT NULL        DEFAULT (datetime('now', 'localtime')),
            "updatedAt"     TEXT    NOT NULL        DEFAULT (datetime('now', 'localtime')),
            
            CHECK (datetime("desiredTime",'unixepoch') > strftime('%s','now')),
            
            FOREIGN KEY ("userId")
               REFERENCES ${USER_TABLE}("id")
                 ON DELETE CASCADE, 
                 
            FOREIGN KEY ("videoId")    
               REFERENCES ${VIDEO_TABLE}("id")     
                 ON DELETE RESTRICT, 
            FOREIGN KEY ("storyId")    
               REFERENCES ${STORY_TABLE}("id")     
                 ON DELETE RESTRICT,           
            FOREIGN KEY ("photoId")    
               REFERENCES ${PHOTO_TABLE}("id")     
                 ON DELETE RESTRICT                     
        )
    `);

    await db.run(`
        CREATE TRIGGER ${FILE_TABLE.toLowerCase()}_set_update_at
            AFTER UPDATE
            ON ${FILE_TABLE}
        BEGIN
            UPDATE ${FILE_TABLE}
            SET "updatedAt" = datetime('now', 'localtime')
            WHERE "id" = NEW.id;
        END;   
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TRIGGER ${FILE_TABLE.toLowerCase()}_set_update_at`);
    await db.run(`DROP TABLE "${FILE_TABLE}"`);
})
