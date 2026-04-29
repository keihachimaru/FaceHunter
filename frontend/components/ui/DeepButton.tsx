import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function DeepButton({ title, onPress, style, textStyle, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        style,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.buttonBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',

    // 3D bottom shadow effect
    borderBottomColor: Colors.light.buttonBackgroundDark,
    borderBottomWidth: 4,

    // outline
    borderColor: Colors.light.border,
    borderWidth: 2,
  },
  text: {
    color: Colors.light.buttonText,
    fontWeight: '700',
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  disabled: {
    backgroundColor: '#A1A1AA',
    borderBottomColor: '#888',
    borderColor: '#666',
  },
});
