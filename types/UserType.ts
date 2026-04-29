import { BulletType } from './BulletType.ts';
import { WeaponType from './WeaponType.ts';
import { ClassType } from './ClassType.ts';

export interface HomeUserType { 
    name: string;
    profilePic: string;
    unreadMessages: int;
}
export interface FriendType {
    username: string;
    profilePic: string;
    isFriend: boolean;
    distance?: int;
    id: int;
}
export interface ChatUserType {
    name: string;
    profilePic?: string;
    id: int;
}
export interface PlayerType {
    class: ClassType;
    weapon: WeaponType;
    bullets: BulletType;
    credits: int;
}
export interface GamePlayerType {
    health: int;
    bullets: BulletType[];
    weapon: WeaponType;
    isDead: boolean;
    kills: GamePlayerType;
}

