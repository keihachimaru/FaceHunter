// /ui/GamemodeCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import PlainButton from '@/components/ui/PlainButton';

interface Gamemode {
  id: string | number;
  name: string;
  rounds: number;
  time: string;
  evalmode: string;
  description: string;
}

interface GamemodeCardProps {
  gamemode: Gamemode;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}

export default function GamemodeCard({ gamemode, isSelected, onSelect }: GamemodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = Math.min(screenWidth / 2 - 30, 200);

  return (
    <View
      style={[
        styles.card,
        {
          width: cardWidth,
          aspectRatio: 1.2,
          paddingVertical: expanded ? 15 : 20,
          borderColor: isSelected ? Colors.primary : Colors.border,
          backgroundColor: isSelected ? Colors.cardBackground : Colors.backgroundLight,
        },
      ]}
    >
      {!expanded ? (
        <>
        <TouchableOpacity
            style={styles.header}
            onPress={() => onSelect(isSelected ? null : gamemode.name.toString())}
        >
            <Text
                style={[
                    styles.title,
                    { color: isSelected ? Colors.primaryDark : Colors.border },
                ]}
            >
                {gamemode.name}
            </Text>
        </TouchableOpacity>

          <PlainButton
            style={styles.toggleButton}
            onPress={() => setExpanded(true)}
            textStyle={styles.toggleText}
            title="Show Details"
          />
        </>
      ) : (
        <>
          <View style={styles.details}>
            <Text style={styles.detailText}>Rounds: {gamemode.rounds}</Text>
            <Text style={styles.detailText}>Time: {gamemode.time}</Text>
            <Text style={styles.detailText}>Eval Mode: {gamemode.evalmode}</Text>
            <Text style={styles.detailText}>{gamemode.description}</Text>
          </View>

          <PlainButton
            style={styles.toggleButton}
            onPress={() => setExpanded(false)}
            textStyle={styles.toggleText}
            title="Hide Details"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    background: Colors.background,
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  details: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    textAlign: 'center',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    color: Colors.buttonText,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});
