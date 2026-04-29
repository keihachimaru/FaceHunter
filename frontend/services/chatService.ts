import { userType, messageType } from '../interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/constants/API';

const API_BASE = API+'/users'; // change to your backend URL

export async function getOtherUserData(userData: userType, chatId: string) : Promise<userType> {
    try {
        console.log('Getting other user data ...');
        const res = await fetch(`${API_BASE}/chat/${chatId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if(!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Error');
        }

        const data = await res.json();
        return data;
    }
    catch(err) {
        throw err;
    };
}
