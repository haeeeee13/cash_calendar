import React from 'react';
import { createRoot } from 'react-dom/client';
import VariantApp from './VariantApp.jsx';
import '../react-preview.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      React.Fragment,
      null,
      React.createElement('div', {
        className:
          'fixed top-3 right-3 z-[300] rounded-full bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 shadow-lg tracking-wide',
        children: 'Variant B',
      }),
      React.createElement(VariantApp)
    )
  )
);
