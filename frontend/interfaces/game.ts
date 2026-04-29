export interface playerType {
    health: number,
    maxHealth?: number,
    class: string,
    weapon: string,
    bullets: string[],
    credits: number,
}

export interface bulletType {
    dmg: number,
}

export interface weaponType {
    scope: string,
    zoom: number,
}

export interface shotMessageType {
    shooterID: number,
    shotID: number,
    targetID: number,
    valid: boolean,
    time: string,
}

export interface gamemodeType {
    name: string,
}

export interface highlightType {
    image: string,
    time: string,
    targetID: number,
    shooterID: number,
    id: number,
}

export interface highlightCandidateType {
    shotID: number,
    votes: number,
    image: string,
}

