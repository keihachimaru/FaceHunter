import { playerType, gamemodeType, highlightCandidateType, highlightType } from '@/interfaces/game';
import { API } from '@/constants/API';

const API_BASE = API+'/player'; // change to your backend URL

export async function uploadPicture(gameToken: string, uri: string, playerId: string) {
    try {
        console.log('Uploading picture for '+playerId);
        const data = new FormData();
        data.append('file', {
            uri,
            name: `$${playerId}.jpg`,
            type: 'image/jpeg',
        });
        data.append('uploader', playerId);

        const res = await fetch(`${API_BASE}/upload-picture/${playerId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${gameToken}`,
            },
            body: data,
        });

        if(!res.ok) {
            const data = await res.json()
            throw new Error(data.message || 'Failed to upload image');
        }

        return await res.json();
    }
    catch(err) {
        throw err;
    }
}


export async function getPlayerData() : Promise<playerType> {
    return {
            id: 2,
            maxHealth: 100,
            health: 0,
            name: 'Mark',
            class: 'assault',
            weapon: 'rifle',
            bullets: ['normal', 'normal', 'normal'],
            credits: 5000,
    };
}
export async function getOtherPlayersData(): Promise<playerType[]> {
    return [
        {
            id: 2,
            health: 25,
            maxHealth: 100,
            name: 'Mark',
            class: 'assault',
            weapon: 'rifle',
            bullets: ['normal', 'normal', 'normal'],
            credits: 5000,
        },
        {
            id: 3,
            health: 75,
            maxHealth: 100,
            name: 'Claire',
            class: 'medic',
            weapon: 'pistol',
            bullets: ['normal', 'healing'],
            credits: 7200,
        },
        {
            id: 4,
            health: 10,
            maxHealth: 100,
            name: 'Max',
            class: 'medic',
            weapon: 'pistol',
            bullets: ['normal', 'healing'],
            credits: 7200,
        },
        {
            id: 5,
            health: 90,
            maxHealth: 100,
            name: 'John',
            class: 'medic',
            weapon: 'pistol',
            bullets: ['normal', 'healing'],
            credits: 7200,
        },
        {
            id: 6,
            health: 50,
            maxHealth: 100,
            name: 'Char',
            class: 'medic',
            weapon: 'pistol',
            bullets: ['normal', 'healing'],
            credits: 7200,
        },
    ];
}


    
