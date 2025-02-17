import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { searchQuery } from "./api";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useFonts, SpaceMono_400Regular } from "@expo-google-fonts/space-mono";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayAnswer, setDisplayAnswer] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const abortController = useRef(new AbortController());

  useEffect(() => {
    if (answer.length > 0) {
      let index = 0;
      const typingInterval = setInterval(() => {
        setDisplayAnswer((prev) => prev + answer.charAt(index));
        index++;
        if (index === answer.length) {
          clearInterval(typingInterval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 30);
      return () => clearInterval(typingInterval);
    }
  }, [answer]);

  const handleSearch = async () => {
    try {
      Keyboard.dismiss();
      abortController.current = new AbortController();
      setLoading(true);
      setDisplayAnswer("");
      const response = await searchQuery(query, abortController.current.signal);
      setAnswer(response.answer);
      setResults(response.search_results);
      setHistory((prev) => [query, ...prev.slice(0, 4)]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      setAnswer("> ERROR: CONNECTION TERMINATED\n> REBOOT SEQUENCE INITIATED");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SENTINO://ROOT_ACCESS</Text>
      </View>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Enter your question..."
        placeholderTextColor="#00ff8877"
        keyboardAppearance="dark"
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

      {history.length > 0 && (
        <View style={styles.historyContainer}>
          {history.map((item, index) => (
            <Text key={index} style={styles.historyItem}>
              $ {item}
            </Text>
          ))}
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.answer}>{displayAnswer}</Text>
        {results.map((result, index) => (
          <TouchableOpacity
            key={index}
            style={styles.resultCard}
            onPress={() => Clipboard.setStringAsync(result.href)}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultIndex}>#{index + 1}</Text>
              <Text style={styles.resultDomain}>
                {new URL(result.href).hostname}
              </Text>
            </View>
            <Text style={styles.snippet}>{result.body}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#00ff8877",
    padding: 12,
    marginBottom: 16,
    color: "#00ff88",
    backgroundColor: "#001100",
    borderRadius: 4,
    fontFamily: "Courier New",
  },
  button: {
    backgroundColor: "#002200",
    borderWidth: 1,
    borderColor: "#00ff88",
    padding: 14,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: "#00ff8877",
  },
  buttonText: {
    color: "#00ff88",
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Courier New",
  },
  resultsContainer: {
    marginTop: 16,
    flex: 1,
  },
  answer: {
    fontSize: 16,
    marginBottom: 16,
    color: "#00ff88",
    fontFamily: "Courier New",
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: "#001100",
    padding: 16,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#00ff8833",
  },
  title: {
    fontWeight: "bold",
    color: "#00ffdd",
    fontFamily: "Courier New",
    marginBottom: 8,
  },
  snippet: {
    color: "#00ff8877",
    fontFamily: "Courier New",
    lineHeight: 16,
    marginBottom: 8,
  },
  url: {
    color: "#00ffff",
    fontSize: 12,
    fontFamily: "Courier New",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8822",
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerText: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    letterSpacing: 2,
  },
  historyContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8811",
    marginBottom: 12,
  },
  historyItem: {
    color: "#00ff8866",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultIndex: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
  },
  resultDomain: {
    color: "#00ffff",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
  },
});
