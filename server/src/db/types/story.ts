import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";
import {sql} from "../sql";

export const STORY_TABLE = 'Story';
export const $StoryTable = sql.table(STORY_TABLE);

export interface Story {
    id: number;
    videoId: number;
    imageId: number;

    caption?: string;
    link?: string;
}