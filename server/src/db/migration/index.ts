/*external modules*/
import _ from 'lodash'
import path from "path";
import { promises as fs, existsSync } from 'fs'
/*DB*/
import { mainDB } from "../index";
/*utils*/
import {
    downMigrations,
    getDiffMigrations,
    removeMigrations,
    saveMigrations,
    transformStringMigrations,
    upMigrations
} from "./utils";
import {run} from "./utils/run";
/*other*/
import {logger} from "../../logger";

/**
 *  migrations.json
 * {
 *   [dbname]: {
 *       lastRun: string; -> last up migration
 *       migrations: Array<{ title: string; timestamp: number; }>; -> all migrations
 *   }
 * }
 * */

/**
 *      Strategy:
 *        - Check missing migrations (have in Store but not exist in Dir).
 *        - Check args paths in migration directory.
 *
 *        1. Create
 *          - Check migration template for existence.
 *        2. Up
 *          - If "paths" and "newMigrations" (migrations that are in the directory but not in the Store) empty -> return (already upped).
 *          - If "paths" empty - then up all "newMigrations".
 *          - If "paths" not empty - then:
 *              1. find migrations with max "timestamp" in "paths"
 *              2. filter "newMigrations" by "timestamp" <= max "timestamp"
 *              3. if migrations to up is empty -> then return (already upped)
 *              4. up migrations
 *          - Save upped migrations to Store.
 *        3. Down
 *          - If "migrations" in Store is empty -> return (already down).
 *          - If "paths" empty - then down all migrations from Store.
 *          - If "paths" not empty - then:
 *              1. find migrations with min "timestamp" in "paths"
 *              2. filter "migrations" in Store by "timestamp" >= min "timestamp"
 *              3. if migrations to down is empty -> return (already down)
 *              4. down migrations
 *          - Remove down migrations from Store.
 *        4. Delete
 *          - If "paths" is empty -> return (no provided data).
 *          - If "paths" includes in active "migrations" -> error (need down first).
 *          - Unlink (delete) files by "paths".
 *        5. List
 *          - Show all active migrations
 *
 * */

export const runInMainDB = run(mainDB);

export enum MigrateCommand {
    Up = 'up',
    Down = 'down',
    Delete = 'delete',
    Create = 'create',
    List = 'list'
}

export enum Databases {
    Main = 'main'
}

const MIGRATION_TEMPLATE_PATH = path.resolve(__dirname, 'template.js')
const MIGRATION_STORE_PATH = path.resolve(__dirname, 'migrations.json')

export type Migration = { title: string; timestamp: number; };
export type Store = { lastRun: string; migrations: Migration[] }
type Migrations = Record<Databases, Store>

export async function execMigrate(cmd: MigrateCommand, DBName: Databases, paths: string[]) {
    if(_.isEmpty(DBName)) {
        throw new Error('DB name must be not empty.')
    }

    const storeExist = existsSync(MIGRATION_STORE_PATH)

    let store: Migrations;
    if(storeExist) {
        const storeJSON = await fs.readFile(MIGRATION_STORE_PATH, { encoding: 'utf-8' });
        store = JSON.parse(storeJSON);
    } else {
        store = {
            [DBName]: {
                lastRun: '',
                migrations: []
            }
        }
        await fs.writeFile(MIGRATION_STORE_PATH, JSON.stringify(store), { encoding: 'utf-8' })
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
        case MigrateCommand.Up: {
            let migrationsToSave: Migration[];

            if(paths.length === 0) {
                if(_.isEmpty(newMigrations)) {
                    logger.debug('Migrations already upped.')
                    return
                }

                migrationsToSave = await upMigrations(newMigrations, migrationsDirPath)
            } else {
                const lastMigrationToUp = _.chain(transformStringMigrations(paths))
                    .maxBy('timestamp')
                    .value()

                const migrationsToUp = _.chain(transformStringMigrations(newMigrations))
                    .filter(m => m.timestamp <= lastMigrationToUp.timestamp)
                    .map('title')
                    .value();

                if(_.isEmpty(migrationsToUp)) {
                    logger.debug('Migrations already upped.')
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
                    logger.debug('Migrations already down.')
                    return
                }

                migrationsToRemove = await downMigrations(
                    _.map(activeStore.migrations, 'title'),
                    migrationsDirPath
                )
            } else {
                const lastMigrationToDown = _.chain(transformStringMigrations(paths))
                    .minBy('timestamp')
                    .value()

                const migrationsToDown = _.chain(activeStore.migrations)
                    .filter(m => m.timestamp >= lastMigrationToDown.timestamp)
                    .map('title')
                    .value()

                if(_.isEmpty(migrationsToDown)) {
                    logger.debug('Migrations already down.')
                    return
                }

                migrationsToRemove = await downMigrations(migrationsToDown, migrationsDirPath);
            }

            activeStore = removeMigrations(activeStore, _.map(migrationsToRemove, 'title'))
            break;
        }
        case MigrateCommand.Delete: {
            if(_.isEmpty(paths)) {
                logger.debug('No provided paths.')
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

                    logger.debug(`Remove: ${filePath}`)
                    await fs.unlink(pathInDir)
                })
            )
            break;
        }
        case MigrateCommand.List: {
            activeStore.migrations
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(migration => {
                    logger.info(migration.title)
                })
            break;
        }
    }

    const storeToSave = {
        ...store,
        [DBName]: activeStore
    }
    await fs.writeFile(MIGRATION_STORE_PATH, JSON.stringify(storeToSave), { encoding: 'utf-8' })
}
