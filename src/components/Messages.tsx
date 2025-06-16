import { useEffect, useState } from 'react';
import { downloadData } from '@aws-amplify/storage';

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

export const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const result = await downloadData('comment_db.json');

        if (!result) {
          setMessages([]);
          return;
        }

        const textData = await result.text();
        const data = JSON.parse(textData);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center p-4">Loading messages...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      {messages.length === 0 ? (
        <p>No messages available</p>
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