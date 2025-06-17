import { useEffect, useState } from 'react';
import { fetchMessages } from '@/services/messageService';

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

interface ErrorState {
  message: string;
  code: string;
}

interface MessagesProps {
  initialMessages: Message[];
  initialError?: ErrorState;
}

export const Messages = ({ initialMessages, initialError }: MessagesProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(initialError || null);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch (err) {
        let errorMessage = 'Failed to load messages';
        let errorCode = 'UNKNOWN_ERROR';

        if (err instanceof Error) {
          if (err.message.includes('HTTP error')) {
            errorCode = 'HTTP_ERROR';
            errorMessage = 'Server error while fetching messages';
          } else if (err.message.includes('Invalid data format')) {
            errorCode = 'INVALID_FORMAT';
            errorMessage = 'Invalid message data format';
          } else if (err.message.includes('Invalid message format')) {
            errorCode = 'INVALID_MESSAGE';
            errorMessage = 'Invalid message structure';
          }
        }

        setError({
          message: errorMessage,
          code: errorCode,
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have initial messages
    if (initialMessages.length === 0) {
      loadMessages();
    }
  }, [initialMessages]);

  const renderError = (error: ErrorState) => {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Messages</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
              <p className="mt-1 text-xs">Error code: {error.code}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return renderError(error);
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500">No messages available</p>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <p className="text-gray-800">{message.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(message.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 