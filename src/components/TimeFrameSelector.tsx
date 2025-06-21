import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeFrame } from '@/types/message';
import { Clock } from 'lucide-react';

interface TimeFrameSelectorProps {
  selectedTimeFrame: string;
  onTimeFrameChange: (value: string) => void;
}

const timeFrames: TimeFrame[] = [
  { label: 'Now', value: 'now', hours: 1/60 }, // 1 minute
  { label: 'All Messages', value: 'all', hours: Infinity },
];

const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  selectedTimeFrame,
  onTimeFrameChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyber-green" />
        <span className="text-sm font-pixel text-cyber-green">TIME FRAME:</span>
      </div>
      <Select value={selectedTimeFrame} onValueChange={onTimeFrameChange}>
        <SelectTrigger className="w-full sm:w-40 bg-cyber-dark border-cyber-green/30 text-cyber-green font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-cyber-dark border-cyber-green/30">
          {timeFrames.map((frame) => (
            <SelectItem 
              key={frame.value} 
              value={frame.value}
              className="text-cyber-green hover:bg-cyber-green/20 font-mono"
            >
              {frame.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeFrameSelector;
export { timeFrames };
