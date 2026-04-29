
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found in index.html');
}

createRoot(root).render(
  
    <App />
  
);
