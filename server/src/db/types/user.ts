import {sql} from "../sql";

export const USER_TABLE = 'User';
export const $UserTable = sql.table(USER_TABLE);

export interface User {
    id: number;
    tokenId?: number;

    telegramId: number;
    chatId: number;

    name: string;
    username?: string;

    createdAt: Date;
    updatedAt: Date;
}