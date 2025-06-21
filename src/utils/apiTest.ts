import { apiService } from '@/services/apiService';
import { config } from '@/config/environment';

export const testApiConnection = async () => {
  console.log('Testing API connection...');
  console.log('API Base URL:', config.api.baseUrl);
  
  try {
    // Test health endpoint
    const healthResponse = await apiService.healthCheck();
    console.log('Health check response:', healthResponse);
    
    // Test messages endpoint
    const messagesResponse = await apiService.getMessages({ limit: 5 });
    console.log('Messages response:', messagesResponse);
    
    // Test stats endpoint
    const statsResponse = await apiService.getStats();
    console.log('Stats response:', statsResponse);
    
    console.log('✅ API connection test successful');
    return true;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
};

export const logApiConfig = () => {
  console.log('API Configuration:', {
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    retryAttempts: config.api.retryAttempts,
    autoRefresh: config.features.autoRefresh,
    autoRefreshInterval: config.app.autoRefreshInterval,
    debugMode: config.features.debugMode,
  });
}; 