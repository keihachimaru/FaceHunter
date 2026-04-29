import { ClassType } from './ClassType.ts';
import { WeaponType } from './WeaponType.ts';
import { BulletType } from './BulletType.ts';

export interface FriendGameType {
    name: string;
    rounds: int;
    time: int;
    playerCount: int;
    description: string;
    gameID: int;
}
export interface JoinGameType {
    classes: ClassType[];
    weapons: WeaponType[];
    bullets: BulletType[];
    creditLimit: int;
}
export interface GameOptsType {
    rounds: int;
    time: int;
    name: string;
    evalMode: string;
    desc: string;
}
export interface CreateGameType {
    optns: GameOptsType;
    numPlayers: int;
    notifyPlayers: boolean;
}
