import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // THIS FIRST!
import './complete-styles.css'; // THEN THIS TO OVERRIDE IF NEEDED
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);