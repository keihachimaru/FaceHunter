// /components/ui/ScanQR.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ScanQRProps {
  gameId: string | null;
  setScanning: (v: boolean) => void;
}

export default function ScanQR({ gameId, setScanning }: ScanQRProps) {
  const circleColor = gameId ? Colors.light.quaternary : Colors.light.secondary;
  const displayText = gameId ? 'Ready' : 'Scan';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { borderColor: circleColor }]}
        onPress={() => setScanning(true)}
        disabled={!!gameId}
      >
        <Text style={[styles.text, { color: circleColor }]}>{displayText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    marginTop: 50,
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '700',
    fontSize: 18,
  },
});
