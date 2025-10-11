import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import ToastHub from './components/ToastHub';

// Initialize React app
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <>
            <App />
            <ToastHub />
        </>
    );
}
