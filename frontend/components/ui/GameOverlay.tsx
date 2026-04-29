import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import {
  getScopeImage,
} from '@/services/gameService';

interface GameOverlayProps {
    dead: boolean,
    weapon: string,
};

export default function GameOverlay({ dead, weapon }: GameOverlayProps ) {
    const router = useRouter();
    const colors = Colors.light;

    return (
        <View style={styles.overlay}>
            { dead && (
                <View style={styles.dead}>
                    <Text style={styles.wasted}>
                        Wasted 
                    </Text>
                </View>
            ) }
            <View style={styles.crossHair}>
                <Image source={{ uri : getScopeImage(weapon) }} style={styles.scopeStyle}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0, 
        top: 0, 
        right: 0,
        backgroundColor: 'transparent',
    },
    dead: {
        position: 'absolute',
        bottom: 0,
        left: 0, 
        top: 0, 
        right: 0,
        backgroundColor: Colors.light.tertiaryDark,
        opacity: .5,
        pointerEvents: 'auto',
        zIndex: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wasted: {
        fontSize: 36,
        fontWeight: 'bold',
        zIndex: 9,
    },
    crossHair: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: 75,
        width: 75,
        backgroundColor: 'red',
    },
    scopeStyle: {
        height: 75,
        width: 75,
    }

})
