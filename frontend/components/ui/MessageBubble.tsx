import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import dayjs from "dayjs";
import { Colors } from '@/constants/Colors';

interface MessageBubbleProps {
  content?: string;
  image?: string;
  timestamp: string | number | Date;
  isOwn: boolean;
}

export default function MessageBubble({ content, image, timestamp, isOwn }: MessageBubbleProps) {
  return (
    <View style={[styles.messageWrapper, isOwn ? styles.own : styles.other]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.messageImage} />
      ) : (
        <Text style={[styles.messageText, { color: isOwn ? "#fff" : "#000" }]}>
          {content}
        </Text>
      )}
      <Text style={styles.timestamp}>{dayjs(timestamp).format("HH:mm")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 1,
  },
  own: {
    backgroundColor: Colors.light.primary,
    alignSelf: "flex-end",
  },
  other: {
    backgroundColor: Colors.light.gray300,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 11,
    color: "#666",
    alignSelf: "flex-end",
    marginTop: 4,
  },
});
