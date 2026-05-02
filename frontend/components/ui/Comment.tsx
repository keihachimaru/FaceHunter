// /ui/Comment.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CommentProps {
  profilePic: string;
  comment: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  imageStyle?: ImageStyle;
}

export default function Comment({
  profilePic,
  comment,
  backgroundColor = Colors.background,
  textColor = Colors.textPrimary,
  style,
  textStyle,
  imageStyle,
}: CommentProps) {
  return (
    <View style={[styles.commentContainer, { backgroundColor }, style]}>
      <Image source={{ uri: profilePic }} style={[styles.commentProfilePic, imageStyle]} />
      <Text style={[styles.commentText, { color: textColor }, textStyle]}>{comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 10,
  },
  commentProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentText: {
    color: "#1a1a1a",
    fontSize: 15,
    marginLeft: 8,
    flexShrink: 1, // wrap text
  },
});
