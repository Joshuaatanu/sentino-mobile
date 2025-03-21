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
import { Link } from "expo-router";

// Define types for state variables
interface SearchResult {
  href: string;
  body: string;
}

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const abortController = useRef(new AbortController());
  const cache = useRef(
    new Map<
      string,
      { answer: string; search_results: SearchResult[]; deep_analysis: boolean }
    >()
  );
  const [enableDeepAnalysis, setEnableDeepAnalysis] = useState(false);
  const [currentDeepAnalysis, setCurrentDeepAnalysis] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const loadingMessages = [
    "Connecting to the matrix...",
    "Decrypting the mainframe...",
    "Compiling data streams...",
    "Synchronizing with the server...",
    "Analyzing quantum fields...",
  ];

  const handleSearch = useCallback(async () => {
    if (cache.current.has(query)) {
      const cachedResponse = cache.current.get(query);
      if (cachedResponse) {
        setAnswer(cachedResponse.answer);
        setResults(cachedResponse.search_results);
        setCurrentDeepAnalysis(cachedResponse.deep_analysis);
      }
      return;
    }

    try {
      Keyboard.dismiss();
      abortController.current = new AbortController();
      setLoading(true);
      setLoadingMessage(
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
      );
      const response = await searchQuery(
        query,
        abortController.current.signal,
        enableDeepAnalysis
      );
      setAnswer(response.answer);
      setResults(response.search_results);
      setCurrentDeepAnalysis(response.deep_analysis);
      setHistory((prev) => [query, ...prev.slice(0, 4)]);
      cache.current.set(query, response);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      setAnswer("> ERROR: CONNECTION TERMINATED\n> REBOOT SEQUENCE INITIATED");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [query, enableDeepAnalysis]);

  const RenderMarkdown = useMemo(
    () => (
      <View style={currentDeepAnalysis ? styles.deepAnalysisContainer : null}>
        {currentDeepAnalysis && (
          <Text style={styles.deepAnalysisHeader}>
            DEEP ANALYSIS REPORT // CYBERSCAN v2.1.7
          </Text>
        )}
        <Markdown
          style={{
            ...(currentDeepAnalysis && {
              body: [styles.answer, { color: "#00ffff" }],
              heading1: { color: "#ff0044" },
              code_inline: { backgroundColor: "#00000022" },
            }),
            body: styles.answer,
            code_inline: {
              color: "#00ff88",
              backgroundColor: "#002200",
              padding: 4,
              borderRadius: 4,
            },
            link: {
              color: "#00ffff",
              textDecorationLine: "underline",
            },
            paragraph: {
              marginBottom: 16,
              lineHeight: 20,
            },
            heading1: {
              color: "#00ff88",
              fontSize: 18,
              marginVertical: 8,
              fontFamily: "SpaceMono_400Regular",
            },
            heading2: {
              color: "#00ffff",
              fontSize: 16,
              marginVertical: 6,
              fontFamily: "SpaceMono_400Regular",
            },
            list_item: {
              flexDirection: "row",
              marginBottom: 8,
            },
            bullet_list_icon: {
              color: "#00ff8877",
              marginRight: 8,
            },
            strong: {
              color: "#00ff88",
              fontFamily: "SpaceMono_400Regular",
            },
            em: {
              color: "#00ff8877",
              fontStyle: "italic",
            },
          }}
          onPressLink={(url) => WebBrowser.openBrowserAsync(url)}
        >
          {currentDeepAnalysis
            ? `> ANALYSIS DEPTH: MAXIMUM\n${answer}`
            : answer}
        </Markdown>
      </View>
    ),
    [answer, currentDeepAnalysis]
  );

  const handleLongPress = (url: string) => {
    setPreviewContent(url);
    setPreviewVisible(true);
  };

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(answer);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [answer]);

  const handleRefine = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const modifiers = {
      simplify: "Simplify this for non-experts: ",
      expand: "Provide detailed analysis of: ",
      technical: "Give technical breakdown of: ",
    };
    setQuery(`${modifiers[type as keyof typeof modifiers]}${query}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SENTINO://ROOT_ACCESS</Text>
        <TouchableOpacity
          style={styles.deepAnalysisToggle}
          onPress={() => setEnableDeepAnalysis(!enableDeepAnalysis)}
        >
          <Text style={styles.deepAnalysisText}>
            {enableDeepAnalysis
              ? "DEEP ANALYSIS: ONLINE"
              : "DEEP ANALYSIS: OFFLINE"}
          </Text>
          <View
            style={[
              styles.toggleIndicator,
              enableDeepAnalysis && styles.toggleActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
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
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>SEARCH</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.refinementContainer}>
        {["Simplify", "Expand", "Technical"].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.refinementButton}
            onPress={() => handleRefine(type.toLowerCase())}
          >
            <Text style={styles.refinementText}>REFINE: {type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          {RenderMarkdown}
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyButtonText}>Copy Answer</Text>
          </TouchableOpacity>
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

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Link href="/chat" style={styles.chatButtonText}>
          INITIATE CHAT PROTOCOL
        </Link>
      </TouchableOpacity>

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
    color: "#00ff88",
    backgroundColor: "#001100",
    borderRadius: 4,
    fontFamily: "Courier New",
    flex: 1,
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
  copyButton: {
    backgroundColor: "#00ff88",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  copyButtonText: {
    color: "#001100",
    fontFamily: "Courier New",
    fontWeight: "bold",
  },
  deepAnalysisToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#00ff8833",
    borderRadius: 4,
  },
  deepAnalysisText: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
  },
  toggleIndicator: {
    width: 12,
    height: 12,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: "#ff0044",
  },
  toggleActive: {
    backgroundColor: "#00ff88",
    shadowColor: "#00ff88",
    shadowRadius: 4,
  },
  refinementContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  refinementButton: {
    borderWidth: 1,
    borderColor: "#00ff8833",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  refinementText: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: "#00ff88",
    borderRadius: 4,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchButtonText: {
    color: "#001100",
    fontFamily: "SpaceMono_400Regular",
    fontWeight: "bold",
    fontSize: 12,
  },
  chatButton: {
    borderWidth: 1,
    borderColor: "#00ffff",
    padding: 12,
    marginTop: 16,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#00ffff",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    fontWeight: "bold",
  },
  deepAnalysisContainer: {
    borderLeftWidth: 3,
    borderLeftColor: "#00ff88",
    paddingLeft: 12,
    marginBottom: 20,
  },
  deepAnalysisHeader: {
    color: "#00ff88",
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
    marginBottom: 8,
    textShadowColor: "#00ff8877",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
