import { getCsrfToken, refreshCsrfToken } from './csrf';

/**
 * Global fetch interceptor for CSRF protection
 * Automatically handles 419 errors by refreshing token and retrying
 */
export function setupCsrfInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options = {}) {
        // Only intercept POST, PUT, DELETE requests
        const method = options.method?.toUpperCase();
        const shouldIntercept = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
        
        if (!shouldIntercept) {
            return originalFetch(url, options);
        }
        
        // Get current CSRF token
        let token = getCsrfToken();
        
        // If no token in headers, add it
        if (!options.headers?.['X-CSRF-TOKEN']) {
            options.headers = {
                ...options.headers,
                'X-CSRF-TOKEN': token
            };
        }
        
        // First attempt
        let response = await originalFetch(url, options);
        
        // If CSRF mismatch (419), refresh and retry once
        if (response.status === 419) {
            console.log('🔄 CSRF token expired, refreshing...');
            
            // Refresh token
            token = await refreshCsrfToken();
            
            // Update headers with new token
            options.headers = {
                ...options.headers,
                'X-CSRF-TOKEN': token
            };
            
            // Retry request
            console.log('🔁 Retrying request with new token...');
            response = await originalFetch(url, options);
            
            if (response.ok || response.status !== 419) {
                console.log('✅ Request succeeded after token refresh');
            }
        }
        
        return response;
    };
    
    console.log('✅ CSRF interceptor installed');
}

