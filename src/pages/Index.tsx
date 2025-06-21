// src/pages/Index.tsx
import React, { useState, useMemo } from 'react';
import { JsonMessage } from '@/types/message';
import JsonParser from '@/components/JsonParser';
import MessageList from '@/components/MessageList';
import TimeFrameSelector, { timeFrames } from '@/components/TimeFrameSelector';
import { useApiMessages } from '@/hooks/useApiMessages';
import { isAfter, subHours } from 'date-fns';
import { Terminal, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { messages, isLoading, refetch, addMessages, lastResponse, statusCode, noNewCommentsMessage } = useApiMessages({
    autoRefresh: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('now');
  const [showParser, setShowParser] = useState(false);

  const handleMessageParsed = async (newMessages: JsonMessage[]) => {
    try {
      // Convert JsonMessage to the format expected by API (without id)
      const messagesToAdd = newMessages.map(({ id, ...message }) => message);
      await addMessages(messagesToAdd);
      setShowParser(false);
    } catch (error) {
      console.error('Failed to add messages:', error);
    }
  };

  const filteredMessages = useMemo(() => {
    if (selectedTimeFrame === 'all') return messages;
    
    const frame = timeFrames.find(f => f.value === selectedTimeFrame);
    if (!frame) return messages;
    
    const cutoffTime = subHours(new Date(), frame.hours);
    return messages.filter(message => isAfter(message.timestamp, cutoffTime));
  }, [messages, selectedTimeFrame]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-cyber-dark p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="cyber-border p-4 sm:p-6 rounded-sm bg-cyber-dark-alt/50 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-cyber-green animate-glow" />
              <div>
                <h1 className="text-xl sm:text-2xl font-pixel text-cyber-green glow-text">
                  PPG
                </h1>
                <p className="text-xs sm:text-sm text-cyber-green/70 font-mono">
                  Postmates Promo-code Grabber
                </p>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              <div className="text-sm font-mono text-cyber-green">
                MESSAGES: {filteredMessages.length}
              </div>
              {lastResponse && (
                <div className="text-xs font-mono text-cyber-green/60 mt-1">
                  LAST UPDATE: {lastResponse}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Controls Panel */}
          <div className="xl:col-span-1 space-y-4">
            {/* Add Message Button */}
            <div className="cyber-border p-4 rounded-sm bg-cyber-dark-alt/30">
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowParser(!showParser)}
                  className="flex-1 bg-cyber-green hover:bg-cyber-green-dark text-cyber-dark font-pixel text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD MESSAGE
                </Button>
                <Button
                  onClick={refetch}
                  disabled={isLoading}
                  className="bg-cyber-blue hover:bg-cyber-blue-dark text-white font-pixel text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* JSON Parser (conditionally shown) */}
            {showParser && (
              <JsonParser onMessageParsed={handleMessageParsed} />
            )}
            
            {/* Time Frame Selector */}
            <div className="cyber-border p-4 rounded-sm bg-cyber-dark-alt/30">
              <TimeFrameSelector
                selectedTimeFrame={selectedTimeFrame}
                onTimeFrameChange={setSelectedTimeFrame}
              />
            </div>

            {/* API Status */}
            <div className="cyber-border p-4 rounded-sm bg-cyber-dark-alt/30">
              <div className="text-sm font-pixel text-cyber-green mb-2">API STATUS:</div>
              <div className="text-xs font-mono text-cyber-green/70">
                {isLoading ? 'FETCHING...' : statusCode ? `CONNECTED (${statusCode})` : 'CONNECTED'}
              </div>
              {lastResponse && (
                <div className="text-xs font-mono text-cyber-green/60 mt-1">
                  {lastResponse}
                </div>
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="xl:col-span-2">
            <MessageList 
              messages={filteredMessages} 
              timeFrame={selectedTimeFrame}
              isLoading={isLoading}
              noNewCommentsMessage={noNewCommentsMessage}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-xs text-cyber-green/40 font-mono">
          <div className="cyber-border p-3 rounded-sm bg-cyber-dark-alt/20">
            SYSTEM STATUS: OPERATIONAL | INVOKED AT: {getCurrentTime()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
