// ChatKeyboard.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Keyboard,
} from "react-native";
import { Colors } from "@/constants/Colors";
interface KeyboardProps {
  onSend: (text: string) => void;
  placeholder?: string;
  setInput?: () => void;
  autoDismiss: boolean | null;
}

export default function ChatKeyboard({ onSend, placeholder, autoDismiss }: KeyboardProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const keyboardPlaceholder = placeholder ? placeholder : "Write a comment..."

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    if(autoDismiss) Keyboard.dismiss();
  };

  return (
    <View style={[styles.keyboardWrapper, focused && styles.focused]}>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={keyboardPlaceholder}
          placeholderTextColor="#999"
          style={styles.textBox}
          multiline
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Image source={require('@/assets/icons/send.png')} style={styles.sendText}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    width: "100%",
    display: "flex",
  },
  focused: {
    // optional: change background or shadow when typing
  },
  inputRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: Colors.light.primaryLight,
  },
  textBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    height: 32,
    width: 32,
    tintColor: "#fff",
  },
});
