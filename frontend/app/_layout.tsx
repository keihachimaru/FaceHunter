import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,   // ❌ disables swipe back
        headerBackVisible: false // ❌ hides the < back button in header
      }}
    />
  );
}
