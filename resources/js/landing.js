import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from './components/LandingPage';

const container = document.getElementById('landing-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <HelmetProvider>
            <LandingPage />
        </HelmetProvider>
    );
}

