import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

import { getSession } from '@/services/authService';
import { 
  getPlayerData,
  getOtherPlayersData,
} from '@/services/playerService';
import {
  getTopHighlights,
  getHighlightCandidates,
} from '@/services/gameService';

import { playerType, highlightType, highlightCandidateType } from '@/interfaces/game';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

import Button from '@/components/ui/Button';
import DeepButton from '@/components/ui/DeepButton';
import PlayersList from '@/components/ui/PlayersList';
import RoundInfo from '@/components/ui/RoundInfo';
import GameActionBar from '@/components/ui/GameActionBar';
import GameOverlay from '@/components/ui/GameOverlay';

import ImmersiveMode from 'react-native-immersive';
import LoadingScreen from '@/components/layout/LoadingScreen';
import LikeButton from '@/components/ui/LikeButton';

import { useGame } from '@/hooks/useGame';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerStore } from '@/stores/usePlayerStore';

import RoundUI from '@/components/layout/RoundUI';

const { width, height } = Dimensions.get('window');

export default function Game() {
  const { gameId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'light' ? Colors.dark : Colors.light;

  const [shotMessages, setShotMessages] = useState([]);
  const { player, setPlayer } = usePlayerStore();
  const [phase, setPhase] = useState<'playing' | 'voting' | 'leaderboard'>('playing');
  const [currentCandidate, setCurrentCandidate] = useState<{ idx: number, candidate: any} | null>(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Player info
  const { 
    dead, 
    setDead, 
    gameInfo, 
    otherPlayers, 
    fired, 
    cooldown, 
    fireShot, 
    setFired, 
    setCooldown, 
    candidates,
    voteShot,
    votingDone,
  } = useGame(player?.gameToken, setShotMessages, setPhase, setCurrentCandidate, setLeaderboard);

  // Game info

  // Camera ref
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
    ImmersiveMode.on();
    if(phase=='playing') ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    else ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    return () => {
      ImmersiveMode.off();
    };
  }, []);
  
  async function handleFire() {
        setFired(true);
        setCooldown(true);
        const photo = await cameraRef.current.takePictureAsync({
            quality: 1,
            base64: false
        });

        const { width, height, uri } = photo;

        const cropSize = Math.min(width, height);
        const cropX = (width - cropSize)/2;
        const cropY = (height - cropSize)/2;
        
        const cropped = await ImageManipulator.manipulateAsync(
            uri,
            [{ crop: { originX: cropX, originY: cropY, width: cropSize, height: cropSize } }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        const resized = await ImageManipulator.manipulateAsync(
            cropped.uri,
            [{ resize: { width: 256 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
    
        fireShot(player.gameToken, resized.uri, player?.player._id);
  }

  function likeCandidate() {
    if(candidates.length==0) return
    const idx = currentCandidate.idx;
    voteShot(player.gameToken, currentCandidate.candidate._id);
    if(idx < candidates.length -1) {
        setCurrentCandidate((prev) => ({ idx: idx+1, candidate: candidates[idx+1]}));
    }
    else if(idx == candidates.length -1) {
        votingDone(player.gameToken);
        setCurrentCandidate((prev) => ({ ...currentCandidate, idx: idx+1 }));
    }
  }

  function dislikeCandidate() {
    if(candidates.length==0) return
    const idx = currentCandidate.idx;
    if(idx < candidates.length -1) {
        setCurrentCandidate((prev) => ({ idx: idx+1, candidate: candidates[idx+1]}));
    }
    else if(idx == candidates.length -1) {
        votingDone(player.gameToken);
        setCurrentCandidate((prev) => ({ ...currentCandidate, idx: idx+1 }));
    }
  }

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

    const CameraContainer = React.memo(({ cameraRef }) => {
      const [cameraKey, setCameraKey] = useState(0);
    
      const handleCameraReady = () => {
        setCameraKey(prevKey => prevKey + 1); // Increment key to force remount
      };
    
      return (
        <CameraView
          key={cameraKey}
          ref={cameraRef}
          style={styles.camera}
          onCameraReady={handleCameraReady}
          animateShutter={false}
        />
      );
    });
    
  const VotingUI = () => (
    <View style={[styles.votingContainer, { backgroundColor: colors.background }]}>
        <View style={styles.candidateContainer}>
            <View style={styles.candidate}>
                {currentCandidate.idx < candidates.length && (
                    <Image source={{ uri : currentCandidate.candidate.image }} style={styles.candidateImage}/>
                )}
            </View>
            <View style={styles.votingSection}>
                <LikeButton 
                    style={{ tintColor: colors.tertiary, transform: 'rotate(180deg)', width: 32, height: 32 }} 
                    dislike={true}
                    onPress={dislikeCandidate}
                    />

                <Text>
                    { Math.min(candidates.length, currentCandidate.idx+1)} / {candidates.length} 
                </Text>
                <LikeButton 
                    style={{width: 32, height: 32}}
                    onPress={likeCandidate}
                    />
            </View>
        </View>
        { currentCandidate.idx>=candidates.length && (
            <DeepButton title="See Leaderboard" onPress={() => {setPhase('leaderboard')}}/>
        )}
    </View>
  );

  const LeaderboardUI = () => (
    <View style={[styles.leaderboardContainer, { backgroundColor: colors.background }]}>
      <View style={styles.leaderboard}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 32, color: colors.primary, marginBottom: 20 }}>
            Leaderboard
          </Text>
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.rank, { color: colors.primary }]}>{item.votes}</Text>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.id.slice(0,5) }</Text>
                {item.votes !== undefined && (
                  <Text style={[styles.score, { color: colors.secondaryDark }]}>{item.votes}</Text>
                )}
              </View>
            )}
          /> 
      </View>
      <DeepButton title="Play Again" style={{marginHorizontal: 20}} onPress={() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            router.push('/create')
      }}/>
      <DeepButton style={{backgroundColor: colors.tertiary, margin: 20, marginBottom: 40 }} title="Exit" onPress={() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            router.push('/')
      }}/>
    </View>
  );

  // --- Render based on phase ---
  if (phase === 'voting') return <VotingUI />;
  if (phase === 'leaderboard') return <LeaderboardUI />;
  return (
      <View style={styles.container}>
        <CameraView 
            ref={cameraRef} 
            style={styles.camera} 
            animateShutter={false} 
            onMountError={(e) => console.warn("Camera mount failed:", e.nativeEvent)}
            />
        <RoundUI
          otherPlayers={otherPlayers}
          gameInfo={gameInfo}
          fired={fired}
          cooldown={cooldown}
          handleFire={handleFire}
          shotMessages={shotMessages}
          dead={dead}
          setDead={setDead}
        />
      </View>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  votingContainer : {
      paddingHorizontal: 20,
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly',
  },
  candidate : {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 18,
      borderWidth: 8,
      borderColor: Colors.light.primary
  },
  votingSection : {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
  },
  candidateImage : {
      height: '100%',
      width: '100%',
  },
  leaderboardContainer : {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-evenly',
  },
  leaderboard : {
      flex: 1,
      paddingHorizontal: 30,
      paddingTop: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5, // for Android shadow
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 32,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  score: {
    fontSize: 16,
    fontWeight: '500',
  },
});
