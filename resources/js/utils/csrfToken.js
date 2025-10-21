/**
 * CSRF Token Management for SPA
 */

let csrfTokenRefreshPromise = null;

/**
 * Refresh CSRF token from server
 * @returns {Promise<string>} New CSRF token
 */
export async function refreshCSRFToken() {
    // Prevent multiple simultaneous requests
    if (csrfTokenRefreshPromise) {
        return csrfTokenRefreshPromise;
    }

    csrfTokenRefreshPromise = (async () => {
        try {
            console.log('Refreshing CSRF token...');
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            console.log('CSRF token refresh response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('CSRF token refresh response:', data);
                
                if (data.success && data.token) {
                    // Update meta tag
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', data.token);
                        console.log('CSRF token updated in meta tag');
                    }
                    
                    // Dispatch event for other components
                    window.dispatchEvent(new CustomEvent('csrf-token-refreshed', { 
                        detail: { token: data.token } 
                    }));
                    
                    return data.token;
                } else {
                    console.error('CSRF token refresh failed - invalid response:', data);
                    throw new Error('Invalid CSRF token response');
                }
            } else {
                console.error('CSRF token refresh failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`CSRF token refresh failed: ${response.status}`);
            }
        } catch (error) {
            console.error('CSRF token refresh failed:', error);
            throw error;
        } finally {
            csrfTokenRefreshPromise = null;
        }
    })();

    return csrfTokenRefreshPromise;
}

/**
 * Get current CSRF token
 * @returns {string|null} Current CSRF token
 */
export function getCSRFToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Make API request with automatic CSRF token refresh on 419 error
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function apiRequest(url, options = {}) {
    const token = getCSRFToken();
    console.log('Making API request to:', url, 'with CSRF token:', token ? 'Present' : 'Missing');
    
    const requestOptions = {
        ...options,
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': token || '',
            ...options.headers,
        },
        credentials: 'same-origin',
    };

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (options.body instanceof FormData) {
        delete requestOptions.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, requestOptions);
        
        // If CSRF token expired (419), refresh and retry
        if (response.status === 419) {
            console.log('CSRF token expired, refreshing...');
            try {
                await refreshCSRFToken();
                
                // Get the new token and retry the request
                const newToken = getCSRFToken();
                console.log('New CSRF token obtained:', newToken ? 'Yes' : 'No');
                
                const retryOptions = {
                    ...requestOptions,
                    headers: {
                        ...requestOptions.headers,
                        'X-CSRF-TOKEN': newToken || '',
                    }
                };
                
                // Don't set Content-Type for FormData in retry either
                if (options.body instanceof FormData) {
                    delete retryOptions.headers['Content-Type'];
                }
                
                console.log('Retrying request with new CSRF token...');
                const retryResponse = await fetch(url, retryOptions);
                console.log('Retry response status:', retryResponse.status);
                
                if (retryResponse.status === 419) {
                    console.error('CSRF token still invalid after refresh');
                    const errorText = await retryResponse.text();
                    console.error('Retry error response:', errorText);
                    throw new Error('CSRF token mismatch');
                }
                
                return retryResponse;
            } catch (refreshError) {
                console.error('Failed to refresh CSRF token:', refreshError);
                throw new Error('CSRF token mismatch');
            }
        }
        
        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Setup automatic CSRF token refresh
 * Refreshes token every 30 minutes
 */
let visibilityRefreshTimeout = null;

export function setupCSRFTokenRefresh() {
    // Don't refresh on page load - use the token from the initial page render
    // This ensures the token matches the session
    
    // Refresh token every 30 minutes (but not too aggressively)
    setInterval(async () => {
        try {
            await refreshCSRFToken();
            console.log('CSRF token refreshed automatically');
        } catch (error) {
            console.error('Automatic CSRF token refresh failed:', error);
        }
    }, 1 * 60 * 1000); // 30 minutes

    // Refresh token on page visibility change (user comes back to tab)
    // Debounce to prevent multiple rapid calls
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Clear any existing timeout
            if (visibilityRefreshTimeout) {
                clearTimeout(visibilityRefreshTimeout);
            }
            
            // Set a new timeout to debounce the refresh
            visibilityRefreshTimeout = setTimeout(async () => {
                try {
                    await refreshCSRFToken();
                    console.log('CSRF token refreshed on page visibility change');
                } catch (error) {
                    console.error('CSRF token refresh on visibility change failed:', error);
                }
            }, 500); // 500ms debounce
        }
    });

    // Global error handler for CSRF token issues
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.status === 419) {
            console.log('Unhandled CSRF token error detected, refreshing token...');
            refreshCSRFToken().catch(error => {
                console.error('Failed to refresh CSRF token in error handler:', error);
            });
        }
    });
}
