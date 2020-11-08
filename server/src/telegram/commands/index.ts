export { scheduler } from './scheduler'
export { register } from './register'
export { getToken } from './getToken'
export { getId } from './getId'
export { getServerTime } from './getServerTime'
export { getTimeToPublish } from './getTimeToPublish'
export { getServerUrl } from './getServerUrl'
export { getContent } from './getContent'
export { getLogs } from './getLogs'
export { createRedisBackup } from './createRedisBackup'

export enum Commands {
    Register = 'register',
    Scheduler = 'scheduler',
    GetToken = 'get_token',
    GetId = 'get_id',
    GetTimeToPublish = '/get_time_to_publish',
    GetServerTime = '/get_server_time',
    GetServerUrl = '/get_server_url',
    GetContent = '/get_content',
    GetLogs = '/get_logs',
    CreateRedisBackup = '/create_redis_backup'
}