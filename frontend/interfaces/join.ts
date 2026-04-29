export interface classType {
    hp: number;
    name: string;
}

export interface weaponType {
    capacity: number;
    zoom: number;
    name: string;
}

export interface bulletType {
    damageMul: number;
    size: number;
    name: string;
}

export interface playerOptionsType {
    classes: string[];
    weapons: string[];
    bullets: string[];
    creditLimit: number;
}

export interface playerType {
    class: string;
    weapon: string;
    bullets: string[];
    credits: number;
}
