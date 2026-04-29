export interface friendType {
    username: string;
    profilePic?: string;
    isFriend: boolean;
    id: number;
}

export interface gameType {
    name: string;
    round: number;
    time: number;
    playerCount: number;
    description: string;
    gameID: number;
}
