export function getChatRoomName(userID1: string, userID2: string) {
    const sortedIDs = [ userID1, userID2 ].sort();

    return `${sortedIDs[0]}_${sortedIDs[1]}`;
}
