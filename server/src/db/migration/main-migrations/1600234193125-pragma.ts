import { runInMainDB } from "../index";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.run(`
        PRAGMA foreign_keys = ON;
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {
    await db.run(`
        PRAGMA foreign_keys = OFF;
    `)
})
