import { runInMainDB } from "../index";
import { USER_TABLE} from "../../types/user";
import {TOKEN_TABLE} from "../../types/token";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
      CREATE TABLE "${USER_TABLE}" (
        "id"            INTEGER PRIMARY KEY,
        
        "tokenId"       INTEGER,
        
        "telegramId"    INTEGER NOT NULL,
        "chatId"        INTEGER NOT NULL,
        
        "name"          TEXT    NOT NULL,
        "username"      TEXT,
        
        "createdAt"     TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
        "updatedAt"     TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
        
        FOREIGN KEY ("tokenId") 
            REFERENCES "${TOKEN_TABLE}" ("id") 
             ON DELETE SET NULL,
        UNIQUE ("id", "tokenId")
      );
  `);

    await db.run(`
        CREATE TRIGGER ${USER_TABLE.toLowerCase()}_set_update_at
            AFTER UPDATE
            ON ${USER_TABLE}
        BEGIN
            UPDATE ${USER_TABLE}
            SET "updatedAt" = datetime('now', 'localtime')
            WHERE "id" = NEW.id;
        END;   
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TRIGGER ${USER_TABLE.toLowerCase()}_set_update_at`);
    await db.run(`DROP TABLE "${USER_TABLE}"`);
})
