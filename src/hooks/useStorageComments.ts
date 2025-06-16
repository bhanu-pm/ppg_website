import { useState, useEffect } from 'react';
import { JsonMessage } from '@/types/message';
import { fetchCommentsFromStorage } from '@/services/storageService';
import { toast } from '@/hooks/use-toast';

export const useStorageComments = () => {
  const [messages, setMessages] = useState<JsonMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchCommentsFromStorage();
      
      // Parse the data into JsonMessage format
      const parsedMessages: JsonMessage[] = data.map((item: any, index: number) => ({
        id: `storage_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        code: item.code || 'UNKNOWN',
        message: item.code || 'No code provided',
        timestamp: new Date(item.timestamp || Date.now()),
        severity: item.severity || 'success',
        metadata: {
          location: item.location,
          price: item.price
        }
      }));

      setMessages(parsedMessages);
      
      if (parsedMessages.length > 0) {
        toast({
          title: "Data Loaded",
          description: `Successfully loaded ${parsedMessages.length} messages from storage`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from storage';
      setError(errorMessage);
      setMessages([]); // Set empty messages on error
      
      // Show error toast but don't block the UI
      toast({
        title: "Storage Load Warning",
        description: "Could not load messages from storage. The rest of the application will continue to work.",
        variant: "warning"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  return { messages, isLoading, error, refetch: loadComments };
}; 