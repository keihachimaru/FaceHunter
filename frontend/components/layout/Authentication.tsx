// Authentication.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import DeepButton from '@/components/ui/DeepButton';
import { RegisterType, LoginType } from '../interfaces';

interface AuthenticationProps {
  handleLogin: () => void;
  handleRegister: () => void;
  loginData: LoginType;
  setLoginData: React.Dispatch<React.SetStateAction<LoginType>>;
  registerData: RegisterType;
  setRegisterData: React.Dispatch<React.SetStateAction<RegisterType>>;
  isLoginMode: boolean;
  setIsLoginMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Authentication({
  handleLogin,
  handleRegister,
  loginData,
  setLoginData,
  registerData,
  setRegisterData,
  isLoginMode,
  setIsLoginMode
}: AuthenticationProps) {
  const colors = Colors;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isLoginMode ? 'Sign In' : 'Sign Up'}
          </Text>

          {isLoginMode ? (
            <>
              <TextInput
                placeholder="Email"
                value={loginData.email}
                onChangeText={(v) => setLoginData({ ...loginData, email: v })}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Password"
                value={loginData.password}
                onChangeText={(v) => setLoginData({ ...loginData, password: v })}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <DeepButton
                title="Login"
                onPress={handleLogin}
                style={[styles.button, { backgroundColor: colors.buttonBackground }]}
                textStyle={{ color: colors.buttonText }}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder="Email"
                value={registerData.email}
                onChangeText={(v) => setRegisterData({ ...registerData, email: v })}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Username"
                value={registerData.username}
                onChangeText={(v) => setRegisterData({ ...registerData, username: v })}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                placeholder="Password"
                value={registerData.password}
                onChangeText={(v) => setRegisterData({ ...registerData, password: v })}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <DeepButton
                title="Sign Up"
                onPress={handleRegister}
                style={[styles.button, { backgroundColor: colors.buttonBackground }]}
                textStyle={{ color: colors.buttonText }}
              />
            </>
          )}

          {/* Toggle link */}
          <Pressable onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isLoginMode
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});
