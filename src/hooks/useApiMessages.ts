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
  
  const [messages, setMessages] = useState<JsonMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [noNewCommentsMessage, setNoNewCommentsMessage] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNoNewCommentsMessage(null);
    
    try {
      // Use the new API endpoint that returns your format
      const response: YourApiResponse = await apiService.getLatestMessages();
      
      // Debug logging
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      
      // Track the status code
      setStatusCode(response.statusCode);
      console.log('Status code set to:', response.statusCode);
      
      // Parse the response using our parser
      const parsed = parseApiResponse(response);
      console.log('Parsed response:', parsed);
      
      // Check if the response contains "No new comments!" message
      // Handle both plain string and JSON-encoded string cases
      if (typeof response.body === 'string') {
        console.log('Body is string:', response.body);
        // Try to parse as JSON first (in case it's json.dumps output)
        try {
          const parsedBody = JSON.parse(response.body);
          console.log('Parsed body as JSON:', parsedBody);
          if (typeof parsedBody === 'string' && parsedBody.includes('No new comments')) {
            console.log('Found "No new comments" in parsed JSON body');
            setNoNewCommentsMessage(parsedBody);
          }
        } catch {
          console.log('Body is not valid JSON, checking for plain string');
          // If not JSON, check if it's a plain string
          if (response.body.includes('No new comments')) {
            console.log('Found "No new comments" in plain string body');
            setNoNewCommentsMessage(response.body);
          }
        }
      }
      
      if (parsed.hasNewMessages) {
        // Add new messages to existing ones
        setMessages(prev => {
          const newMessages = [...parsed.messages, ...prev];
          // Sort by timestamp (newest first)
          return newMessages.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
        
        toast({
          title: "New Messages",
          description: parsed.message,
        });
      }
      
      setLastResponse(parsed.message);
      
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from API';
      setError(errorMessage);
      setStatusCode(null);
      
      // Don't show the warning toast for expected "No new comments!" responses
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
  }, []);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMessages();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    lastResponse,
    statusCode,
    noNewCommentsMessage,
    refetch: loadMessages,
  };
}; 