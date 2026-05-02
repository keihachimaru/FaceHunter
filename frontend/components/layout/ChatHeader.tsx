// /components/ui/ChatHeader.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import GoBackButton from "@/components/ui/GoBackButton";

interface User {
  name: string;
  profilePic: string;
}

interface ChatHeaderProps {
  otherUser?: User | null;
}

export default function ChatHeader({ otherUser }: ChatHeaderProps) {
  const colors = Colors;

  return (
    <View style={[styles.header, { backgroundColor: colors.backgroundLight, borderBottomColor: colors.borderLight }]}>
      <GoBackButton direction="/friends" />
      {otherUser && (
        <View style={styles.headerUser}>
          { otherUser.profilePic ? ( 
                <Image 
                    source={{ uri: otherUser.profilePic }} 
                    style={styles.avatar} 
                />
            ) : (
                <View
                    style={[ styles.avatar, { backgroundColor : Colors.gray300, borderRadius: 999 }]}
                >
                </View>
            )
          }
          <Text style={[styles.username, { color: colors.textPrimary }]}>{otherUser.username}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: 90,
    // Add subtle shadow for floating effect
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  headerUser: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 45,
    marginTop: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
  },
});
