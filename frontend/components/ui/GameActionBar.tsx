import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { blockFriend } from '@/services/friendService';
import { playerType } from '@/interfaces/game';
import {
  getScopeImage,
} from '@/services/gameService';

interface GameActionBarProps {
    player: playerType,
    fire: () => void,
    fired: boolean,
    cooldown: boolean,
};

export default function GameActionBar({ player, fire, fired, cooldown }: GameActionBarProps ) {
    const router = useRouter();
    const colors = Colors;
    
    function hpColor(hp : number) {
        if(hp >= 90) return Colors.primary;
        else if(hp >= 75) return Colors.quaternary;
        else if(hp >= 50) return Colors.secondaryDark;
        else if(hp >= 25) return Colors.tertiary;
        else return Colors.tertiaryDark;
    }
    // max hp is 100 for everyone for now
    // bullets doenst matter, this is face mode
    
    return (
        <View style={styles.bottomBar}>
          <View
            style={[
              styles.hpBarContainer,
            ]}
          >
            <View
              style={[
                styles.hpBarFill,
                { width: `${player?.remainingHP/ 100 * 100}%`, backgroundColor: hpColor(player?.remainingHP/100 * 100) },
              ]}
            >
            </View>
            <Text style={styles.textHP}>
                {player?.remainingHP} / { 100 }
            </Text>
          </View>
    
          <TouchableOpacity
            style={[
              fired || cooldown ? styles.disabledFireButton : styles.fireButton,
            ]}
            onPress={fire}
            disabled={fired || cooldown }
          >
          </TouchableOpacity>

          <View style={styles.bulletsDisplay}>
            {
                player?.bullets?.map((b, idx)=> (
                    <View key={idx} style={styles.bullet}>
                    </View>
                ))
            }
          </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0, 
        height: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hpBarContainer: {
        height: 20,
        width: '50%',
        borderWidth: 1,
        display: 'flex',
        justifyContent: 'center',
        borderColor: Colors.primary,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    hpBarFill: {
        height: 20,
        borderRadius: 10,
    },
    textHP: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontWeight: 'bold',
        fontSize: 12,
    },
    fireButton: {
        position: 'absolute',
        top: -25,
        right: 100,
        height: 70,
        width: 70,
        borderWidth: 8,
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledFireButton: {
        position: 'absolute',
        top: -25,
        right: 100,
        height: 70,
        width: 70,
        borderWidth: 8,
        borderColor: Colors.gray600,
        backgroundColor: Colors.gray400,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bulletsDisplay : {
        padding: 5,
        position: 'absolute',
        bottom: 35,
        left: 30,
        display: 'flex',
        gap: 5,
        flexDirection: 'row',
    },
    bullet: {
        height: 25,
        width: 8,
        backgroundColor: Colors.gray800,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    }
})
