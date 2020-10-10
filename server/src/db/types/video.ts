/*external modules*/
import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";
/*other*/
import {sql} from "../sql";

export const VIDEO_TABLE = 'Video';
export const $VideoTable = sql.table(VIDEO_TABLE);

export interface Video {
    id: number;
    imageId: number;

    fileName: string;
    caption: string;

    usertags?: PostingUsertags;
    location?: PostingLocation;
}