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

  // Helper function to normalize JSON string by handling mixed quotes
  const normalizeJsonString = (input: string): string => {
    let normalized = input;
    
    // First, try to handle the case where the entire string might be wrapped in single quotes
    if (normalized.startsWith("'") && normalized.endsWith("'")) {
      normalized = normalized.slice(1, -1);
    }
    
    // Replace single quotes with double quotes, but be careful with escaped quotes
    // We'll use a more sophisticated approach to handle mixed quotes
    let result = '';
    let inString = false;
    let escapeNext = false;
    let quoteChar = '"';
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        result += char;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quoteChar = char;
        result += '"'; // Always use double quotes in output
        continue;
      }
      
      if (char === quoteChar && inString) {
        inString = false;
        result += '"'; // Always use double quotes in output
        continue;
      }
      
      result += char;
    }
    
    return result;
  };

  // Helper function to safely parse JSON with mixed quotes
  const safeJsonParse = (input: string): any => {
    try {
      // First try direct parsing
      return JSON.parse(input);
    } catch (error) {
      try {
        // Try with normalized quotes
        const normalized = normalizeJsonString(input);
        return JSON.parse(normalized);
      } catch (secondError) {
        // If still fails, try a more aggressive normalization
        try {
          // Replace all single quotes with double quotes (simple approach)
          const simpleNormalized = input.replace(/'/g, '"');
          return JSON.parse(simpleNormalized);
        } catch (thirdError) {
          throw new Error(`Failed to parse JSON: ${input}`);
        }
      }
    }
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
      const parsedData = safeJsonParse(jsonInput.trim());
      
      // Check if it has the expected structure with statusCode and body
      if (parsedData.statusCode && parsedData.body !== undefined) {
        // Check if body is "No new comments!" string
        if (typeof parsedData.body === 'string' && 
            (parsedData.body.includes('No new comments') || parsedData.body.includes('No new messages'))) {
          toast({
            title: "No New Messages",
            description: parsedData.body,
          });
          setJsonInput('');
          setIsProcessing(false);
          return;
        }
        
        // If body is an array of code objects
        if (Array.isArray(parsedData.body)) {
          const messages: JsonMessage[] = parsedData.body.map((codeObj: any, index: number) => {
            // Handle case where codeObj might be a string that needs parsing
            let parsedCodeObj = codeObj;
            if (typeof codeObj === 'string') {
              try {
                parsedCodeObj = safeJsonParse(codeObj);
              } catch {
                // If parsing fails, treat as a simple string
                parsedCodeObj = { code: codeObj, message: codeObj };
              }
            }
            
            return {
              id: `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
              code: parsedCodeObj.code || 'UNKNOWN',
              message: parsedCodeObj.code || 'No code provided',
              timestamp: new Date(),
              severity: 'success',
              metadata: {
                location: parsedCodeObj.location,
                price: parsedCodeObj.price,
                ...parsedCodeObj // Include any other fields
              }
            };
          });

          onMessageParsed(messages);
          setJsonInput('');
          
          toast({
            title: "Messages Parsed",
            description: `Successfully parsed ${messages.length} promo code(s)`,
          });
        } 
        // If body is a single object
        else if (parsedData.body && typeof parsedData.body === 'object' && parsedData.body.code) {
          const message: JsonMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: parsedData.body.code || 'UNKNOWN',
            message: parsedData.body.code || 'No code provided',
            timestamp: new Date(),
            severity: 'success',
            metadata: {
              location: parsedData.body.location,
              price: parsedData.body.price,
              ...parsedData.body // Include any other fields
            }
          };

          onMessageParsed([message]);
          setJsonInput('');
          
          toast({
            title: "Message Parsed",
            description: "Successfully parsed 1 promo code",
          });
        } else {
          toast({
            title: "Parse Error",
            description: "Body does not contain valid message data",
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
          placeholder='{"statusCode": 200, "body": [{"code": "BOBA25", "location": "Phoenix", "price": "15"}]}'
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
