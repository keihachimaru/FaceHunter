// app/index.tsx

import React, { useEffect, useState } from 'react';
import { Text, Pressable, View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import Authentication from '@/components/layout/Authentication';
import Feed from '@/components/layout/Feed';
import Taskbar from '@/components/layout/Taskbar';
import { getSession, register, login } from '../services/authService';
import { topPosts, likePost } from '../services/postService';
import { UserType, userType, LoginType, RegisterType, Post } from '../interfaces';
import { Colors } from '../constants/Colors';
import { enableImmersive, disableImmersive } from '@/utils/immersive';
import LoadingScreen from '@/components/layout/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeepButton from '@/components/ui/DeepButton';

export default function Home() {
  console.log('JS thread running!');
  const router = useRouter();
  const colors = Colors;

  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<userType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginMode, setIsLoginMode] =  useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [maxPosts, setMaxPosts] = useState(false);
  const [loginData, setLoginData] = useState<LoginType>({
      email: '',
      password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterType>({
      email: '',
      username: '',
      password: ''
  });

  useEffect(() => {
    async function load() {
        const token = await AsyncStorage.getItem('sessionToken');
        console.log('Validating token ...');
        if (token) {
            try {
                const sess = await getSession(token);
                setSession(token);
                const userData = sess;
                setUser(userData);
            } catch {
                await AsyncStorage.removeItem('sessionToken');
                setSession(null);
                setUser(null);
            }
        }
        setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    enableImmersive();

    return () => {
      disableImmersive();
    };
  }, []);

  useEffect(() => {
    console.log('Loading posts ...');
    loadMorePosts()
  }, [session]);

  async function loadMorePosts() {
      if (loadingMore || !session || maxPosts) return;
      setLoadingMore(true);
      try {
          const top = await topPosts(offset, 3);
          if(top.length==0) {
              setMaxPosts(true);
              return;
          };
          setOffset((prev) => prev + 3);
          setPosts(prev => {
              const existingIds = new Set(prev.map(p => p._id));
              return [...prev, ...top.filter(p => !existingIds.has(p._id))];
          })
      }
      catch(err) {
          console.error(err);
      }
      finally {
          setLoadingMore(false);
      }
  }

  function onPressPost(postId: number) {
    router.replace(`/facehunt/${postId}`);
  }

  function onLike(postId: number) {
    likePost(postId).then(() => {
      Alert.alert('Liked!', `You liked post ${postId}`);
    });
  }

  async function handleLogin() {
    if(!loginData.email || !loginData.password) {
        return Alert.alert('Error', 'Please fill all the fields.');
    }
    setLoading(true);
    try {
        console.log('Login in ...');
        const res = await login(loginData);
        const sess = await getSession(res.token);
        await AsyncStorage.setItem('sessionToken', res.token);
        setSession(res.token);
        const userData = sess;
        setUser(userData);
        const top = await topPosts();
        setPosts(top);
    }
    catch(error) {
        Alert.alert('Error', error.message);
    }
    finally {
        setLoading(false);
    }
  }

  async function handleRegister() {
    if(!registerData.email || !registerData.password || !registerData.username) {
        return Alert.alert('Error', 'Please fill all fields.');
    }
    setLoading(true);
    try {
        console.log('Signin in ...');
        const registerRes = await register(registerData);

        const res = await login({ email: registerData.email, password: registerData.password });
        const sess = await getSession(res.token);
        await AsyncStorage.setItem('sessionToken', res.token);
        setSession(res.token);
        const userData = sess;
        setUser(userData);
     
        await loadMorePosts();

        setLoading(false);
    }
    catch(error) {
        Alert.alert('Error', error.message);
    }
    finally {
        setLoading(false);
    }
  }


  if (loading) {
    return (
        <LoadingScreen/>
    );
  }

  return (
    <View style={[styles.container]}>

      <View style={[styles.topButtonsRow, { height: 100 }]}>

        <DeepButton title="Create" 
            onPress={() => router.push('/create')} 
            style={{ flex: 1, height: 65, margin: 20 }} 
            textStyle={{ color: colors.buttonText }}
            disabled={session == null}
            />

        <DeepButton 
            title="Join" 
            onPress={() => router.push('/join')} 
            style={{ flex: 1, height: 65, margin: 20 }} 
            textStyle={{ color: colors.buttonText }}
            />

      </View>
      { session ? (
            <Feed 
                posts={posts} 
                onPressPost={onPressPost}
                loadMorePosts={loadMorePosts}
                loadingMore={loadingMore}
            />
        ) :
        (
            <Authentication 
                setSession={setSession} 
                handleLogin={handleLogin} 
                loginData={loginData}
                registerData={registerData}
                setLoginData={setLoginData}
                setRegisterData={setRegisterData}
                handleRegister={handleRegister}
                isLoginMode={isLoginMode}
                setIsLoginMode={setIsLoginMode}
            />
        )
      }
      <Taskbar
        disabled={session == null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 20,
    paddingBottom: 20,
  },
});
