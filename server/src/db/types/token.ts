import {sql} from "../sql";

export const TOKEN_TABLE = 'Token';
export const $TokenTable = sql.table(TOKEN_TABLE);

export interface Token {
    id: number;
    data: string;
    createdAt: Date;
}