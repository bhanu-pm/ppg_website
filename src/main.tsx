import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './amplify' // Import Amplify configuration

createRoot(document.getElementById("root")!).render(<App />);
