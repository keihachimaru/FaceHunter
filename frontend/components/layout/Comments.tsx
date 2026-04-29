import React from "react";
import { FlatList, StyleSheet, View, ViewStyle } from "react-native";
import Comment from "@/components/ui/Comment";

interface CommentItem {
  id: string | number;
  profilePic: string;
  comment: string;
}

interface CommentsLayoutProps {
  comments: CommentItem[];
  containerStyle?: ViewStyle;
}

export default function Comments({ comments, containerStyle }: CommentsLayoutProps) {
  const flatListRef = useRef<FlatList>(null);

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => (
          <Comment
            profilePic={item.profilePic}
            comment={item.comment}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // make FlatList take available space
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});
