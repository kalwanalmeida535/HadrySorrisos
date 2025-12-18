import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Adicione o .js aqui no final

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    React.createElement(React.StrictMode, null, 
      React.createElement(App, null)
    )
  );
}
