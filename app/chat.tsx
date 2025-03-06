import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Keyboard } from 'react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setLoading(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `> RESPONSE PROTOCOL INITIATED\n${inputText.toUpperCase()} ANALYSIS IN PROGRESS...`,
        isUser: false,
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="/" style={styles.backButton}>
          <Text style={styles.backButtonText}>&lt; BACKCHANNEL</Text>
        </Link>
        <Text style={styles.title}>CHAT//PROTOCOL v2.1.7</Text>
      </View>

      <ScrollView 
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text style={styles.messageText}>
              {message.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingBubble}>
            <Text style={styles.loadingText}>
              > DECRYPTING MESSAGE...
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="TYPE MESSAGE..."
          placeholderTextColor="#00ff8877"
          onSubmitEditing={handleSend}
          keyboardAppearance="dark"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8822',
    paddingBottom: 12,
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backButtonText: {
    color: '#00ff88',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
  },
  title: {
    color: '#00ffff',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
  },
  chatContent: {
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#001100',
    borderWidth: 1,
    borderColor: '#00ff8833',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#00ffff33',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#00ff88',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00ffff',
  },
  loadingText: {
    color: '#00ffff',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#00ff8877',
    padding: 12,
    color: '#00ff88',
    backgroundColor: '#001100',
    borderRadius: 4,
    fontFamily: 'SpaceMono_400Regular',
  },
  sendButton: {
    backgroundColor: '#00ff88',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#001100',
    fontFamily: 'SpaceMono_400Regular',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 