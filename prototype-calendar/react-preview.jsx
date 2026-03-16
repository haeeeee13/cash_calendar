import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './react-preview.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
