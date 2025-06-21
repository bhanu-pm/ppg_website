// Environment configuration
export const config = {
  // API Configuration - Hardcoded URL
  api: {
    baseUrl: 'https://dkrb049wod.execute-api.us-east-1.amazonaws.com/dev',
    timeout: 10000,
    retryAttempts: 3,
  },
  
  // App Configuration
  app: {
    name: 'PPG - Postmates Promo-code Grabber',
    version: '1.0.0',
    autoRefreshInterval: 30000,
  },
  
  // Feature Flags
  features: {
    autoRefresh: true,
    realTimeUpdates: true,
    debugMode: false,
  },
};

// Type for environment variables (kept for reference)
export interface EnvironmentConfig {
  VITE_API_BASE_URL?: string;
  VITE_API_TIMEOUT?: string;
  VITE_API_RETRY_ATTEMPTS?: string;
  VITE_AUTO_REFRESH_INTERVAL?: string;
  VITE_ENABLE_AUTO_REFRESH?: string;
  VITE_ENABLE_REAL_TIME_UPDATES?: string;
  VITE_DEBUG_MODE?: string;
}

// Helper function to validate environment
export const validateEnvironment = (): void => {
  console.log('API Configuration loaded with hardcoded URL');
  
  if (config.features.debugMode) {
    console.log('Environment configuration:', config);
  }
};

// Helper function to log API configuration
export const logApiConfig = (): void => {
  console.log('API Configuration:', {
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    retryAttempts: config.api.retryAttempts,
    autoRefresh: config.features.autoRefresh,
    autoRefreshInterval: config.app.autoRefreshInterval,
    debugMode: config.features.debugMode,
  });
}; 