import React, { useEffect } from 'react';
import { setupCSRFTokenRefresh } from '../utils/csrfToken';

/**
 * CSRF Token Refresher Component
 * Sets up automatic CSRF token refresh for SPA
 */
function CsrfRefresher() {
    useEffect(() => {
        // Setup automatic CSRF token refresh
        setupCSRFTokenRefresh();
        
        console.log('CSRF token refresher initialized');
    }, []);

    // This component doesn't render anything
    return null;
}

export default CsrfRefresher;