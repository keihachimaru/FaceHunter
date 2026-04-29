import { useEffect, useRef } from 'react';
import { initSocket } from '@/services/chatSocket';

export const useSocketSetup = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const socket = await initSocket();
      socketRef.current = socket;

      socket.on('newMessageAlert', (alert) => {
        console.log('New message alert:', alert);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });
    })();

    return () => {
      if (socketRef.current) {
        const socket = socketRef.current;
        socket.off('newMessageAlert');
        socket.disconnect();
      }
    };
  }, [userId]);
};
