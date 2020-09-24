/*external modules*/
import path from "path";
import _ from 'lodash'
import { promises as fs, existsSync } from 'fs'
/*DB*/
import {DB, mainDB} from "../index";
import {
    downMigrations,
    getDiffMigrations,
    removeMigrations,
    saveMigrations,
    transformStringMigrations,
    upMigrations
} from "./utils";
/*utils*/
/*other*/

/**
 *  migrations.json
 * {
 *   [dbname]: {
 *       lastRun: string; -> last up migration
 *       migrations: Array<{ title: string; timestamp: number; }>; -> all migrations
 *   }
 * }
 * */

export function runInMainDB(cb: (db: DB) => Promise<void>) {
    return async () => {
        try {
            await mainDB.transaction(cb);
        } catch (error) {
            throw error;
        }
    };
}

export enum MigrateCommand {
    Up = 'up',
    Down = 'down',
    Delete = 'delete',
    Create = 'create'
}

export enum Databases {
    Main = 'main'
}

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, 'template.js')

export type Migration = { title: string; timestamp: number; };
export type Store = { lastRun: string; migrations: Migration[] }
type Migrations = Record<Databases, Store>

export async function execMigrate(cmd: MigrateCommand, DBName: Databases, paths: string[]) {
    if(_.isEmpty(DBName)) {
        throw new Error('DB name must be not empty.')
    }

    const jsonStorePath = path.resolve(__dirname, 'migrations.json');
    const storeExist = existsSync(jsonStorePath)

    let store: Migrations;
    if(storeExist) {
        const storeJSON = await fs.readFile(jsonStorePath, { encoding: 'utf-8' });
        store = JSON.parse(storeJSON);
    } else {
        store = {
            [DBName]: {
                lastRun: '',
                migrations: []
            }
        }
        await fs.writeFile(jsonStorePath, JSON.stringify(store), { encoding: 'utf-8' })
    }

    const migrationsDirPath = path.resolve(__dirname, `${DBName}-migrations`);
    const migrationsInDir = await fs.readdir(migrationsDirPath);

    let activeStore: Store = store[DBName];
    const { missingMigrations, newMigrations } = getDiffMigrations(
        _.map(activeStore.migrations, 'title'),
        migrationsInDir
    )

    if(missingMigrations.length) {
        throw new Error(`Missing migrations: [ ${missingMigrations.join(', ')} ]`)
    }

    if(cmd !== MigrateCommand.Create) {
        const missingPathsInMigrationDir = _.difference(paths, migrationsInDir);

        if(missingPathsInMigrationDir.length) {
            throw new Error(`Migrations not exist: [ ${missingPathsInMigrationDir.join(', ')} ]`)
        }
    }

    switch (cmd) {
        case MigrateCommand.Create: {
            const templateExist = existsSync(MIGRATION_TEMPLATE_PATH);
            if(!templateExist) throw new Error(`Migration template not exist.`)

            const template = await fs.readFile(MIGRATION_TEMPLATE_PATH, { encoding: 'utf-8' })

            await Promise.all(
                paths.map(async filePath => {
                    const fileName = Date.now() + '-' + filePath + '.ts';
                    const pathInDir = path.resolve(migrationsDirPath, fileName);

                    await fs.writeFile(pathInDir, template, { encoding: 'utf-8', flag: 'a+' })
                })
            )

            break;
        }
        case MigrateCommand.Delete: {
            if(_.isEmpty(paths)) {
                console.debug('No provided paths.')
                return
            }

            const activeMigrations = _.chain(activeStore.migrations)
                .map('title')
                .filter(m => paths.includes(m))
                .value();
            if(activeMigrations.length) {
                throw new Error(`Migrations is upped: [ ${activeMigrations.join(', ')} ]. \nUse first "down".`)
            }

            await Promise.all(
                paths.map(async filePath => {
                    const pathInDir = path.resolve(migrationsDirPath, filePath);

                    console.debug(`Remove: ${filePath}`)
                    await fs.unlink(pathInDir)
                })
            )
            break;
        }
        case MigrateCommand.Up: {
            let migrationsToSave: Migration[];

            if(paths.length === 0) {
                if(_.isEmpty(newMigrations)) {
                    console.debug('Migrations already upped.')
                    return
                }

                migrationsToSave = await upMigrations(newMigrations, migrationsDirPath)
            } else {
                const lastMigrationToUp = _.chain(transformStringMigrations(paths))
                    .sort((a, b) => (a.timestamp - b.timestamp))
                    .last()
                    .value()

                const migrationsToUp = _.chain(transformStringMigrations(newMigrations))
                    .filter(m => m.timestamp <= lastMigrationToUp.timestamp)
                    .map('title')
                    .value();

                if(_.isEmpty(migrationsToUp)) {
                    console.debug('Migrations already upped.')
                    return
                }

                migrationsToSave = await upMigrations(migrationsToUp, migrationsDirPath)
            }

            activeStore = saveMigrations(activeStore, migrationsToSave);
            break;
        }
        case MigrateCommand.Down: {
            let migrationsToRemove: Migration[];

            if(paths.length === 0) {
                if(_.isEmpty(activeStore.migrations)) {
                    console.debug('Migrations already down.')
                    return
                }

                migrationsToRemove = await downMigrations(
                    _.map(activeStore.migrations, 'title'),
                    migrationsDirPath
                )
            } else {
                const firstMigrationToDown = _.chain(transformStringMigrations(paths))
                    .sort((a, b) => (a.timestamp - b.timestamp))
                    .last()
                    .value()

                const migrationsToDown = _.chain(activeStore.migrations)
                    .filter(m => m.timestamp <= firstMigrationToDown.timestamp)
                    .map('title')
                    .intersection(paths)
                    .value()

                if(_.isEmpty(migrationsToDown)) {
                    console.debug('Migrations already down.')
                    return
                }

                migrationsToRemove = await downMigrations(migrationsToDown, migrationsDirPath);
            }

            activeStore = removeMigrations(activeStore, _.map(migrationsToRemove, 'title'))
            break;
        }
    }

    const storeToSave = {
        ...store,
        [DBName]: activeStore
    }
    await fs.writeFile(jsonStorePath, JSON.stringify(storeToSave), { encoding: 'utf-8' })
}
