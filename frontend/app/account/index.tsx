import React, { useEffect, useState } from 'react';
import { Pressable, View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { userType } from '@/interfaces';
import { enableImmersive, disableImmersive } from '@/utils/immersive';
import LoadingScreen from '@/components/layout/LoadingScreen';
import GoBackButton from '@/components/ui/GoBackButton';
import DeepButton from '@/components/ui/DeepButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession, logout} from '@/services/authService';

export default function Account() {
  const router = useRouter();
  const colors = Colors;
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);

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
            } catch {
                await AsyncStorage.removeItem('sessionToken');
                setSession(null);
                setUser(null);
            }
        }
        setLoading(false);
    }
    load();
  }, []);
  
  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <View style={[styles.container]}>
        <GoBackButton/>
        <DeepButton title="Logout" onPress={handleLogout}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
});
