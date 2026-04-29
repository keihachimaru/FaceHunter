import React, { useEffect, useState, useRef } from 'react';
import { Pressable, View, Text, StyleSheet, TextInput, Image, FlatList, TouchableOpacity, Alert, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { getSession, getUserData } from '@/services/authService';
import { postComment, likeFacehunt, getLikes, getComments, getFacehunt } from '@/services/facehuntService';
import { facehuntType, likeType, commentType, userType } from '@/interfaces';
import { Colors } from '@/constants/Colors';
import ImmersiveMode from 'react-native-immersive';
import Comment from '@/components/ui/Comment';
import GoBackButton from '@/components/ui/GoBackButton';
import FacehuntContainer from '@/components/layout/FacehuntContainer';
import Comments from '@/components/layout/Comments';
import Keyboard from '@/components/ui/Keyboard';

export default function Facehunt() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.light : Colors.light;
  const { facehuntId } = useLocalSearchParams();

  const [session, setSession] = useState<number | null>(null);
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);
  const [facehunt, setFacehunt] = useState<facehuntType | null>(null);
  const [likes, setLikes] = useState<likeType[] | []>([]);
  const [comments, setComments] = useState<commentType[] | []>([]);
  const [hasLiked, setHasLiked] = useState<Boolean>(false);


  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    ImmersiveMode.on();

    return () => {
      ImmersiveMode.off();
    };
  }, []);

  useEffect(() => {
    async function load() {
      const sess = await getSession();
      setSession(sess);
      if (sess) {
        const userData = await getUserData();
        setUser(userData);

        const likesData = await getLikes(facehuntId);
        setLikes(likesData);

        const facehuntData = await getFacehunt(facehuntId);
        setFacehunt(facehuntData);

        const commentsData = await getComments(facehuntId);
        setComments(commentsData);

        setHasLiked(likesData.some(obj => obj.author === userData.id));
      }
      else {
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
    likeFacehunt(facehuntId);
    setHasLiked(!hasLiked);
  }

  function onPressPostComment(text : string | null) {
    if (!text.trim()) return;
    const comment : commentType = {
        author: user.name,
        comment: text.trim(),
    }
    postComment(facehuntId, comment);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
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
                    image={facehunt.hunt}
                    hasLiked={hasLiked}
                    setHasLiked={setHasLiked}
                    onPress={onPressLikeFacehunt}
                  />
                </>
              }
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Comment profilePic={item.profilePic} comment={item.comment} />
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
