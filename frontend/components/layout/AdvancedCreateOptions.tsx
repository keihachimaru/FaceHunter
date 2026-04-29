// /ui/AdvancedCreateOptions.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import PlainButton from '@/components/ui/PlainButton';

interface AdvancedCreateOptionsProps {
  selectedNumPlayers: number;
  setSelectedNumPlayers: (value: number) => void;
  selectedNotifyPlayers: boolean;
  setNotifyPlayers: (value: boolean) => void;
}

export default function AdvancedCreateOptions({
  selectedNumPlayers,
  setSelectedNumPlayers,
  selectedNotifyPlayers,
  setNotifyPlayers,
}: AdvancedCreateOptionsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <PlainButton
        onPress={() => setExpanded(!expanded)}
        style={styles.toggleButton}
        title={expanded ? 'Hide Advanced Options' : 'Show Advanced Options'}
        textStyle={styles.toggleText}
      />


      {expanded && (
        <View style={styles.optionsContainer}>
          {/* Number of players */}
          <Text style={styles.label}>Number of players:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={selectedNumPlayers.toString()}
            onChangeText={(text) => {
              const num = Number(text);
              if (!isNaN(num)) setSelectedNumPlayers(num);
            }}
          />

          {/* Notify players toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Notify players:</Text>
            <Switch
              value={selectedNotifyPlayers}
              onValueChange={setNotifyPlayers}
              thumbColor={selectedNotifyPlayers ? Colors.light.primary : Colors.light.gray500}
              trackColor={{
                false: Colors.light.gray300,
                true: Colors.light.primaryLight,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  optionsContainer: {
    marginTop: 12,
    display: 'flex',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
