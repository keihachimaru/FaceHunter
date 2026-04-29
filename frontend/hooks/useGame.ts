import { useEffect, useState, useRef } from 'react';
import { getsocket } from '@/services/gameSocket';
import { API } from '@/constants/API';
import { usePlayerStore } from '@/stores/usePlayerStore';
import * as ScreenOrientation from 'expo-screen-orientation';

export const useGame = ( gameToken, setShotMessages, setPhase, setCurrentCandidate, setLeaderboard ) => {
    const [gameInfo, setGameInfo] = useState(null);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [fired, setFired] = useState(false);
    const [dead, setDead] = useState(false);
    const [candidates, setCandidates] =  useState([]);
    const [cooldown, setCooldown] = useState(false);
    const { player, setPlayer } = usePlayerStore();
    
    const socketRef = useRef(null);

    const handleGameState = ({ game, otherPlayers }) => {
      console.log('setting game state');
      setOtherPlayers(otherPlayers);
      setGameInfo(game);
    };
    
    const handleShotEvent = ({ event }) => {
        if(player.player._id == event.targetID) {
            setDead(true);
        }
        else if(player.player._id == event.shooterID) {
            console.log('U have shot someone');
        }
        setShotMessages(prev => [...prev, event]);
        setTimeout(() => {
            setShotMessages(prev => prev.filter(p=>p.shotID!=event.shotID));
        }, 3000);
    };

    const handleHighlightCandidates = ({ candidates }) => {
        console.log('Received highlight candidates');
        setCandidates(candidates);
        setCurrentCandidate({idx: 0, candidate: candidates[0]});
        setPhase('voting');
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };

    const handleVotingEnded = ({ leaderboard }) => {
        console.log('Received leaderboard')
        setLeaderboard(leaderboard);
        setPhase('leaderboard');
    };

    useEffect(() => {
        if(!gameToken) return;
        (async () => {
            const socket = getsocket();
            socketRef.current = socket;
            socket.emit('requestGameState', { token: gameToken });

            socket.on('game-state', handleGameState);
            socket.on('shot-event', handleShotEvent);
            socket.on('highlight-candidates', handleHighlightCandidates);
            socket.on('voting-ended', handleVotingEnded);

        })();

        return () => {
            if(socketRef.current) {
                const socket = socketRef.current;
                socket.off('game-state', handleGameState);
                socket.off('shot-event', handleShotEvent);
                socket.off('highlight-candidates', handleHighlightCandidates);
                socket.disconnect();
            }
        };
    }, [gameToken]);
    
    const votingDone = async (gameToken) => {
        const socket = socketRef.current;
        console.log('Voting done ...');
        socket.emit('votingDone', {
            token: gameToken,
        })
    }

    const voteShot = async (gameToken, shotID ) => {
        const socket = socketRef.current;
        if(!socket || !gameToken || !shotID ) return;
        console.log('Voting shot ...');
        socket.emit('voteShot', {
            token: gameToken,
            shotId: shotID,
        })
    }

    const fireShot = async (gameToken, uri, playerId)=> {
        const socket = socketRef.current;
        if(!socket || !gameToken || !uri || !playerId) return;
        console.log('Firing shot ...');
        const message = {
            token: gameToken,
            uri: uri,
        }
        
        const data = new FormData();
        data.append('file', {
            uri,
            name: `${playerId}.jpeg`,
            type: 'image/jpeg',
        });
        data.append('uploader', playerId);

        const res = await fetch(`${API}/player/identify`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${gameToken}`,
            },
            body: data,
        });

        if(!res.ok) {
            const data = await res.json()
            throw new Error(data.message || 'Failed to identify face');
        }
        
        const shotObj = await res.json();
        setFired(false);
        setCooldown(false);

        if(shotObj.shot) {
            socket.emit('shoot', shotObj.shot._id);
        }
    };
    
    return { 
        gameInfo, 
        otherPlayers, 
        cooldown, 
        fired, 
        fireShot, 
        setFired, 
        setCooldown, 
        dead, 
        setDead, 
        candidates, 
        voteShot,
        votingDone,
    };
}
