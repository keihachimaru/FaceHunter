import { useEffect, useState, useRef } from 'react';
import { initSocket } from '@/services/chatSocket.ts';

export const useChat = (user, otherUserId) => {
    const [messages, setMessages] = useState([]);
    const userId = user?.id;
    const socketRef = useRef(null);

    useEffect(() => {
        if(!userId || !otherUserId) return;

        const roomId = [userId, otherUserId].sort().join('_');
        (async () => {
            const socket = await initSocket();

            await new Promise((resolve) => {
              if(socket.connected) return resolve(null);
              socket.once('connect', resolve);
            });
            
            socketRef.current = socket;
            socket.emit('joinChat', otherUserId );

            socket.on('chatHistory', (history) => {
                setMessages(history);
            });

            socket.on('messageReceived', (messageId) => {
                console.log('Message received by other user:', messageId);
            });

            socket.on('messageRead', (messageId) => {
                console.log('Message read by other user:', messageId);
            });

            socket.on('newMessage', (msg) => {
                console.log('New message : ', JSON.stringify(msg));
                setMessages((prev) => [...prev, msg]);
            });

            socket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });
        })();

        return () => {
            if (socketRef.current) {
                const socket = socketRef.current;
                socket.off('chatHistory');
                socket.off('newMessage');
                socket.off('messageReceived');
                socket.off('messageRead');
                socket.disconnect();
            }
        };
    }, [user, otherUserId]);

    const sendMessage = (receiptId, content) => {
        const socket = socketRef.current;
        if(!socket || !userId || !otherUserId) return;
        const roomId = [userId, otherUserId].sort().join('_');
        if(!socket) return;
        const message = [ receiptId, content ];
        socket.emit('dm', message);
    };

    return { messages, sendMessage };
};
