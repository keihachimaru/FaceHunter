import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { blockFriend } from '@/services/friendService';

interface FriendCardProps {
    name: string;
    profilePic?: string;
    id: string;
}

export default function FriendCard({ name, profilePic, id }: FriendCardProps) {
    const router = useRouter();

    function onPressblockFriend(id: number) {
        blockFriend(id);
    }

    return (
        <View style={[styles.friendCard, { backgroundColor : Colors.light.tint }]}>
          { profilePic ? ( 
                <Image 
                    source={{ uri: profilePic }} 
                    style={styles.profilePic}/>
            ) : (
                <View
                    style={[ styles.profilePic, { backgroundColor : 'white', borderRadius: '50%' }]}
                >
                </View>
            )
          }
          <Text>{name}</Text>
          <View style={{ flex: 1}}></View>
          <TouchableOpacity
            onPress={() => onPressblockFriend(id)}
            style={[ styles.blockButton ]}
          >
            <Image 
                source={require('@/assets/icons/block.png')} 
                style={[ styles.icon, { tintColor: Colors.light.backgroundLight } ]} 
            /> 
          </TouchableOpacity> 
          <TouchableOpacity
            onPress={() => router.replace(`/chat/${id}`)}
            style={[ styles.chatButton ]}
          >
            <Image 
            source={require('@/assets/icons/messenger.png')} 
            style={[ styles.icon, { tintColor: Colors.light.backgroundLight } ]} />
          </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  blockButton: {
    height: 28,
    width: 28,
    borderRadius: 16,
  },
  chatButton: {
    height: 28,
    width: 28,
    borderRadius: 16,
  },
  friendCard: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  icon: {
    height: 28,
    width: 28,
  },
  profilePic: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});
