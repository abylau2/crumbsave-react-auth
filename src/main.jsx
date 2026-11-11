import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { queryClient } from './lib/queryClient.js';
import App from './App.jsx';
import './styles/index.css';

// GitHub Pages serves 404.html for direct nested URLs. Its fallback passes the
// original route through a query parameter, then we restore it before mounting.
const fallbackRoute = new URLSearchParams(window.location.search).get('__route');
if (fallbackRoute?.startsWith('/') && !fallbackRoute.startsWith('//')) {
  window.history.replaceState(null, '', `${import.meta.env.BASE_URL.replace(/\/$/, '')}${fallbackRoute}`);
}

createRoot(document.getElementById('root')).render(<React.StrictMode><QueryClientProvider client={queryClient}><BrowserRouter basename={import.meta.env.BASE_URL}><AuthProvider><App /></AuthProvider></BrowserRouter></QueryClientProvider></React.StrictMode>);
