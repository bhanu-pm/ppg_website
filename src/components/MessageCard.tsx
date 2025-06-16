
import React from 'react';
import { JsonMessage } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle, Info, AlertTriangle, MapPin, DollarSign } from 'lucide-react';

interface MessageCardProps {
  message: JsonMessage;
  isLatest?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, isLatest }) => {
  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-cyber-red flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-cyber-orange flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyber-blue flex-shrink-0" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'text-cyber-red border-cyber-red/30';
      case 'warning':
        return 'text-cyber-orange border-cyber-orange/30';
      case 'success':
        return 'text-cyber-green border-cyber-green/30';
      default:
        return 'text-cyber-blue border-cyber-blue/30';
    }
  };

  return (
    <div 
      className={`message-card p-3 sm:p-4 rounded-sm mb-3 sm:mb-4 animate-slide-up ${
        isLatest ? 'ring-2 ring-cyber-green-bright animate-glow' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          {getSeverityIcon(message.severity)}
          <span className={`text-lg sm:text-xl font-mono font-bold ${getSeverityColor(message.severity)} break-all`}>
            {message.code}
          </span>
        </div>
        <span className="text-xs text-cyber-green/70 font-mono flex-shrink-0">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
      </div>
      
      {/* Display location and price */}
      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        {message.metadata?.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyber-blue flex-shrink-0" />
            <span className="text-sm text-cyber-blue font-mono">
              Location: {message.metadata.location}
            </span>
          </div>
        )}
        
        {message.metadata?.price && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyber-green flex-shrink-0" />
            <span className="text-sm text-cyber-green font-mono">
              Price: ${message.metadata.price}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCard;
