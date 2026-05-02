// Taskbar.tsx
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Map route to icons inside @/assets/icons/
const routes = [
  { name: 'Settings', route: '/settings', icon: require('@/assets/icons/settings.png') },
  //{ name: 'Post', route: '/create', icon: require('@/assets/icons/insert-picture-icon.png') },
  { name: 'Friends', route: '/friends', icon: require('@/assets/icons/send.png') },
  { name: 'Account', route: '/account', icon: require('@/assets/icons/user.png') },
];

interface TaskbarProps {
    disabled?: boolean;
}

export default function Taskbar({ disabled } : TaskbarProps) {
  const router = useRouter();

  return (
    <View style={[styles.taskbar, disabled && styles.disabled]}>
      {routes.map(({ name, route, icon }) => (
        <TouchableOpacity
          key={name}
          onPress={() => router.push(route)}
          disabled={disabled}
          style={styles.taskbarButton}
        >
          <Image source={icon} style={[ styles.icon, { tintColor: Colors.buttonText } ]} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  taskbar: {
    height: 80,
    flexDirection: 'row',
    gap: 30,
    justifyContent : 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  taskbarButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary, // theme tint
  },
  disabled: {
    backgroundColor: Colors.gray500,
    borderBottomColor: Colors.gray500,
    borderColor: Colors.gray600,
  },
});
