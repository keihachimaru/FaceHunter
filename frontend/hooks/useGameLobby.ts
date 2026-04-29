import { useEffect, useState, useRef } from 'react';
import { initSocket } from '@/services/gameSocket.ts';
import { usePlayerStore } from '@/stores/usePlayerStore';

export const useGameLobby = (gameId) => {
    const [numPlayers, setNumPlayers] = useState(0);
    const [numReady, setNumReady] = useState(0);
    const [gameToken, setGameToken] = useState(null);
    const { player, setPlayer, clearPlayer } = usePlayerStore();

    const socketRef = useRef(null);

    useEffect(() => {
        if(!gameId) return;
        (async () => {
            const socket = await initSocket(gameId);

            await new Promise((resolve) => {
              if(socket.connected) return resolve(null);
              socket.once('connect', resolve);
            });

            socketRef.current = socket;
            socket.emit('join');

            socket.on('gameJoin', ({ player, token }) => {
                console.log('Successfully joined game');
                setPlayer({
                    player: player,
                    gameToken: token
                });
                setGameToken(token);
            });

            socket.on('playerJoined', ({player, total}) => {
                console.log(`Player ${player} joined`);
                setNumPlayers(total);
            });

            socket.on('playerReady', ({ ready, total }) => {
                console.log('New player ready');
                setNumReady(ready);
                setNumPlayers(total);
            });
        })();

        return () => {
            if (socketRef.current) {
                const socket = socketRef.current;
                socket.off('gameJoin');
                socket.off('playerJoined');
                socket.off('playerReady');
                //We dont disconnet here, we disconnect after game is done
            }
        }
    }, [gameId]);

    const playerReady = () => {
        const socket = socketRef.current;
        if(!socket) return;
        socket.emit('ready', { token: gameToken });
    };

    return { playerReady, numPlayers, numReady, player, gameToken }
}

