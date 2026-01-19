import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' 
import { ToastProvider } from './context/ToastContext.tsx'
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';

const helmetContext = {};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider context={helmetContext}>
        <ToastProvider> 
          <App />
        </ToastProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)