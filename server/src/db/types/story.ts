import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";
import {sql} from "../sql";

export const STORY_TABLE = 'Story';
export const $StoryTable = sql.table(STORY_TABLE);

export type Story = {
    id: number;

    caption?: string;
    link?: string;
} & ({ videoId?: number; } | { imageId?: number;})