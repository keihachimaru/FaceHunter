import { userType } from '../interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/constants/API';

const API_BASE = API+'/auth'; // change to your backend URL

let token: string | null = null;

export async function logout() {
    try {
        await AsyncStorage.removeItem('sessionToken');
    }
    catch(err) {
        console.error('Logout failed : ', err);
    }
}

export async function register(dto: { email: string; password: string; name: string }) {
  try {
    console.log('Sending register request', dto);
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error( data.message || 'Registration failed');
    }
    return await res.json();
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

export async function login(dto: { email: string; password: string }) {
  try {
    console.log('Sending login request', dto);
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    
    console.log('Response status:', res.status);
    if (!res.ok) {
        const data = await res.json();
        throw new Error( data.message || 'Login failed');
    }

    const data = await res.json();
    token = data.token; // store JWT
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getSession(token: string): Promise<userType> {
      if (!token) throw new Error('No session token found');

      try {
        console.log('Validating token');
        const res = await fetch(`${API_BASE}/session`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error('Failed to get session');
        return await res.json();
      } catch (err) {
        throw err;
      }
}
