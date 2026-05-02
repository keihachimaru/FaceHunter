import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Button as RNButton,
  Switch,
  TextInput,
  useColorScheme,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { getSession } from '@/services/authService';
import { getGamemodeOptions } from '@/services/gamemodeService';
import { createGame, notifyFriends as notifyFriendsService } from '@/services/gameService';
import { userType, gamemodeOptionsType, gameType } from '@/interfaces';
import { Colors } from '@/constants/Colors';
import { enableImmersive, disableImmersive } from '@/utils/immersive';
import Constants from 'expo-constants';

import GoBackButton from '@/components/ui/GoBackButton';
import DeepButton from '@/components/ui/DeepButton';
import GamemodeList from '@/components/layout/GamemodeList';
import AdvancedCreateOptions from '@/components/layout/AdvancedCreateOptions';
import PlainButton from '@/components/ui/PlainButton';
import CreateAfter from '@/components/layout/CreateAfter';
import LoadingScreen from '@/components/layout/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugLink =
  process.env.EXPO_PUBLIC_DEBUG_LINK ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_DEBUG_LINK;

export default function Create() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors.light;

  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<userType | null>(null);

  const [gamemodeOptions, setGamemodeOptions] = useState<gamemodeOptionsType[]>([]);
  const [gameID, setGameID] = useState<string | null>(null);

  const [selectedGamemode, setSelectedGamemode] = useState<string | null>(null);
  const [selectedNumPlayers, setSelectedNumPlayers] = useState<number>(10);
  const [selectedNotifyPlayers, setNotifyPlayers] = useState<boolean>(true);

  const [showQR, setShowQR] = useState(true);

  useEffect(() => {
    enableImmersive();
    return () => disableImmersive();
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

                const gamemodeOptionsData = await getGamemodeOptions();
                setGamemodeOptions(gamemodeOptionsData ?? []);
            } catch(err) {
                console.error(err);
                await AsyncStorage.removeItem('sessionToken');
                setSession(null);
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

  async function onPressCreateGame() {
    if (!selectedGamemode || selectedNumPlayers <= 0) {
      Alert.alert('Error', 'Please select gamemode and number of players.');
      return;
    }

    const gamePayload: gameType = {
      gameType: selectedGamemode,
    };

    try {
      const created = await createGame(gamePayload);
      console.log(created);
      setGameID(created);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create game.');
    }
  }

  async function onPressShowQR() {
    if (!gameID) {
      Alert.alert('Error', 'Please create a game first.');
      return;
    }
    try {
      setShowQR(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate QR code.');
    }
  }

  async function onPressNotifyFriends() {
    if (!gameID) {
      Alert.alert('Error', 'Please create a game first.');
      return;
    }
    try {
      await notifyFriendsService(gameID);
      Alert.alert('Success', 'Friends have been notified!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to notify friends.');
    }
  }

  if (loading) {
      return (
        <LoadingScreen/>
      );
  }

  return (
    <View style={styles.container}>
        <GoBackButton/>
            
        <>
          {!gameID ? (
            <FlatList
              data={[0]} // dummy single item
              keyExtractor={() => 'main'}
              style={styles.mainContent}
              renderItem={() => (
                <>
                  <GamemodeList 
                    gamemodeOptions={gamemodeOptions}
                    selectedGamemode={selectedGamemode}
                    setSelectedGamemode={setSelectedGamemode}
                  />
            
                  <AdvancedCreateOptions 
                    selectedNumPlayers={selectedNumPlayers}
                    setSelectedNumPlayers={setSelectedNumPlayers}
                    selectedNotifyPlayers={selectedNotifyPlayers}
                    setNotifyPlayers={setNotifyPlayers}
                  />
                </>
              )}
            />
          ) : (
            <CreateAfter 
              gameID={gameID}
              showQR={showQR}
              setShowQR={setShowQR}
            />
          )}

        </>

        {!gameID && ( 
            <DeepButton
              title="Create aGame"
              onPress={onPressCreateGame}
              style={{ marginTop: 30 }}
            /> 
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 90,
    paddingBottom: 40,
  },
  mainContent: {
      padding: 10,
  }
});
