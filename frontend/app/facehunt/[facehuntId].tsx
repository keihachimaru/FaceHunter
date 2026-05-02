import React, { useEffect, useState, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, TextInput, Image, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { getSession } from '@/services/authService';
import { postComment, likeFacehunt, getLikes, getComments, getFacehunt } from '@/services/facehuntService';
import { userType } from '@/interfaces';
import type { facehuntType, likeType, commentType } from '@/interfaces/facehunt';
import { Colors } from '@/constants/Colors';
import { enableImmersive, disableImmersive } from '@/utils/immersive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Comment from '@/components/ui/Comment';
import GoBackButton from '@/components/ui/GoBackButton';
import FacehuntContainer from '@/components/layout/FacehuntContainer';
import Comments from '@/components/layout/Comments';
import Keyboard from '@/components/ui/Keyboard';

export default function Facehunt() {
  const router = useRouter();
  const colors = Colors;
  const { facehuntId } = useLocalSearchParams();

  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);
  const [facehunt, setFacehunt] = useState<facehuntType | null>(null);
  const [likes, setLikes] = useState<likeType[]>([]);
  const [comments, setComments] = useState<commentType[]>([]);
  const [hasLiked, setHasLiked] = useState<boolean>(false);


  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    enableImmersive();

    return () => {
      disableImmersive();
    };
  }, []);

  useEffect(() => {
    async function load() {
      const token = await AsyncStorage.getItem('sessionToken');
      if (token) {
        try {
          const sess = await getSession(token);
          setSession(token);
          setUser(sess);

          const likesData = await getLikes(Number(facehuntId));
          setLikes(likesData ?? []);

          const facehuntData = await getFacehunt(Number(facehuntId));
          setFacehunt(facehuntData ?? null);

          const commentsData = await getComments(Number(facehuntId));
          setComments(commentsData ?? []);

          setHasLiked((likesData ?? []).some(obj => obj.author === sess.id));
        } catch {
          await AsyncStorage.removeItem('sessionToken');
          setSession(null);
          setUser(null);
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
      setLoading(false);
    }
    load();
  }, []);
  
  /* 
  ****************************************
  ****************************************
              SETUP WEBSOCKETS             
  ****************************************
  ****************************************
  */

  function onPressLikeFacehunt() {
    likeFacehunt(Number(facehuntId));
    setHasLiked(!hasLiked);
  }

  function onPressPostComment(text : string | null) {
    if (!text?.trim()) return;
    if (!user) return;
    const comment : commentType = {
        author: user.id,
        comment: text.trim(),
    }
    postComment(Number(facehuntId), comment);
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Loading...</Text>
      </View>
    );
  }
  else {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{flex: 1}}>
            <GoBackButton />
            <FlatList
              style={{ flex: 1, marginTop: 80 }}
              ListHeaderComponent={
                <>
                  <FacehuntContainer
                    image={facehunt?.hunt ?? ''}
                    hasLiked={hasLiked}
                    setHasLiked={setHasLiked}
                    onPress={onPressLikeFacehunt}
                  />
                </>
              }
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Comment profilePic={item.profilePic ?? ''} comment={item.comment} />
              )}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
            <Keyboard onSend={onPressPostComment} autoDismiss={true}/>

        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 2,
  },
});
