// Feed.tsx
import React from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FacehuntType } from '@/interfaces/index';
import LikeIcon from '@/assets/icons/like.png';
import CommentIcon from '@/assets/icons/comment.png';

interface FeedProps {
  posts: FacehuntType[];
  onPressPost: (id: number | string) => void;
  loadMorePosts: () => void;
  loadingMore: boolean;
}

export default function Feed({ posts, onPressPost, loadMorePosts, loadingMore }: FeedProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPressPost(item.id)}
            style={({ pressed }) => [
              styles.postCard,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.postImage} />

            <View style={styles.postInfo}>
              <View style={styles.infoItem}>
                <Image source={LikeIcon} style={[ styles.iconBig, { tintColor: Colors.light.quaternaryDark }]} />
                <Text style={styles.postText}>{item.likes}</Text>
              </View>
              <View style={styles.infoItem}>
                <Image source={CommentIcon} style={[ styles.icon, { tintColor: Colors.light.secondaryDark }]} />
                <Text style={styles.postText}>{item.commentsCount}</Text>
              </View>
            </View>
          </Pressable>
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
  },
  postsList: {
    paddingBottom: 20,
  },
  postCard: {
    width: '90%',
    marginVertical: 10,
    marginHorizontal: '5%',
    overflow: 'hidden',
    borderColor: Colors.light.primaryLight,
    borderBottomWidth: 4,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderBottomWidth: 4,
    borderRadius: 18,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 8,
    borderColor: Colors.light.primary
  },
  postInfo: {
    flexDirection: 'row-reverse',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  postText: {
    color: Colors.light.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  icon: {
    height: 24,
    width: 24,
    margin: 2,
  },
  iconBig: {
    height: 28,
    width: 28,
  }
});

