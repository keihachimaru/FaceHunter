import React, { useEffect, useState } from 'react';
import { Pressable, View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { getSession } from '@/services/authService';
import { getFriends } from '@/services/friendService';
import { userType, friendType } from '@/interfaces';
import { Colors } from '@/constants/Colors';
import { enableImmersive, disableImmersive } from '@/utils/immersive';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GoBackButton from '@/components/ui/GoBackButton';
import FriendCard from '@/components/ui/FriendCard';
import LoadingScreen from '@/components/layout/LoadingScreen';

export default function Friends() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.light : Colors.light;

  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendsList, setFriendsList] = useState<friendType[]>([]);

  useEffect(() => {
    enableImmersive();

    return () => {
      disableImmersive();
    };
  }, []);

  useEffect(() => {
    async function load() {
      const token = await AsyncStorage.getItem('sessionToken');
      if (token) {
          try {
              const sess = await getSession(token);
              setSession(token);
              const userData = sess;
              setUser(userData);
              const friendsData = await getFriends(token);
              setFriendsList(friendsData);
              console.log(friendsData);
          } catch {
              await AsyncStorage.removeItem('sessionToken');
              setSession(null);
              setUser(null);
          }
      }
      else {
          router.replace('/');
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
        <LoadingScreen/>
    );
  }
  
  else {
     return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>      

          <GoBackButton/>
    
          <View style={[ styles.friendsContainer, { backgroundColor: colors.background }]}>
            <FlatList
              style={[styles.friendsList, { flex: 1, backgroundColor: colors.background }]}
              data={friendsList}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}
              renderItem={({ item }) => (
                <FriendCard name={item.username} profilePic={item?.profilePic} id={String(item.id)}/>
              )}
            >
            </FlatList>
          </View>
        </View>
     );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  friendsContainer: {
    flex: 1,
    margin: 10,
    marginBottom: 20,
    marginTop: 80,
  },
  friendsList: {
    flex: 1,
    margin: 10,
  },
});
