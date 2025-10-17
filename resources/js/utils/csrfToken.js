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
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update meta tag
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', data.token);
                    }
                    
                    // Dispatch event for other components
                    window.dispatchEvent(new CustomEvent('csrf-token-refreshed', { 
                        detail: { token: data.token } 
                    }));
                    
                    return data.token;
                }
            }
            throw new Error('Failed to refresh CSRF token');
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
    
    const requestOptions = {
        ...options,
        headers: {
            'Accept': 'application/json',
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
            await refreshCSRFToken();
            
            // Retry the request with new token
            const newToken = getCSRFToken();
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
            
            return await fetch(url, retryOptions);
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
export function setupCSRFTokenRefresh() {
    // Refresh token every 30 minutes
    setInterval(async () => {
        try {
            await refreshCSRFToken();
            console.log('CSRF token refreshed automatically');
        } catch (error) {
            console.error('Automatic CSRF token refresh failed:', error);
        }
    }, 30 * 60 * 1000); // 30 minutes

    // Refresh token on page visibility change (user comes back to tab)
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden) {
            try {
                await refreshCSRFToken();
                console.log('CSRF token refreshed on page visibility change');
            } catch (error) {
                console.error('CSRF token refresh on visibility change failed:', error);
            }
        }
    });
}
