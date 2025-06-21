import { JsonMessage } from '@/types/message';
import { YourApiResponse } from '@/services/apiService';

export interface ParsedApiResponse {
  messages: JsonMessage[];
  hasNewMessages: boolean;
  message: string;
}

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

export const parseApiResponse = (response: YourApiResponse): ParsedApiResponse => {
  const { statusCode, body } = response;
  
  // Check if status code indicates success
  if (statusCode !== 200) {
    return {
      messages: [],
      hasNewMessages: false,
      message: `API returned status code: ${statusCode}`
    };
  }

  // Handle string body (like "No new comments!" or json.dumps output)
  if (typeof body === 'string') {
    // First, try to parse as JSON (in case it's json.dumps output)
    try {
      const parsedBody = JSON.parse(body);
      // If it's a JSON string that contains "No new comments", handle it
      if (typeof parsedBody === 'string' && parsedBody.includes('No new comments')) {
        return {
          messages: [],
          hasNewMessages: false,
          message: parsedBody
        };
      }
      // If it parsed successfully but doesn't contain "No new comments", 
      // recursively parse the parsed body
      return parseApiResponse({ statusCode, body: parsedBody });
    } catch {
      // If JSON parsing fails, check if it's a plain string with "No new comments"
      if (body.includes('No new comments') || body.includes('No new messages')) {
        return {
          messages: [],
          hasNewMessages: false,
          message: body
        };
      }
      
      // Try to parse as JSON string with mixed quotes
      try {
        const parsedBody = safeJsonParse(body);
        return parseApiResponse({ statusCode, body: parsedBody });
      } catch {
        return {
          messages: [],
          hasNewMessages: false,
          message: body
        };
      }
    }
  }

  // Handle array of objects
  if (Array.isArray(body)) {
    const messages: JsonMessage[] = body.map((item, index) => {
      // Handle case where item might be a string that needs parsing
      let parsedItem = item;
      if (typeof item === 'string') {
        try {
          parsedItem = safeJsonParse(item);
        } catch {
          // If parsing fails, treat as a simple string
          parsedItem = { code: item, message: item };
        }
      }
      
      return {
        id: `api_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        code: parsedItem.code || 'UNKNOWN',
        message: parsedItem.code || 'No code provided',
        timestamp: new Date(),
        severity: 'success',
        metadata: {
          location: parsedItem.location,
          price: parsedItem.price,
          ...parsedItem // Include any other fields
        }
      };
    });

    return {
      messages,
      hasNewMessages: messages.length > 0,
      message: messages.length > 0 ? `Found ${messages.length} new message(s)` : 'No new messages'
    };
  }

  // Handle single object
  if (body && typeof body === 'object' && body.code) {
    const message: JsonMessage = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: body.code || 'UNKNOWN',
      message: body.code || 'No code provided',
      timestamp: new Date(),
      severity: 'success',
      metadata: {
        location: body.location,
        price: body.price,
        ...body // Include any other fields
      }
    };

    return {
      messages: [message],
      hasNewMessages: true,
      message: 'Found 1 new message'
    };
  }

  // Handle empty or invalid body
  return {
    messages: [],
    hasNewMessages: false,
    message: 'No valid messages found in response'
  };
};

// Helper function to check if response has new messages
export const hasNewMessages = (response: YourApiResponse): boolean => {
  const parsed = parseApiResponse(response);
  return parsed.hasNewMessages;
};

// Helper function to get message count
export const getMessageCount = (response: YourApiResponse): number => {
  const parsed = parseApiResponse(response);
  return parsed.messages.length;
}; 