/**
 * Purpose: React entry point — mounts <App /> into #root
 * Responsibilities: Import global stylesheet, render in StrictMode
 * Dependencies: react-dom/client, App, index.css
 * Export: none (entry file)
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
