import React, { createContext, useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Make sure this element exists in your HTML
const rootElement = document.getElementById('root');

// Check if the element exists before trying to create a root
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Could not find root element to mount React app");
}