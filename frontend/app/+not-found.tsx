import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <View>
        <Link href="/" style={styles.link}>
          <Text style={{ color: Colors.tint }}>Go to home screen!</Text>
        </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
