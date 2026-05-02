export interface UserType {
    name: string;
    profilePic?: string;
    id: number;
}

export interface FacehuntType {
    id: number;
    imageUrl: string;
    likes: number;
    comments: number;
}

export interface RegisterType {
    email: string;
    password: string;
    username: string;
}

export interface LoginType {
    email: string;
    password: string;
}

export interface Post {
    _id: string;
    imageUrl: string;
    likes: number;
    comments: number;
}

export interface friendType {
    username: string;
    profilePic?: string;
    isFriend: boolean;
    id: number;
}

export interface gamemodeOptionsType {
    name: string;
    numRounds: number;
    roundLength: number;
    teams: string;
    teamLimit: string;
}

export interface gameType {
    gameType: string;
}

export interface messageType {
    content: string;
    image: string;
    link: string;
    id: string;
    senderID: string;
    receiverID: string;
    status: string;
    timestamp: string;
}

export interface playerOptionsType {
    classes: string[];
    weapons: string[];
    bullets: string[];
    creditLimit: number;
}

export interface waitingPlayersType {
    joined: number;
    total: number;
}

export type userType = UserType;

export type facehuntType = import('./facehunt').facehuntType;
export type likeType = import('./facehunt').likeType;
export type commentType = import('./facehunt').commentType;
