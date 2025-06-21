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

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the new API endpoint that returns your format
      const response: YourApiResponse = await apiService.getLatestMessages();
      
      // Parse the response using our parser
      const parsed = parseApiResponse(response);
      
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from API';
      setError(errorMessage);
      
      toast({
        title: "API Load Warning",
        description: "Could not load messages from API. The rest of the application will continue to work.",
        variant: "warning"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMessage = useCallback(async (message: Omit<JsonMessage, 'id'>) => {
    try {
      const response = await apiService.addMessage(message);
      if (response.success) {
        // Refresh messages after adding
        await loadMessages();
        toast({
          title: "Message Added",
          description: "Successfully added new message",
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to add message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add message';
      toast({
        title: "Add Message Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [loadMessages]);

  const addMessages = useCallback(async (newMessages: Omit<JsonMessage, 'id'>[]) => {
    try {
      const response = await apiService.addMessages(newMessages);
      if (response.success) {
        // Refresh messages after adding
        await loadMessages();
        toast({
          title: "Messages Added",
          description: `Successfully added ${newMessages.length} messages`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to add messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add messages';
      toast({
        title: "Add Messages Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [loadMessages]);

  const healthCheck = useCallback(async () => {
    try {
      const response = await apiService.healthCheck();
      return response.success;
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
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
    refetch: loadMessages,
    addMessage,
    addMessages,
    healthCheck,
  };
}; 