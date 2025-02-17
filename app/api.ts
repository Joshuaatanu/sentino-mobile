import axios from 'axios';

const API_URL = 'https://cfab-109-175-154-194.ngrok-free.app/api/query';
const REQUEST_TIMEOUT = 10000;

export const searchQuery = async (query: string, signal?: AbortSignal) => {
    try {
        const response = await axios.post(API_URL, { query }, {
            signal,
            timeout: REQUEST_TIMEOUT,
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (!axios.isCancel(error)) {
            console.error('API Error:', error);
            throw error;
        }
    }
};