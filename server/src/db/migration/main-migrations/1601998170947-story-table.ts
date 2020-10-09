import { runInMainDB } from "../index";
import {STORY_TABLE} from "../../types/story";
import {PHOTO_TABLE} from "../../types/photo";
import {VIDEO_TABLE} from "../../types/video";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
         CREATE TABLE "${STORY_TABLE}" (
            "id"            INTEGER PRIMARY KEY,
            
            "videoId"       INTEGER,
            "imageId"       INTEGER,
            
            "caption"       TEXT                DEFAULT NULL,
            "link"          TEXT                DEFAULT NULL,
            
            CHECK (("videoId" NOT NULL) OR ("imageId" NOT NULL)),
            
            FOREIGN KEY ("videoId")
                REFERENCES "${VIDEO_TABLE}" ("id")
                    ON DELETE RESTRICT,
            FOREIGN KEY ("imageId")
                REFERENCES "${PHOTO_TABLE}" ("id")
                    ON DELETE RESTRICT                          
          );
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TABLE ${STORY_TABLE}`)
})
