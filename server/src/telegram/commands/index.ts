export { scheduler } from './scheduler'
export { register } from './register'
export { getToken } from './getToken'
export { getId } from './getId'
export { getServerTime } from './getServerTime'
export { getTimeToPublish } from './getTimeToPublish'

export enum Commands {
    Register = 'register',
    Scheduler = 'scheduler',
    GetToken = 'get_token',
    GetId = 'get_id',
    GetTimeToPublish = '/get_time_to_publish',
    GetServerTime = '/get_server_time'
}