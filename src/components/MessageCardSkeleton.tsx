import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MessageCardSkeleton = () => {
  return (
    <div className="message-card p-3 sm:p-4 rounded-sm mb-3 sm:mb-4 opacity-50">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="w-5 h-5 rounded-full bg-cyber-green/20" />
          <Skeleton className="h-6 w-1/3 bg-cyber-green/20" />
        </div>
        <Skeleton className="h-4 w-24 flex-shrink-0 bg-cyber-green/20" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <div className="flex items-center gap-2 w-1/2">
          <Skeleton className="w-5 h-5 rounded-full bg-cyber-blue/20" />
          <Skeleton className="h-4 w-full bg-cyber-blue/20" />
        </div>
        <div className="flex items-center gap-2 w-1/2">
          <Skeleton className="w-5 h-5 rounded-full bg-cyber-green/20" />
          <Skeleton className="h-4 w-full bg-cyber-green/20" />
        </div>
      </div>
    </div>
  );
};

export default MessageCardSkeleton;
