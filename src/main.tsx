// src/main.tsx
// Starts the portal: loads the stylesheet and draws App into the page's #root.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/theme/portalTheme.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
