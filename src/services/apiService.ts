import { JsonMessage } from '@/types/message';
import { config } from '@/config/environment';

// API configuration - Hardcoded URL
const API_BASE_URL = 'https://dkrb049wod.execute-api.us-east-1.amazonaws.com/dev';

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
    this.timeout = config.api.timeout;
    this.retryAttempts = config.api.retryAttempts;
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

  // Get latest messages in your API format
  async getLatestMessages(): Promise<YourApiResponse> {
    return this.request<YourApiResponse>('/messages/latest');
  }

  // Get all messages (for compatibility)
  async getMessages(params?: {
    timeFrame?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<MessagesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.timeFrame) searchParams.append('timeFrame', params.timeFrame);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/messages${queryString ? `?${queryString}` : ''}`;
    
    return this.request<MessagesResponse>(endpoint);
  }

  // Get messages by time frame
  async getMessagesByTimeFrame(timeFrame: string): Promise<MessagesResponse> {
    return this.getMessages({ timeFrame });
  }

  // Add a new message
  async addMessage(message: Omit<JsonMessage, 'id'>): Promise<ApiResponse<JsonMessage>> {
    return this.request<ApiResponse<JsonMessage>>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Add multiple messages
  async addMessages(messages: Omit<JsonMessage, 'id'>[]): Promise<ApiResponse<JsonMessage[]>> {
    return this.request<ApiResponse<JsonMessage[]>>('/messages/batch', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  // Get message statistics
  async getStats(): Promise<ApiResponse<{
    total: number;
    recent: number;
    bySeverity: Record<string, number>;
  }>> {
    return this.request<ApiResponse<any>>('/messages/stats');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<ApiResponse<any>>('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the class for testing
export { ApiService }; 