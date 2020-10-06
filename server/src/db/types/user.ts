import {sql} from "../sql";

export const USER_TABLE = 'User';
export const $UserTable = sql.table(USER_TABLE);

export interface User {
    id: string;
    tokenId: string;
    name: string;

    createdAt: Date;
    updatedAt: Date;
}