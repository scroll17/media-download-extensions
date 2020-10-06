import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";

export const STORY_TABLE = 'Story';

export interface Story {
    id: number;
    fileName: string;
    coverImage: string;

    caption?: string;
    link?: string;
    usertags?: PostingUsertags;
    location?: PostingLocation;
}