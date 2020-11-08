import { runInMainDB } from "../index";
import {FILE_TABLE} from "../../types/file";
import {JOB_TABLE} from "../../types/job";

// Apply changes
module.exports.up = runInMainDB(async (db) => {
    await db.exec(`
        ALTER TABLE "${FILE_TABLE}"
        ADD COLUMN "jobId" INTEGER DEFAULT NULL 
            REFERENCES "${JOB_TABLE}" ("id") 
                ON DELETE SET NULL
    `)
});

// Rollback changes
module.exports.down = runInMainDB(async (db) => {

})
