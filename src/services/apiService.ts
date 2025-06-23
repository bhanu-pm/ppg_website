import { JsonMessage } from '@/types/message';

// API configuration - Hardcoded URL
const API_BASE_URL = 'https://dkrb049wod.execute-api.us-east-1.amazonaws.com/developer-stage/';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface MessagesResponse extends ApiResponse<JsonMessage[]> {
  data: JsonMessage[];
  total?: number;
  page?: number;
  limit?: number;
}

// Your API response format
export interface YourApiResponse {
  statusCode: number;
  body: string | any[] | any;
}

// API service class
class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.timeout = 10000; // Hardcoded timeout
    this.retryAttempts = 3; // Hardcoded retry attempts
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `API request failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic for network errors
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.warn(`API request failed, retrying... (${attempt}/${this.retryAttempts})`);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.request<T>(endpoint, options, attempt + 1);
      }
      
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.name === 'AbortError') return true; // Timeout
    if (error.message?.includes('Failed to fetch')) return true; // Network error
    if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) return true;
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get latest messages in your API format - this is the only working endpoint
  async getLatestMessages(): Promise<YourApiResponse> {
    console.log('Making request to base URL for latest messages');
    const response = await this.request<YourApiResponse>('');
    console.log('Raw API response:', response);
    return response;
  }

  // Get all comments in your API format
  async getAllComments(): Promise<YourApiResponse> {
    console.log('Making request to /all-comments for all messages');
    const response = await this.request<YourApiResponse>('all-comments');
    console.log('Raw API response:', response);
    return response;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the class for testing
export { ApiService }; 