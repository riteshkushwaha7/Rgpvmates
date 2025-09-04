// Configuration file for API URLs and other environment-specific settings
export const config = {
  // Automatically detect API URL based on current environment
  get API_URL() {
    // Check if we have an environment variable set
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Auto-detect based on current domain
    const currentDomain = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      // Local development
      return 'http://localhost:5000';
    } else if (currentDomain.includes('vercel.app')) {
      // Vercel deployment - use Railway backend
      return 'https://rgpvmates-production.up.railway.app';
    } else if (currentDomain.includes('railway.app')) {
      // Railway deployment
      return `${currentProtocol}//${currentDomain}`;
    } else {
      // Fallback to production Railway backend
      return 'https://rgpvmates-production.up.railway.app';
    }
  },
  
  // WebSocket URL (auto-generated from API URL)
  get WS_URL() {
    const apiUrl = this.API_URL;
    if (apiUrl.startsWith('https://')) {
      return apiUrl.replace('https://', 'wss://');
    } else {
      return apiUrl.replace('http://', 'ws://');
    }
  },
  
  // Environment detection
  get isDevelopment() {
    return import.meta.env.DEV;
  },
  
  get isProduction() {
    return import.meta.env.PROD;
  }
};

// Log configuration for debugging
if (config.isDevelopment) {
  console.log('🔧 App Configuration:', {
    API_URL: config.API_URL,
    WS_URL: config.WS_URL,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    currentDomain: window.location.hostname,
    currentProtocol: window.location.protocol
  });
}
