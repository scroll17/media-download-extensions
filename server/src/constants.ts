import path from 'path'

export namespace Constants {
    export const DBDateTime = 'YYYY-MM-DD HH:mm:ss'
    export const LocalTime = 'DD.MM.YYYY, HH:mm:ss'

    export const BotName = 'insta_publisher_bot'
    export const LogPath = path.resolve(__dirname, '../', 'server.log')
}