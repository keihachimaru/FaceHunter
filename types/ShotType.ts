export interface ShotEventType {
    shooterID: int;
    location: int[];
    shotID: int;
    targetID: int;
    valid: boolean;
    time: date;
}
