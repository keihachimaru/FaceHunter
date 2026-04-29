import React from 'react';
import { ViewStyle, View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import LikeButton from '@/components/ui/LikeButton';

interface FacehunterContainerProps {
  image: string;
  hasLiked: Boolean;
  setHasLiked: () => void;
  onPress: () => void;
}

export default function FacehunterContainer({ image, hasLiked, setHasLiked, onPress }: FacehunterContainerProps ) {
  return (
    <View style={styles.facehuntContainer}>
      <View style={[ styles.facehuntImageContainer , { backgroundColor: Colors.light.background }]}>
         <Image source={{ uri: image }} style={styles.facehuntImage}/>
      </View>

      <View style={[ styles.likesContainer ]}>
        <LikeButton
            liked={hasLiked}
            setHasLiked={setHasLiked}
            onPress={onPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  facehuntContainer: {
      paddingHorizontal: 20,
  },
  facehuntImage: {
    flex: 1,
    width: '100%',
  },
  facehuntImageContainer: {
    width: '100%',
    aspectRatio: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  likesContainer: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});

