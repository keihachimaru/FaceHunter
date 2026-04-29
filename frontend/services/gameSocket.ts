import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '@/constants/API';

let socket;

export const initSocket = async (gameId) => {
    console.log('initializating socket',gameId);
    const token = await AsyncStorage.getItem('sessionToken');
    socket = io(`${API}/wsgame`, {
        transports: ['websocket'],
        auth: { token },
        query: { gameId }
   });

    socket.on('connect', () => {
        console.log('connected to game ws');
    });

    socket.on('disconnect', () => {
        console.log('disconnected from game ws');
    });

    return socket;
}

export const getsocket = () => socket;
