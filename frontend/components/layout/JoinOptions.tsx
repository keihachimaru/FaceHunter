// /components/layout/JoinOptions.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import PlainButton from '@/components/ui/PlainButton';

interface Option {
  name: string;
}

interface PlayerOptions {
  classes: Option[];
  weapons: Option[];
  bullets: Option[];
}

interface JoinOptionsProps {
  credits: number;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  selectedWeapon: string;
  setSelectedWeapon: (weapon: string) => void;
  playerOptions: PlayerOptions;
  buyBullet: (name: string, cost: number) => void;
  handleJoinGame: () => void;
  waitingPlayers?: { joined: number; total: number };
}

export default function JoinOptions({
  credits,
  selectedClass,
  setSelectedClass,
  selectedWeapon,
  setSelectedWeapon,
  playerOptions,
  buyBullet,
  handleJoinGame,
  waitingPlayers,
}: JoinOptionsProps) {
  return (
    <View style={styles.container}>
      {/* Credits */}
      {/* Class Selection */}
      {/* Weapon Selection */}
      {/* Bullets */}
      {/* READY Button */}
      <PlainButton
        style={styles.readyButton}
        title="READY"
        onPress={handleJoinGame}
      />
      {/* Player Progress */}
      <Text>{ waitingPlayers }</Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          {Array.from({ length: waitingPlayers[0] || 0 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < (waitingPlayers[1] || 0)
                  ? styles.segmentReady
                  : styles.segmentWaiting,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 10,
  },
  topRight: {
    alignSelf: 'flex-end',
  },
  creditsText: {
    fontWeight: '700',
    color: Colors.light.secondary,
    fontSize: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginVertical: 5,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedOption: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.quaternaryDark,
  },
  optionText: {
    color: Colors.light.textPrimary,
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },
  readyButton: {
    backgroundColor: Colors.light.quaternaryDark,
    marginVertical: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarBackground: {
    flex: 1,
    display: 'flex',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 3,
    flexDirection: 'row',
    backgroundColor: Colors.light.cardBackground,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primaryLight,
  },
  segmentReady: {
    backgroundColor: '#4CAF50',
    backgroundColor: Colors.light.primary,
  },
  segmentWaiting: {
    backgroundColor: '#555',
    backgroundColor: Colors.light.cardBackground,
  },
  tip: {
    fontStyle: 'italic',
    color: Colors.light.textSecondary,
    marginTop: 10,
  },
});

