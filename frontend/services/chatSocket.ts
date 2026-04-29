import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/constants/API';

let socket;

export const initSocket = async () => {
    const token = await AsyncStorage.getItem('sessionToken');
    socket = io(`${API}/wschat`, {
        transports: ['websocket'],
        auth: { token },
    });

    socket.on('connect', () => {
        console.log('Connected to WS');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WS');
    });

    return socket;
}

export const getSocket = () => socket;
