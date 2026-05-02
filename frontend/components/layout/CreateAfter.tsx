import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { notifyFriends as notifyFriendsService } from '@/services/gameService';
import PlainButton from '@/components/ui/PlainButton';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '@/constants/Colors';

interface CreateAfterProps {
  gameID: string;
  showQR: boolean;
  setShowQR: (v: boolean) => void;
}

export default function CreateAfter({ gameID, showQR, setShowQR }: CreateAfterProps) {
  const router = useRouter();

  async function onPressShowQR(val: Boolean) {
    try {
      setShowQR(val);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate QR code.');
    }
  }

  async function onPressNotifyFriends() {
    try {
      await notifyFriendsService(gameID);
      Alert.alert('Success', 'Friends have been notified!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to notify friends.');
    }
  }

  return (
    <View style={styles.container}>
      <PlainButton
        title="Join Myself"
        style={{width: 280}}
        onPress={() => router.push({ pathname: '/join', params: { gameId: gameID } })}
      />
      <PlainButton 
        title={showQR?"Hide QR":"Show QR"} 
        style={{width: 280}}
        onPress={() => { onPressShowQR(!showQR) }} 
      />
      <PlainButton 
        title="Notify Friends" 
        style={{width: 280}}
        onPress={onPressNotifyFriends}
      />

      <View style={styles.qrWrapper}>
        {showQR && (
        <QRCode value={gameID} size={250} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    height: '100%',
    gap: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    marginTop: 80,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: Colors.primary,
    aspectRatio: 1,
    width: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
});
