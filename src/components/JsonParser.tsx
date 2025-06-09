
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { JsonMessage } from '@/types/message';
import { Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JsonParserProps {
  onMessageParsed: (messages: JsonMessage[]) => void;
}

const JsonParser: React.FC<JsonParserProps> = ({ onMessageParsed }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const normalizeJson = (input: string): string => {
    // Replace single quotes with double quotes, but be careful with escaped quotes
    return input.replace(/'/g, '"');
  };

  const parseJsonMessage = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter JSON data to parse",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const normalizedInput = normalizeJson(jsonInput.trim());
      const parsedData = JSON.parse(normalizedInput);
      
      // Check if it has the expected structure with statusCode and body
      if (parsedData.statusCode && parsedData.body) {
        // Check if body is "No new comments!" string
        if (typeof parsedData.body === 'string' && parsedData.body.includes('No new comments')) {
          toast({
            title: "No New Messages",
            description: "No new promo codes found",
          });
          setJsonInput('');
          setIsProcessing(false);
          return;
        }
        
        // If body is an array of code objects
        if (Array.isArray(parsedData.body)) {
          const messages: JsonMessage[] = parsedData.body.map((codeObj: any, index: number) => {
            return {
              id: `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
              code: codeObj.code || 'UNKNOWN',
              message: codeObj.code || 'No code provided',
              timestamp: new Date(),
              severity: 'success',
              metadata: {
                location: codeObj.location,
                price: codeObj.price
              }
            };
          });

          onMessageParsed(messages);
          setJsonInput('');
          
          toast({
            title: "Messages Parsed",
            description: `Successfully parsed ${messages.length} promo code(s)`,
          });
        } else {
          toast({
            title: "Parse Error",
            description: "Body does not contain an array of codes",
            variant: "destructive"
          });
        }
      } else {
        // Fallback to old parsing logic for backward compatibility
        const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        
        const messages: JsonMessage[] = dataArray.map((parsed, index) => {
          return {
            id: `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            code: parsed.code || 'UNKNOWN',
            message: parsed.message || 'No message provided',
            timestamp: new Date(parsed.timestamp || Date.now()),
            severity: parsed.severity || 'info',
            metadata: { ...parsed }
          };
        });

        // Remove core fields from metadata to avoid duplication
        messages.forEach(message => {
          delete message.metadata.id;
          delete message.metadata.code;
          delete message.metadata.message;
          delete message.metadata.timestamp;
          delete message.metadata.severity;
        });

        onMessageParsed(messages);
        setJsonInput('');
        
        toast({
          title: "Messages Parsed",
          description: `Successfully parsed ${messages.length} message(s)`,
        });
      }
      
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Invalid JSON format. Please check your input.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      parseJsonMessage();
    }
  };

  return (
    <div className="cyber-border p-4 rounded-sm bg-cyber-dark-alt/30">
      <div className="space-y-4">
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder='{"statusCode": 200, "body": [{"code": "2KK8C", "location": "MA", "price": "12"}]}'
          className="font-mono text-sm bg-cyber-dark border-cyber-green/30 text-cyber-green resize-none"
          rows={6}
        />
        
        <Button
          onClick={parseJsonMessage}
          disabled={isProcessing}
          className="w-full bg-cyber-green hover:bg-cyber-green-dark text-cyber-dark font-pixel text-sm"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isProcessing ? 'PROCESSING...' : 'PARSE'}
        </Button>
      </div>
    </div>
  );
};

export default JsonParser;
