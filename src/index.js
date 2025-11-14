import React from 'react';
import ReactDOM from 'react-dom/client';
import './minimal-styles.css'; // THIS FIRST!
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);