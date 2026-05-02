export interface facehuntType {
    hunt: string;
    author: number;
    time: string;
}

export interface likeType {
    author: number;
}

export interface commentType {
    author: number;
    username?: string;
    comment: string;
    profilePic?: string;
    id?: number;
}
