import {sql} from "../sql";

export const FILE_TABLE = 'File';
export const $FileTable = sql.table(FILE_TABLE);

export enum FileType {
    Video = 'video',
    Story = 'story',
    Photo = 'photo'
}

export enum FileApprove {
    'NotSeen' = -1,
    'Approved' = 1,
    'Disabled' = 0
}

export interface File {
    id: number;
    userId: number;

    type: FileType;

    published: 0 | 1;
    approved: FileApprove;
    desiredTime: Date;

    messageIds?: Record<string, { messageId: number; }>

    videoId?: number;
    storyId?: number;
    photoId?: number;

    createdAt: Date;
    updatedAt: Date;
}