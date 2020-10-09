import {sql} from "../sql";

export const FILE_TABLE = 'File';
export const $FileTable = sql.table(FILE_TABLE);

export enum FileType {
    Video = 'video',
    Story = 'story',
    Photo = 'photo'
}

export interface File {
    id: number;
    userId: number;

    type: FileType;

    published: number;
    approved: number;
    desiredTime: Date;

    messageIds?: string;

    videoId?: number;
    storyId?: number;
    photoId?: number;

    createdAt: Date;
    updatedAt: Date;
}