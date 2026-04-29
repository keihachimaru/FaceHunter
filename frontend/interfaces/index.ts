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
    password: string;
    username: string;
}
