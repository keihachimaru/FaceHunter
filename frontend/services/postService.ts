import { Post } from '../interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/constants/API';

const API_BASE = API + '/facehunts';

export async function topPosts(offset: number, limit: number): Promise<Post[]> {
    try {
        console.log('Requesting top posts ...');
        const token = await AsyncStorage.getItem('sessionToken');

        const res = await fetch(`${API_BASE}/all?offset=${offset}&limit=${limit}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to retrieve posts');
        }

        return await res.json();
    } catch (error) {
        throw error;
    }
}

export async function likePost(id: number): Promise<void> {
    console.log(`Post ${id} liked`);
}
