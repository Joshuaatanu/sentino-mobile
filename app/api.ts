import axios from 'axios';

const API_URL = 'https://search-ai-beta.onrender.com/api/query';
const REQUEST_TIMEOUT = 20000;

interface SearchResult {
    href: string;
    title: string;
    body: string;
}

interface SearchResponse {
    answer: string;
    search_results: SearchResult[];
    deep_analysis: boolean;
}

export const searchQuery = async (
    query: string,
    signal?: AbortSignal,
    deepAnalysis = false
): Promise<SearchResponse> => {
    try {
        const response = await axios.post<SearchResponse>(
            API_URL,
            {
                query,
                enable_deep_analysis: deepAnalysis
            },
            {
                signal,
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (!axios.isCancel(error)) {
            console.error('API Error:', error);
            throw new Error('Failed to fetch search results. Please try again later.');
        }
        throw error;
    }
};

// Add dummy export to satisfy route requirements
export default function APIService() {
    return null;
}