import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, View, ViewStyle, Text } from "react-native";
import MessageBubble from "@/components/ui/MessageBubble";
import dayjs from "dayjs";

interface Message {
  type: "message" | "date";
  content?: string;
  image?: string;
  senderID?: string;
  timestamp?: string | number | Date;
  date?: string | number | Date;
}

interface MessagesListProps {
  messages: Message[];
  currentUserID: string;
  containerStyle?: ViewStyle;
}

export default function MessagesList({ messages, currentUserID, containerStyle }: MessagesListProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => {
          if (item.type === "date") {
            return (
              <Text style={styles.dateHeader}>
                {dayjs(item.date).format("MMMM D, YYYY")}
              </Text>
            );
          }
          const isOwn = item.sender === currentUserID;
          return (
            <MessageBubble
              content={item.content}
              image={item.image}
              timestamp={item.createdAt || ""}
              isOwn={isOwn}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  dateHeader: {
    textAlign: "center",
    marginVertical: 8,
    fontSize: 12,
    color: "#888",
  },
});
