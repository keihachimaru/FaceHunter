import React, { useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { blockFriend } from '@/services/friendService';
import { shotMessage, playerType } from '@/interfaces/game';
import { GiPistolBullet } from "react-icons/gi";
import {
    getGamemodeInfo
} from '@/services/gamemodeService';
import { shotMessageType } from '@/interfaces/game';
import { getsocket } from '@/services/gameSocket';
import { usePlayerStore } from '@/stores/usePlayerStore';

export default function RoundInfo({ otherPlayers, gameInfo, shotMessages, setDead }) {
    const router = useRouter();
    const colors = Colors.light;
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [round, setRound] = useState(null);

    const roundRef = useRef(null);
    const timeRef = useRef(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const gamemodeInfoRef = useRef<{ numRounds: number; roundLength: number } | null>(null);
    
    const { player } = usePlayerStore();

    const socketRef = useRef<Socket | null>(null);
    if (!socketRef.current) socketRef.current = getsocket();
    

    const handleRoundEnded = () => {
        console.log('Round ended')
        setTimeout(()=>{
            setDead(false);
            if(roundRef.current == 0) {
                socketRef.current.emit('gameEnded', { token: player.gameToken });
                clearInterval(intervalRef.current);
            }
            else {
                roundRef.current -= 1;
                setRound(roundRef.current);
                
                timeRef.current = gamemodeInfoRef.current!.roundLength;
                setTimeRemaining(timeRef.current);
            }
        }, 5000)
    };

    const timer = () => {
        if(intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if(timeRef.current == 0) {
                if(roundRef.current == 0) {
                    socketRef.current.emit('gameEnded');
                    setPhase('voting');
                    clearInterval(intervalRef.current);
                }
                else  {
                    roundRef.current -= 1;
                    setRound(roundRef.current);
                    
                    timeRef.current = gamemodeInfoRef.current!.roundLength;
                    setTimeRemaining(timeRef.current);
                }
            }
            else {
                timeRef.current -= 1;
            }
            setTimeRemaining(timeRef.current);
            setRound(roundRef.current);
        }, 1000);
    }

    useEffect(() => {
      if(!gameInfo || gamemodeInfoRef.current) return;

      async function load() {
          const gamemodeInfoData = await getGamemodeInfo(gameInfo.gameType);

          roundRef.current = roundRef.current ?? gamemodeInfoData.numRounds;
          timeRef.current = timeRef.current ?? gamemodeInfoData.roundLength;

          setTimeRemaining(timeRef.current);
          setRound(roundRef.current);

          gamemodeInfoRef.current = gamemodeInfoData;
          if(!intervalRef.current) timer();
      }

      load();

      socketRef.current.on('round-ended', handleRoundEnded);

      return () => {
          if(intervalRef.current) clearInterval(intervalRef.current)
          socketRef.current.off('round-ended', handleRoundEnded)
      };
    }, [gameInfo]);
    
    

    return (
        <View style={styles.topBar}>
    
          <View style={styles.roundInfo}>
            <Text style={[styles.roundText, { color: colors.textPrimary }]}>
              Round {round}
            </Text>
            <Text style={[styles.timerText, { color: colors.tint }]}>
              {timeRemaining}s
            </Text>
          </View>
    
          <View style={styles.shotMessages}>
            {
                shotMessages.map((msg, idx)=>(
                    <View key={idx} style={[
                        styles.shotMessage,
                        { borderColor: msg.valid ? Colors.light.tertiary : Colors.light.gray700,  }
                    ]}>
                        
                        <Text style={{ color: msg.valid ? Colors.light.tertiary : Colors.light.gray700}}>
                            {otherPlayers.find(p => p.id == msg.shooterID)?.name}
                        </Text>
                        <View style={styles.bulletIcon}>
                        </View>
                        <Text style={{ color: msg.valid ? Colors.light.tertiary : Colors.light.gray700}}>
                            {otherPlayers.find(p => p.id == msg.targetID)?.name}
                        </Text>
                    </View>
                ))
            }
          </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    roundInfo : {
        width: 125,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    roundText : {
        color: Colors.light.textPrimary,
        fontWeight: 'bold',
        backgroundColor: Colors.light.primary,
        width: 125,
        textAlign: 'center',
        paddingVertical: 5,
        fontSize: 16,
    },
    timerText : {
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,.3)',
        paddingVertical: 5,
        width: 85,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 3,
    },
    shotMessages: {
        position: 'absolute',
        top: 10,
        right: 20,
    },
    shotMessage : {
        marginTop: 5,
        marginHorizontal: 10,
        width: 150,
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 5,
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    bulletIcon : {
        height: 8,
        width: 25,
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: Colors.light.primary,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    }
})
