import React from 'react';
import { JsonMessage } from '@/types/message';
import MessageCard from './MessageCard';
import MessageCardSkeleton from './MessageCardSkeleton'; // Import the new skeleton
import { Database, Filter, Loader, MessageCircle } from 'lucide-react';

interface MessageListProps {
  messages: JsonMessage[];
  timeFrame: string;
  isLoading: boolean; // Add isLoading prop
  noNewCommentsMessage?: string | null; // Add prop for "No new comments!" message
}

const MessageList: React.FC<MessageListProps> = ({ messages, timeFrame, isLoading, noNewCommentsMessage }) => {
  // Show skeleton loaders while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Loader className="w-5 h-5 text-cyber-green animate-spin" />
          <h2 className="text-lg font-pixel text-cyber-green glow-text">
            LOADING MESSAGES...
          </h2>
        </div>
        <div className="space-y-0">
          {[...Array(3)].map((_, index) => (
            <MessageCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show "No new comments!" message if provided
  if (noNewCommentsMessage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-cyber-green" />
          <h2 className="text-lg font-pixel text-cyber-green glow-text">
            MESSAGE FEED [0]
          </h2>
        </div>
        <div className="cyber-border p-8 rounded-sm bg-cyber-dark-alt/30 text-center">
          <MessageCircle className="w-12 h-12 text-cyber-green/50 mx-auto mb-4" />
          <h3 className="text-lg font-pixel text-cyber-green/70 mb-2">
            {noNewCommentsMessage}
          </h3>
          <p className="text-sm text-cyber-green/50 font-mono">
            No new messages available at this time.
          </p>
        </div>
      </div>
    );
  }

  // Show this message only after loading is complete and there are no messages
  if (!isLoading && messages.length === 0) {
    return (
      <div className="cyber-border p-8 rounded-sm bg-cyber-dark-alt/30 text-center">
        <Database className="w-12 h-12 text-cyber-green/50 mx-auto mb-4" />
        <h3 className="text-lg font-pixel text-cyber-green/70 mb-2">
          NO MESSAGES AVAILABLE
        </h3>
        <p className="text-sm text-cyber-green/50 font-mono">
          The message database is empty or not yet initialized.
        </p>
      </div>
    );
  }

  // Render the list of messages once loaded
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-cyber-green" />
        <h2 className="text-lg font-pixel text-cyber-green glow-text">
          MESSAGE FEED [{messages.length}]
        </h2>
      </div>
      
      <div className="space-y-0">
        {messages.map((message, index) => (
          <MessageCard
            key={message.id}
            message={message}
            isLatest={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
