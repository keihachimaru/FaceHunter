import { userType, messageType } from '../interfaces';

export async function getMessagesData(chatId: string) : Promise<messageType[] | null> {
    return [
    ];
}

export async function getOtherUserData(userData: userType, chatId: string) : Promise<userType | null> {
    return {
    };
}

export async function sendMessage(message: messageType) {
    console.log(`Message sent from ${message.senderID} to ${message.receiverID}`);
}
