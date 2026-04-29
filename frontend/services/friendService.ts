import { friendType, gameType } from '../interfaces';
import { API } from '@/constants/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = API+'/users'; // change to your backend URL

export async function blockFriend(id: string): Promise<any | null> {
    try {
        console.log('Unfriending...');
        const token = await AsyncStorage.getItem('sessionToken');

        const res = await fetch(`${API_BASE}/remove-friend`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ friendId: id })
        });

        if(!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to unfriend');
        }

        return await res.json();
    }
    catch(error) {
        throw error;
    }
}

export async function getFriends(token : string): Promise<FriendType[]> {
    try {
        console.log('Getting friends ...');
        const res = await fetch(`${API_BASE}/friends`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if(!res.ok) {
            const text = await res.text();
            throw new Error('Failed to get session : '+text);
        }
        return await res.json();
    }
    catch(err) {
        console.error('Error getting friends : ', err);
        return []
    }
}

