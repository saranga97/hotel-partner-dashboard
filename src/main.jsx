import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HotelProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
