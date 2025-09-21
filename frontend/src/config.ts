// Frontend configuration for different environments

const config = {
  // API URLs
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Features
  enableWebSocket: true,
  enableDebugLogs: import.meta.env.DEV,
  
  // Default values
  defaultApiUrl: 'http://localhost:8000',
  defaultWsUrl: 'ws://localhost:8000',
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 Frontend Configuration:', {
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl,
    environment: config.isDevelopment ? 'development' : 'production',
  });
}

export default config;
