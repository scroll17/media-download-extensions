import {sql} from "../sql";

export const STORY_TABLE = 'Story';
export const $StoryTable = sql.table(STORY_TABLE);

export type Story = ({ videoId: number } | { imageId: number }) & {
    id: number;

    caption?: string;
    link?: string;
}