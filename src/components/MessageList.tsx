
import React from 'react';
import { JsonMessage } from '@/types/message';
import MessageCard from './MessageCard';
import { Database, Filter } from 'lucide-react';

interface MessageListProps {
  messages: JsonMessage[];
  timeFrame: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, timeFrame }) => {
  if (messages.length === 0) {
    return (
      <div className="cyber-border p-8 rounded-sm bg-cyber-dark-alt/30 text-center">
        <Database className="w-12 h-12 text-cyber-green/50 mx-auto mb-4" />
        <h3 className="text-lg font-pixel text-cyber-green/70 mb-2">
          NO MESSAGES FOUND
        </h3>
        <p className="text-sm text-cyber-green/50 font-mono">
          Parse some JSON messages to see them here
        </p>
      </div>
    );
  }

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
