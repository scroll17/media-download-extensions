export const FILE_TABLE = 'File';

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

    messageId: number;

    videoId: number;
    storyId: number;
    photoId: number;

    createdAt: Date;
    updatedAt: Date;
}