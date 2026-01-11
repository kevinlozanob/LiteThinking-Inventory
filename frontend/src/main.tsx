import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' 
import { ToastProvider } from './context/ToastContext.tsx' // <--- Importamos


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>  {/* <--- Envolvemos */}
      <App />
    </ToastProvider>
  </React.StrictMode>,
)