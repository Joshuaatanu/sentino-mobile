import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Modal,
} from "react-native";
import { searchQuery } from "./api";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useFonts, SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import * as WebBrowser from "expo-web-browser";
import Markdown from "react-native-markdown-display";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const abortController = useRef(new AbortController());
  const cache = useRef(new Map());

  const handleSearch = useCallback(async () => {
    if (cache.current.has(query)) {
      setAnswer(cache.current.get(query).answer);
      setResults(cache.current.get(query).search_results);
      return;
    }

    try {
      Keyboard.dismiss();
      abortController.current = new AbortController();
      setLoading(true);
      const response = await searchQuery(query, abortController.current.signal);
      setAnswer(response.answer);
      setResults(response.search_results);
      setHistory((prev) => [query, ...prev.slice(0, 4)]);
      cache.current.set(query, response);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      setAnswer("> ERROR: CONNECTION TERMINATED\n> REBOOT SEQUENCE INITIATED");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const RenderMarkdown = useMemo(
    () => (
      <Markdown
        style={{
          body: styles.answer,
          code_inline: { color: "#00ff88", backgroundColor: "#002200" },
          link: { color: "#00ffff" },
          paragraph: { marginBottom: 16 },
        }}
        onPressLink={(url) => WebBrowser.openBrowserAsync(url)}
      >
        {answer}
      </Markdown>
    ),
    [answer]
  );

  const handleLongPress = (url: string) => {
    setPreviewContent(url);
    setPreviewVisible(true);
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          {RenderMarkdown}
          {results.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultCard}
              onPress={() => WebBrowser.openBrowserAsync(result.href)}
              onLongPress={() => handleLongPress(result.href)}
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
      )}

      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Preview:</Text>
            <Text style={styles.modalText}>{previewContent}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPreviewVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  loadingText: {
    color: "#00ff88",
    fontFamily: "Courier New",
    fontSize: 16,
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
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
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
  snippet: {
    color: "#00ff8877",
    fontFamily: "Courier New",
    lineHeight: 16,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "#001100",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00ff8833",
  },
  modalText: {
    color: "#00ff88",
    fontFamily: "Courier New",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#00ff88",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#001100",
    fontFamily: "Courier New",
    fontWeight: "bold",
  },
});
