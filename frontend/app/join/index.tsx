import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList,
    Button as RNButton,
    Dimensions,
    useColorScheme
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

import { getSession } from '@/services/authService';
import { uploadPicture } from '@/services/playerService';
import { joinGame, getPlayerOptions, getWaitingPlayers, getGamemode } from '@/services/gameService';
import { userType, playerOptionsType, waitingPlayersType } from '@/interfaces';
import { Colors } from '@/constants/Colors';
import { enableImmersive, disableImmersive } from '@/utils/immersive';
import Constants from 'expo-constants';
import GoBackButton from '@/components/ui/GoBackButton';
import DeepButton from '@/components/ui/DeepButton';
import ScanQR from '@/components/ui/ScanQR';
import PlainButton from '@/components/ui/PlainButton';
import JoinOptions from '@/components/layout/JoinOptions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameLobby } from '@/hooks/useGameLobby';
import * as ImageManipulator from 'expo-image-manipulator';
import { usePlayerStore } from '@/stores/usePlayerStore';

const debugLink = process.env.EXPO_PUBLIC_DEBUG_LINK || Constants.expoConfig?.extra?.EXPO_PUBLIC_DEBUG_LINK;

export default function Join() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors.light;
    const params = useLocalSearchParams<{ gameId?: string }>();
    const initialGameId = params.gameId;

    const [session, setSession] = useState<string | null>(null);
    const [user, setUser] = useState<userType | null>(null);

    const [gameId, setGameId] = useState<string>(initialGameId || '');
    const [playerOptions, setPlayerOptions] = useState<playerOptionsType | null>(null);

    const [credits, setCredits] = useState<number>(0);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
    const [selectedBullets, setSelectedBullets] = useState<string[]>([]);

    const [waitingPlayers, setWaitingPlayers] = useState<waitingPlayersType | null>(null);
    const { playerReady, numPlayers, numReady, gameToken } = useGameLobby(gameId);

    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(!initialGameId);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [takingPicture, setTakingPicture] = useState(false);
    const [face, setFace] =  useState(null);

    const { player } = usePlayerStore();

    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        async function load() {
            const token = await AsyncStorage.getItem('sessionToken');
            if (token) {
                try {
                    const sess = await getSession(token);
                    setSession(token);
                    const userData = sess;
                    setUser(userData);
                }
                catch(err) {
                    await AsyncStorage.removeItem('sessionToken');
                    setSession(null);
                    setUser(null);
                }
            }
            setLoading(false);
        }
        load();

    }, []);

    useEffect(()=>{
        if(numPlayers>1 && (numPlayers==numReady)) {
            router.replace('/game/'+gameId);
        }
    }, [numPlayers, numReady]);

    
    function buyBullet(bullet: string, cost: number) {
        if (credits - cost < 0) {
            Alert.alert('Not enough credits', 'You cannot exceed the credit limit');
            return;
        }
        setSelectedBullets([...selectedBullets, bullet]);
        setCredits(c => c - cost);
    }

    function handleJoinGame() {
        playerReady();
    }

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
    }

    if (scanning) {
        if (!cameraPermission) return <View />;
        if (!cameraPermission.granted) {
            return (
                <View style={styles.container}>
                    <Text>We need your permission to use the camera</Text>
                    <RNButton title="Grant Permission" onPress={requestCameraPermission} />
                </View>
            );
        }

        const handleBarCodeScanned = async ({ data }: { data: string }) => {
            setScanning(false);
            setGameId(data);
        };

        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarCodeScanned}
                />
                {/* Overlay square */}
                <View style={styles.overlay}>
                    <View style={styles.scanSquare} />
                </View>

                <View style={styles.controls}>
                    <RNButton title="Cancel" onPress={() => setScanning(false)} color="#777" />
                </View>
            </View>
        );
    }

    if(takingPicture && gameId) {
        if (!cameraPermission) return <View />;
        if (!cameraPermission.granted) {
            return (
                <View style={styles.container}>
                    <Text>We need your permission to use the camera</Text>
                    <RNButton title="Grant Permission" onPress={requestCameraPermission} />
                </View>
            );
        }

        const handleTakePicture = async () => {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
                base64: false
            });

            const { width, height, uri } = photo;

            const cropSize = Math.min(width, height);
            const cropX = (width - cropSize)/2;
            const cropY = (height - cropSize)/2;
            
            setLoading(true);

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

            try {
                const url = await uploadPicture(player.gameToken, resized.uri, player.player._id);
                setFace(url.url);
                setTakingPicture(false);
            }
            catch(err) {
                Alert.alert(err.message);
            }
            finally {
                setLoading(false);
            }
        };

        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    facing="front"
                />
                {/* Overlay square */}
                <View style={styles.overlay}>
                    <View style={styles.pictureSquare} />
                </View>

                <View style={styles.controls}>
                    <DeepButton
                        title="Take picture"
                        onPress={handleTakePicture}
                    />
                    <RNButton title="Cancel" onPress={() => setTakingPicture(false)} color="#777" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GoBackButton/>

            <ScanQR 
                gameId={gameId} 
                setScanning={setScanning}
            />
            
            {gameId && (
              !face ? (
                <DeepButton
                  title="Take Picture"
                  onPress={() => setTakingPicture(!takingPicture)}
                />
              ) : (
                <Image source={{ uri: face }} style={styles.face} />
              )
            )}

            {gameId && face && (
                <JoinOptions
                    credits={player?.credits}
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    selectedWeapon={selectedWeapon}
                    setSelectedWeapon={setSelectedWeapon}
                    playerOptions={playerOptions}
                    buyBullet={buyBullet}
                    handleJoinGame={handleJoinGame}
                    waitingPlayers={[numPlayers, numReady]}
                />               
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa'
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black'
    },
    controls: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        gap: 12
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scanSquare: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: Colors.light.secondary,
        backgroundColor: 'transparent',
        borderRadius: 8
    },
    pictureSquare: {
        width: 300,
        height: 300,
        borderWidth: 3,
        borderColor: Colors.light.primary,
        backgroundColor: 'transparent',
        borderRadius: 8
    },
    face: {
        width: 300,
        height: 300,
        borderWidth: 3,
        borderColor: Colors.light.primary,
    }
});
