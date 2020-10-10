/*external modules*/
import _ from 'lodash'
import path from "path";
/*DB*/
import { Migration, Store } from "../index";
/*other*/
import {logger} from "../../../logger";

enum MigrateCommand {
    Up = 'up',
    Down = 'down',
    Delete = 'delete',
    Create = 'create'
}

/** utils */
function getDiffMigrations(inStore: string[], inDirectory: string[]) {
    return {
        missingMigrations: _.difference(inStore, inDirectory),
        newMigrations: _.difference(inDirectory, inStore)
    }
}

function transformStringMigrations(migrations: string[]): Migration[] {
    return migrations.map(migration => {
        const timestamp = migration.slice(0, _.indexOf(migration, '-'))
        return {
            title: migration,
            timestamp: Number(timestamp)
        }
    })
}

/** work with store */
function saveMigrations(originStore: Store, migrations: Migration[]): Store {
    const store = _.cloneDeep(originStore);

    store.lastRun = _.last(migrations)!.title;
    store.migrations = _.chain(store.migrations)
        .concat(migrations)
        .uniqBy('title')
        .value();

    return store
}

function removeMigrations(originStore: Store, migrations: string[]): Store {
    const store = _.cloneDeep(originStore);

    store.migrations = _.chain(store.migrations)
        .filter(m => !_.includes(migrations, m.title))
        .sort((a, b) => (a.timestamp - b.timestamp))
        .value()
    store.lastRun = _.last(store.migrations)?.title ?? '';

    return store
}

/** work with DB */
function migrateAction(type: MigrateCommand.Up | MigrateCommand.Down) {
    return async function (migrations: string[], dirPath: string) {
        const migrationsToAction = transformStringMigrations(migrations)
            .sort((a, b) => {
                return type === MigrateCommand.Down
                    ? b.timestamp - a.timestamp
                    : a.timestamp - b.timestamp
            })

        for(let migration of migrationsToAction) {
            const migrationPath = path.resolve(dirPath, migration.title);

            logger.debug(`Migration ${_.upperFirst(type)}: ${migration.title}`)

            const exports = require(migrationPath);
            const functionToSetup = exports[type];

            await functionToSetup();
        }

        return migrationsToAction
    }
}

const upMigrations = migrateAction(MigrateCommand.Up);
const downMigrations = migrateAction(MigrateCommand.Down);

export {
    transformStringMigrations,
    getDiffMigrations,
    saveMigrations,
    removeMigrations,
    upMigrations,
    downMigrations
}