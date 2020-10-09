import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";
import {sql} from "../sql";

export const PHOTO_TABLE = 'Photo';
export const $PhotoTable = sql.table(PHOTO_TABLE);

export interface Photo {
    id: number;
    fileName: string;
    caption: string;

    usertags?: PostingUsertags;
    location?: PostingLocation;
}