import { gamemodeOptionsType } from '@/interfaces';
import { API } from '@/constants/API';

const API_BASE = API+'/gamemode'; // change to your backend URL

export async function getGamemodeOptions(): Promise<gamemodeOptionsType | null> {
    try {
        console.log('Getting gamemode options ...')
        const res = await fetch(`${API_BASE}/all`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if(!res.ok) throw new Error('Failed to get gamemode options');
        return await res.json();
    }
    catch(err) {
        concole.error('Failed to get gamemode options : '+err);
        throw err;
    }
}

export async function getGamemodeInfo(gamemode : string) {
    try {
        console.log('Getting details about gamemode : '+gamemode);
        const res = await fetch(`${API_BASE}/get/${gamemode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if(!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Error');
        }
        return await res.json();
    }
    catch(err) {
        throw err;
    }
}

