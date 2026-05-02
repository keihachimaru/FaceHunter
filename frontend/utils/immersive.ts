import ImmersiveMode from 'react-native-immersive';

export function enableImmersive() {
  try {
    ImmersiveMode.on();
  } catch {}
}

export function disableImmersive() {
  try {
    ImmersiveMode.off();
  } catch {}
}
