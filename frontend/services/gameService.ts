import { playerType, playerOptionsType, classType, gameType, userType } from '@/interfaces';
import { API } from '@/constants/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = API+'/game'; // change to your backend URL

export async function notifyFriends(gameId: string) {
    console.log(`Notifying friends about game ${gameId}`)
}

export async function createGame(game: gameType) : Promise<string> {
    let token: string = await AsyncStorage.getItem('sessionToken');
    try {
        console.log('Creating game : ', game);
        const res = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(game),
        });
        if(!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to create game: ${res.status} ${errorText}`);
        };
        
        return await res.text();
    }
    catch(err) {
        console.error('Failed to create game : '+err);
    }
}

export async function joinGame(id: string) {
    let token: string = await AsyncStorage.getItem('sessionToken');
    try {
        console.log('Joining game : ', id);
        const res = await fetch(`${API_BASE}/join/${id}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if(!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to join game: ${res.status} ${errorText}`);
        };
        return await res.json();
    }
    catch(err) {
        console.log(err);
        throw err;
    }
}

export async function getPlayerOptions(gamemode: number): Promise<playerOptionsType | null> {
  return {
    classes: [
      { name: "Class 1" },
      { name: "Class 2" },
    ],
    weapons: [
      { name: "Weapon 1" },
      { name: "Weapon 2" },
      { name: "Weapon 3" },
    ],
    bullets: [
      { name: "Bullet 1" },
      { name: "Bullet 2" },
    ],
    creditLimit: 1000,
  };
}

export async function initPlayer() {
    return {
        credits: 100,
    }
}

export async function getGamemode(id: number) {
    return 1;
}

export async function getWaitingPlayers(id: number) {
    console.log(`Get waiting players for game ${id}`);
    return {
        waiting: 3,
        total: 7,
    };
}

export async function gameStarted(id: number) {
    console.log(`Has started game ${id}`);
    return false;
}

export const getScopeImage = (playerClass: string): string => {
  const mockScopes: Record<string, string> = {
    sniper: 'https://picsum.photos/seed/sniper/400/400',
    assault: 'https://picsum.photos/seed/assault/400/400',
    medic: 'https://picsum.photos/seed/medic/400/400',
  };
  return mockScopes[playerClass] ?? 'https://picsum.photos/seed/default/400/400';
};

export async function getGameStatus(gameId: string): Promise<{
    timeRemaining: number;
    round: number;
    gamemode: gamemodeType;
    isGameOver: boolean;
}> {
    return {
        timeRemaining: 30, // seconds
        round: 1,
        gamemode: { name: 'Deathmatch' },
        isGameOver: false,
    };
}

export async function getShotMessages(gameId: string): Promise<{
    shooterID: number;
    shotID: number;
    targetID: number;
    valid: boolean;
    time: string;
}[]> {
    return [
        { shooterID: 3, shotID: 101, targetID: 2, valid: true, time: new Date().toISOString() },
        { shooterID: 2, shotID: 102, targetID: 4, valid: false, time: new Date().toISOString() },
    ];
}

export async function getHighlightCandidates(gameId: string): Promise<highlightCandidateType[]> {
    return [
        { shotID: 101, votes: 5, image: 'https://picsum.photos/seed/100/100' },
        { shotID: 102, votes: 3, image: 'https://picsum.photos/seed/200/200'},
        { shotID: 102, votes: 3, image: 'https://picsum.photos/seed/300/300'},
        { shotID: 102, votes: 3, image: 'https://picsum.photos/seed/400/400'},
        { shotID: 102, votes: 3, image: 'https://picsum.photos/seed/500/500'},
    ];
}

export async function getTopHighlights(gameId: string): Promise<highlightType[]> {
    return [
        {
            id: 1,
            shooterID: 1,
            targetID: 2,
            image: 'https://picsum.photos/seed/100/100',
            time: new Date().toISOString(),
        },
        {
            id: 2,
            shooterID: 3,
            targetID: 4,
            image: 'https://picsum.photos/seed/200/200',
            time: new Date().toISOString(),
        },
        {
            id: 3,
            shooterID: 4,
            targetID: 1,
            image: 'https://picsum.photos/seed/300/300',
            time: new Date().toISOString(),
        },
        {
            id: 4,
            shooterID: 2,
            targetID: 3,
            image: 'https://picsum.photos/seed/400/400',
            time: new Date().toISOString(),
        },
    ];
}
