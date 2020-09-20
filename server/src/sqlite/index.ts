import sqlite3 from 'sqlite3';
import path from "path";

const dbPath = path.resolve(__dirname, 'db', 'main')


const db = new sqlite3.Database(dbPath, (err) => console.error('Error ->', err));
db.run('select "denis" as name', function (err) {
    console.dir(this)
})