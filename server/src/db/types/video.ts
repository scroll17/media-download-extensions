import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";

export const VIDEO_TABLE = 'Video';

export interface Video {
    id: string;
    fileName: string;
    coverImage: string;
    caption: string;

    usertags?: PostingUsertags;
    location?: PostingLocation;
}