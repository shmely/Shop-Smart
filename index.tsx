import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ShopSmartProvider } from './context/ShopSmartContext';
import Header from './components/Header/Header';
import { UserProvider } from './context/UserContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ShopSmartProvider>
      <UserProvider>
        <Header />
        <App />
      </UserProvider>
    </ShopSmartProvider>
  </React.StrictMode>
);
