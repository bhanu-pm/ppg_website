// src/pages/Index.tsx
import React, { useState, useMemo } from 'react';
import { JsonMessage } from '@/types/message';
import MessageList from '@/components/MessageList';
import TimeFrameSelector, { timeFrames } from '@/components/TimeFrameSelector';
import { useApiMessages } from '@/hooks/useApiMessages';
import { isAfter, subHours } from 'date-fns';
import { Terminal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { messages, isLoading, refetch, lastResponse, statusCode, noNewCommentsMessage } = useApiMessages({
    autoRefresh: false,
    refreshInterval: 30000 // Not used since autoRefresh is false
  });
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('now');

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
              <div className="text-xs font-mono text-cyber-green/60 mt-1">
                API STATUS: {isLoading ? 'FETCHING...' : statusCode ? `${statusCode}` : 'CONNECTED'}
              </div>
            </div>
          </div>
        </header>

        {/* Message Feed Section - Full Width */}
        <div className="cyber-border p-4 rounded-sm bg-cyber-dark-alt/30 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-pixel text-cyber-green glow-text">
              MESSAGE FEED [{filteredMessages.length}]
            </h2>
            <Button
              onClick={refetch}
              disabled={isLoading}
              className="bg-cyber-blue hover:bg-cyber-blue-dark text-white font-pixel text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* Time Frame Selector integrated into Message Feed */}
          <div className="mb-4">
            <TimeFrameSelector
              selectedTimeFrame={selectedTimeFrame}
              onTimeFrameChange={setSelectedTimeFrame}
            />
          </div>
          
          <MessageList 
            messages={filteredMessages} 
            timeFrame={selectedTimeFrame}
            isLoading={isLoading}
            noNewCommentsMessage={noNewCommentsMessage}
          />
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
