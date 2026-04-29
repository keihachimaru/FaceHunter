import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import GamemodeCard from '@/components/ui/GamemodeCard';

interface Gamemode {
  id: string | number;
  name: string;
  rounds: number;
  time: string;
  evalmode: string;
  description: string;
}

interface GamemodeListProps {
  gamemodeOptions: Gamemode[];
  selectedGamemode: string | null;
  setSelectedGamemode: (id: string) => void;
}

export default function GamemodeList({ gamemodeOptions, selectedGamemode, setSelectedGamemode, }: GamemodeListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const { width } = Dimensions.get('window');
  const cardSize = width / 2 - 20; // two cards per row with margin

  return (
    <View>
      <Text style={[ styles.label ]}>Select Gamemode</Text>
      <FlatList
        data={gamemodeOptions}
        keyExtractor={(item) => item.name.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
            <GamemodeCard
              gamemode={item}
              isSelected={selectedGamemode === item.name.toString()}
              onSelect={setSelectedGamemode}
            />
          )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
