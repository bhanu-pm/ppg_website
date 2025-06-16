import { useState, useEffect } from 'react';
import { JsonMessage } from '@/types/message';
import { fetchCommentsFromS3 } from '@/services/s3Service';
import { toast } from '@/hooks/use-toast';

export const useS3Comments = () => {
  const [messages, setMessages] = useState<JsonMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchCommentsFromS3();
      
      // Parse the data into JsonMessage format
      const parsedMessages: JsonMessage[] = data.map((item: any, index: number) => ({
        id: `s3_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
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
          description: `Successfully loaded ${parsedMessages.length} messages from S3`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from S3';
      setError(errorMessage);
      setMessages([]); // Set empty messages on error
      
      // Show error toast but don't block the UI
      toast({
        title: "S3 Load Warning",
        description: "Could not load messages from S3. The rest of the application will continue to work.",
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
