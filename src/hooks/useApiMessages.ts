import { useState, useEffect, useCallback } from 'react';
import { JsonMessage } from '@/types/message';
import { apiService, YourApiResponse } from '@/services/apiService';
import { parseApiResponse } from '@/utils/apiParser';
import { toast } from '@/hooks/use-toast';

export interface UseApiMessagesOptions {
  timeFrame?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useApiMessages = (options: UseApiMessagesOptions = {}) => {
  const { timeFrame, autoRefresh = false, refreshInterval = 30000 } = options;
  
  // Caches for each time frame
  const [cache, setCache] = useState<{ [key: string]: JsonMessage[] }>({});
  const [messages, setMessages] = useState<JsonMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [noNewCommentsMessage, setNoNewCommentsMessage] = useState<string | null>(null);

  // Track if a time frame has been fetched before
  const [fetched, setFetched] = useState<{ [key: string]: boolean }>({});

  // Fetch and update cache for the current time frame
  const fetchAndCache = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNoNewCommentsMessage(null);
    try {
      let response: YourApiResponse;
      if (timeFrame === 'all') {
        response = await apiService.getAllComments();
      } else {
        response = await apiService.getLatestMessages();
      }
      setStatusCode(response.statusCode);
      const parsed = parseApiResponse(response);
      if (parsed.hasNewMessages) {
        const sorted = parsed.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setCache(prev => ({ ...prev, [timeFrame || 'now']: sorted }));
        setMessages(sorted);
        setFetched(prev => ({ ...prev, [timeFrame || 'now']: true }));
        toast({ title: "New Messages", description: parsed.message });
      } else {
        setCache(prev => ({ ...prev, [timeFrame || 'now']: [] }));
        setMessages([]);
        setFetched(prev => ({ ...prev, [timeFrame || 'now']: true }));
      }
      setLastResponse(parsed.message);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from API';
      setError(errorMessage);
      setStatusCode(null);
      if (!errorMessage.includes('No new comments')) {
        toast({
          title: "API Load Warning",
          description: "Could not load messages from API. The rest of the application will continue to work.",
          variant: "warning"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame]);

  // On time frame change, show cached messages if available, otherwise fetch
  useEffect(() => {
    const key = timeFrame || 'now';
    if (fetched[key]) {
      setMessages(cache[key] || []);
    } else {
      fetchAndCache();
    }
  }, [timeFrame]);

  // Manual refresh always fetches and updates cache
  const refetch = useCallback(() => {
    fetchAndCache();
  }, [fetchAndCache]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAndCache();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAndCache]);

  return {
    messages,
    isLoading,
    error,
    lastResponse,
    statusCode,
    noNewCommentsMessage,
    refetch,
  };
}; 