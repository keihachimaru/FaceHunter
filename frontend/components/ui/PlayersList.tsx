import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { blockFriend } from '@/services/friendService';
import { playerType } from '@/interfaces/game';

export default function FriendCard({ otherPlayers }: playerType[] ) {
    const router = useRouter();
    
    function hpColor(hp : number) {
        if(hp >= 90) return Colors.light.primary;
        else if(hp >= 75) return Colors.light.quaternary;
        else if(hp >= 50) return Colors.light.secondaryDark;
        else if(hp >= 25) return Colors.light.tertiary;
        else return Colors.light.tertiaryDark;
    }

    return (
        <View style={styles.playersList}>
          {otherPlayers.map((p, idx) => (
            <View
              key={idx}
              style={[
                { color: Colors.light.textPrimary },
                p.health === 0 && { color: colors.error },
                styles.playerRow
              ]}
            >
              <Text style={styles.playerName}>{p.name}</Text>
              <View style={[
                  styles.playerHealth
                ]}>
                <View
                  style={[
                    styles.hpBarFill,
                    { width: `${p.health / p.maxHealth * 100}%`, backgroundColor: hpColor(p.health/p.maxHealth * 100) },
                  ]}
                />
                  </View>
            </View>
          ))}
        </View>
    );
}

const styles = StyleSheet.create({
  playersList: { 
      position: 'absolute',
      top: 30, 
      left: 30,
      backgroundColor: 'rgba(0,0,0,.1)',
      borderWidth: 1,
      borderColor: Colors.light.primary,
      borderRadius: 8,
      paddingBottom: 5,
  },
  playerRow: { 
      backgroundColor: 'rgba(0,0,0,.3)',
      marginHorizontal: 5,
      marginTop: 5,
      paddingTop: 5,
      borderRadius: 5,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      color: Colors.light.textTertiary,
      overflow: 'hidden',
      width: 100,
  },
  playerName: {
      paddingHorizontal: 5,
  },
  playerHealth: {
      backgroundColor: '#222',
      height: 5,
      width: '100%',
  },
  hpBarFill: {
      height: 5,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
  }
})
