interface MessageType {
    content: string;
    image: string;
    messageID: int;
    senderID: int;
    receiverID: int;
    date: string;
}
interface MessageStatus {
    messageID: int;
    sent: boolean;
    read: boolean;
}
