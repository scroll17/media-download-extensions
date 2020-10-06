import { runInMainDB } from "../index";
import {TOKEN_TABLE} from "../../types/token";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
  await db.run(`
      CREATE TABLE "${TOKEN_TABLE}" (
        "id"              INTEGER PRIMARY KEY,
        "data"            TEXT    NOT NULL,
        
        "createdAt"       TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
        
        UNIQUE ("data")
      );
  `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`DROP TABLE "${TOKEN_TABLE}"`);
})
