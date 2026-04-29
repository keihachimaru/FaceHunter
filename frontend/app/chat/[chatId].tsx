import React, { useEffect, useState, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TextInput, Image, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSession } from '@/services/authService';
import { getOtherUserData } from '@/services/chatService';
import { userType, messageType } from '@/interfaces';
import { Colors } from '@/constants/Colors';
import ImmersiveMode from 'react-native-immersive';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import ChatHeader from '@/components/layout/ChatHeader';
import Keyboard from '@/components/ui/Keyboard';
import MessagesList from '@/components/layout/MessagesList';
import LoadingScreen from '@/components/layout/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChat } from '@/hooks/useChat';

type ChatListItem =
    | { type: 'date'; date: string }
    | (messageType & { type: 'message' });

export default function Chat() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { chatId } = useLocalSearchParams();

    const [session, setSession] = useState<number | null>(null);
    const [user, setUser] = useState<userType | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherUser, setOtherUser] = useState<userType | null>(null);
    const { messages, sendMessage } = useChat(user, chatId as string);

    useEffect(() => {
        ImmersiveMode.on();
        return () => ImmersiveMode.off();
    }, []);

    useEffect(() => {
        async function load() {
            const token = await AsyncStorage.getItem('sessionToken');
            console.log('Validating token ...');
            if(token) {
                try {
                    const sess = await getSession(token);
                    setSession(token);

                    const userData = sess;
                    setUser(userData);
                    

                    const otherUserData = await getOtherUserData(userData, chatId as string);
                    setOtherUser(otherUserData);
                }
                catch(err) {
                    await AsyncStorage.removeItem('sessionToken');
                    setSesion(null);
                    setUser(null);
                    router.replace('/');
                }
            }
            else {
                router.replace('/');
            }
            setLoading(false);
        }
        load();
    }, []);

    const buildChatList = (): ChatListItem[] => {
        const items: ChatListItem[] = [];
        let lastDate = "";

        messages.forEach(msg => {
            const dateKey = dayjs(msg.createdAt).format("YYYY-MM-DD");
            if (dateKey !== lastDate) {
                items.push({ type: "date", date: dateKey });
                lastDate = dateKey;
            }
            items.push({ ...msg, type: "message" });
        });

        return items;
    };

    const handleSend = async (input : string | null) => {
        if (!input.trim() || !user || !otherUser || !sendMessage) return;
        sendMessage(otherUser.id, input.trim());
    };

    if (loading) {
        return (
            <LoadingScreen/>
        );
    }

    return (

        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <ChatHeader otherUser={otherUser} direction="/friends" />

                {/* Chat list */}
                <MessagesList
                    messages={buildChatList()}
                    currentUserID={user.id}
                />

                <Keyboard onSend={handleSend} placeholder="Send a message..."/>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    dateHeader: {
        textAlign: "center",
        marginVertical: 8,
        fontSize: 12,
        color: "#666"
    },
    messageWrapper: {
        maxWidth: "70%",
        padding: 10,
        borderRadius: 10,
        marginVertical: 4,
        marginHorizontal: 10
    },
    ownMessageWrapper: {
        backgroundColor: "#007AFF",
        alignSelf: "flex-end"
    },
    otherMessageWrapper: {
        backgroundColor: "#E5E5EA",
        alignSelf: "flex-start"
    },
    messageText: {
        fontSize: 16
    },
    timestamp: {
        fontSize: 10,
        color: "#555",
        marginTop: 4,
        alignSelf: "flex-end"
    },
    messageImage: {
        width: 150,
        height: 150,
        borderRadius: 10
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderTopWidth: 1
    },
    textInput: {
        flex: 1,
        marginHorizontal: 8,
        padding: 8,
        borderWidth: 1,
        borderRadius: 20
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

