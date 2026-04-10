/**
 * main.jsx — Application entry point
 * Imports global CSS and mounts the React app.
 */

import React    from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App      from './App';

ReactDOM.createRoot(document.getElementById('app-root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
