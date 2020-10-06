export const FILE_TABLE = 'File';

export enum FileType {
    Video = 'video',
    Story = 'story',
    Photo = 'photo'
}

export interface File {
    id: string;
    userId: string;
    type: FileType;
    published: number;
    approved: number;
    desiredTime: Date;

    videoId: string;
    storyId: string;
    photoId: string;

    createdAt: Date;
    updatedAt: Date;
}