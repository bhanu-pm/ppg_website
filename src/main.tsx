import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logApiConfig } from '@/config/environment'

// Log API configuration in development mode
if (import.meta.env.DEV) {
  logApiConfig();
}

createRoot(document.getElementById("root")!).render(<App />);
