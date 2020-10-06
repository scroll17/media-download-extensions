import {PostingLocation, PostingUsertags} from "instagram-private-api/dist/types/posting.options";

export const PHOTO_TABLE = 'Photo';

export interface Photo {
    id: number;
    fileName: string;
    caption: string;

    usertags?: PostingUsertags;
    location?: PostingLocation;
}