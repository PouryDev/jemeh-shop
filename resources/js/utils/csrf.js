/**
 * Get current CSRF token from meta tag
 */
export function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

/**
 * Refresh CSRF token from server
 */
export async function refreshCsrfToken() {
    try {
        const res = await fetch('/csrf-token', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin'
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.token) {
                const meta = document.querySelector('meta[name="csrf-token"]');
                if (meta) {
                    meta.setAttribute('content', data.token);
                }
                return data.token;
            }
        }
    } catch (e) {
        console.error('Failed to refresh CSRF token:', e);
    }
    return getCsrfToken();
}

/**
 * Enhanced fetch with CSRF retry logic
 * If request fails with 419 (CSRF mismatch), refreshes token and retries once
 */
export async function fetchWithCsrf(url, options = {}) {
    const token = getCsrfToken();
    
    // Add CSRF token to headers
    const headers = {
        ...options.headers,
        'X-CSRF-TOKEN': token,
    };
    
    const requestOptions = {
        ...options,
        headers,
        credentials: options.credentials || 'same-origin'
    };
    
    try {
        const response = await fetch(url, requestOptions);
        
        // If CSRF token mismatch (419), refresh and retry once
        if (response.status === 419) {
            console.log('CSRF token mismatch, refreshing...');
            const newToken = await refreshCsrfToken();
            
            // Retry with new token
            const retryHeaders = {
                ...options.headers,
                'X-CSRF-TOKEN': newToken,
            };
            
            return await fetch(url, {
                ...options,
                headers: retryHeaders,
                credentials: options.credentials || 'same-origin'
            });
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

