import { CommentType } from './CommentType.ts';
import { LikeType } from './LikeType.ts';

export interface HomeFaceHuntType {
    image: string;
    likes: string;
    comments: string;
    id: string;
    bookmarked: boolean;
    author: string;
}
export interface FaceHuntType {
    image: string;
    authorID: int;
    authorName: string;
    time: string;
    likes: LikeType[];
    comments: CommentType[];
}
export interface GameFaceHuntType {
    image: string;
    time: string;
    targetID: int;
    shooterID: int;
    fhID: int;
    location: float[];
}
