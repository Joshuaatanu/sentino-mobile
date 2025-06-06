import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import Markdown from "react-native-markdown-display";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deepAnalysisEnabled, setDeepAnalysisEnabled] = useState(false);
  const [useSearchEnabled, setUseSearchEnabled] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const randomLoadingMessages = [
    "Decrypting data...",
    "Analyzing patterns...",
    "Compiling response...",
    "Engaging neural networks...",
    "Synthesizing information...",
  ];

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(
          Math.random() * randomLoadingMessages.length
        );
        setLoadingMessage(randomLoadingMessages[randomIndex]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [loading]);

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

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Construct the payload
      const payload = {
        messages: [
          ...messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text,
          })),
          { role: "user", content: inputText },
        ],
        context:
          "You are Cybertron, a highly advanced AI chatbot. Your core functions are deep analysis and information retrieval via extensive search capabilities. Users can ask you anything. Utilize your analytical skills and search to provide insightful and comprehensive responses. Begin.", // Adjust context as needed
        deep_analysis: deepAnalysisEnabled,
        use_search: useSearchEnabled,
      };

      const response = await axios.post(
        "https://search-ai-beta.onrender.com/api/chat",
        payload
      );

      const chatResponse = response.data.response;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatResponse,
        isUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with chat API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "> ERROR: Unable to reach chat server.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" style={styles.backButton}>
          <Text style={styles.backButtonText}>← BACKCHANNEL</Text>
        </Link>
        <Text style={styles.title}>CHAT//PROTOCOL v2.1.7</Text>
      </View>

      <View style={styles.featureToggles}>
        <TouchableOpacity
          onPress={() => setDeepAnalysisEnabled(!deepAnalysisEnabled)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {deepAnalysisEnabled ? " DEEP ANALYSIS " : " DEEP ANALYSIS "}
          </Text>
          <View
            style={[
              styles.toggleIndicator,
              deepAnalysisEnabled ? styles.toggleActive : styles.toggleInactive,
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setUseSearchEnabled(!useSearchEnabled)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {useSearchEnabled ? " SEARCH RESULTS " : " SEARCH RESULTS "}
          </Text>
          <View
            style={[
              styles.toggleIndicator,
              useSearchEnabled ? styles.toggleActive : styles.toggleInactive,
            ]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        keyboardDismissMode="on-drag"
        maintainVisibleContentPosition={{
          minHeight: 44,
          autoscrollToTopThreshold: 100
        }}
        onContentSizeChange={() => 
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.botBubble,
              {
                backgroundColor: Platform.select({
                  ios: '#000000',
                  default: '#001100'
                }),
              },
              {
                shadowColor: '#00ff88',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 2,
              },
            ]}
          >
            {message.isUser ? (
              <Text style={styles.messageText}>{message.text}</Text>
            ) : (
              <Markdown style={styles.markdown}>{message.text}</Markdown>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#00ff88" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: "#00ff8822",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    marginBottom: 16,
    backgroundColor: Platform.OS === 'ios' ? '#000000' : 'transparent',
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
    padding: Platform.OS === 'ios' ? 4 : 0,
  },
  backButtonText: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
    fontSize: Platform.OS === 'ios' ? 16 : 12,
  },
  title: {
    color: "#00ffff",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Platform.OS === 'ios' ? 10 : 12,
    borderRadius: Platform.OS === 'ios' ? 16 : 8,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: "#001100",
    borderWidth: 1,
    borderColor: "#00ff8833",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#00ffff33",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  loadingBubble: {
    alignSelf: "flex-start",
    padding: Platform.OS === 'ios' ? 10 : 8,
    borderLeftWidth: Platform.OS === 'ios' ? 2 : 3,
    borderLeftColor: "#00ffff",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  loadingText: {
    color: "#00ffff",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderTopColor: "#00ff8822",
    backgroundColor: "#000",
  },
  input: {
    flex: 1,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: "#00ff8877",
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    color: "#00ff88",
    backgroundColor: "#001100",
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    fontFamily: "SpaceMono_400Regular",
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },
  sendButton: {
    backgroundColor: "#00ff88",
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    justifyContent: "center",
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    height: Platform.OS === 'ios' ? 44 : 40,
  },
  sendButtonText: {
    color: "#001100",
    fontFamily: "SpaceMono_400Regular",
    fontWeight: "bold",
    fontSize: Platform.OS === 'ios' ? 16 : 12,
  },
  featureToggles: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: "#00ff8833",
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    marginBottom: 10,
  },
  toggleText: {
    color: "#00ffff",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    marginRight: 8,
  },
  toggleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff0044",
  },
  toggleActive: {
    backgroundColor: "#00ff88",
  },
  toggleInactive: {
    backgroundColor: "#ff0044",
  },
  markdown: {
    body: {
      color: "#00ff88",
      fontFamily: "SpaceMono_400Regular",
      fontSize: 12,
      lineHeight: 16,
    },
    link: {
      color: "#00ffff",
      textDecorationLine: "underline",
    },
    // Add more styles as needed
  },
});
