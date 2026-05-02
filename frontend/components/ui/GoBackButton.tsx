import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface BackButtonProps {
    direction?: string | null;
}

export default function BackButton({ direction } : BackButtonProps ) {
  const router = useRouter();
  const dir = direction ?? '/';
  return (
    <TouchableOpacity
      onPress={() => router.push(dir)}
      style={[styles.button]}
    >
        <Image source={require('@/assets/icons/arrow-right.png')} style={[ styles.icon, { tintColor: Colors.primary } ]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
   button: {
     height: 20,
     width: 50,
     position: 'absolute',
     top: 40,
     left: 20,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 20,
  },
  disabled: {
    backgroundColor: Colors.gray500,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
