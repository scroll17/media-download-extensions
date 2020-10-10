export { scheduler } from './scheduler'
export { register } from './register'
export { getToken } from './getToken'

export enum Commands {
    Register = 'register',
    Scheduler = 'scheduler',
    GetToken = 'get_token',
    GetId = 'get_id',
    Approve = 'approve',
    ForApproval = 'for_approval'
}