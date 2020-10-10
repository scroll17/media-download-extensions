export { scheduler } from './scheduler'
export { register } from './register'
export { getToken } from './getToken'
export { getId } from './getId'

export enum Commands {
    Register = 'register',
    Scheduler = 'scheduler',
    GetToken = 'get_token',
    GetId = 'get_id'
}