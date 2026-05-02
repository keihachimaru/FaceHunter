// /ui/LikeButton.tsx
import React from 'react';
import { TouchableOpacity, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import Liked from '@/assets/icons/like.png';
import NotLiked from '@/assets/icons/like-outline.png';

interface LikeButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  liked: Boolean;
  dislike?: boolean;
}

export default function LikeButton({ onPress, style, liked, dislike }: LikeButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.likeButton, { transform : dislike ? 'rotate(180deg)' : ''}]}>
      <Image
        source={liked ? Liked : NotLiked } style={[styles.icon, { tintColor: style?.tintColor ?? Colors.quaternaryDark, width: style?.width ?? 24, height: style?.height??24 }]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  likeButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    resizeMode: 'contain',
  },
});
