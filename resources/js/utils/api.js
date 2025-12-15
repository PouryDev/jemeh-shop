// API utility functions for consistent error handling and authentication

const getAuthToken = () => {
    return localStorage.getItem('sanctum_auth_token');
};

/**
 * Extract merchant ID from route pathname
 * Route pattern: /:merchantId/...
 */
const getMerchantIdFromRoute = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length > 0) {
        const potentialMerchantId = parts[0];
        // Skip known routes that are not merchant IDs
        const skipRoutes = ['landing', 'admin', 'account', 'merchant', 'subscription', 'api'];
        if (potentialMerchantId && !skipRoutes.includes(potentialMerchantId)) {
            return potentialMerchantId;
        }
    }
    return null;
};

/**
 * Get merchant_id from sessionStorage with domain key
 */
const getMerchantIdFromStorage = () => {
    try {
        const host = window.location.host;
        const key = `merchant_id:${host}`;
        const value = sessionStorage.getItem(key);
        // Return null if value is null, undefined, empty string, or string "null"
        if (!value || value === 'null' || value === 'undefined') {
            // Clean up invalid values from storage
            if (value === 'null' || value === 'undefined') {
                sessionStorage.removeItem(key);
            }
            return null;
        }
        return value;
    } catch (error) {
        return null;
    }
};

/**
 * Validate merchant ID - ensure it's not null, undefined, empty, or string "null"
 */
const isValidMerchantId = (id) => {
    return id && 
           id !== 'null' && 
           id !== 'undefined' && 
           id !== 'NaN' &&
           typeof id === 'string' && 
           id.trim().length > 0;
};

/**
 * Get merchant_id with priority: sessionStorage (real ID) → Route param → domain → window → query
 * Note: sessionStorage has the real merchant ID (from API), route param might be slug
 */
const getMerchantId = () => {
    // Priority 1: sessionStorage with domain key (this has the real merchant ID from API)
    const storageMerchantId = getMerchantIdFromStorage();
    if (isValidMerchantId(storageMerchantId)) {
        return storageMerchantId;
    }

    // Priority 2: Route parameter (from URL pathname) - might be slug, not ID
    const routeMerchantId = getMerchantIdFromRoute();
    if (isValidMerchantId(routeMerchantId)) {
        return routeMerchantId;
    }

    // Priority 3: Subdomain detection (if configured) - might be slug, not ID
    const host = window.location.host;
    const mainDomain = process.env.VITE_MAIN_DOMAIN || '';
    if (mainDomain && host.endsWith('.' + mainDomain)) {
        const subdomain = host.replace('.' + mainDomain, '');
        if (isValidMerchantId(subdomain) && subdomain !== 'www') {
            return subdomain; // This might be a slug, not ID
        }
    }

    // Priority 4: window.__MERCHANT_ID__ (for SSR)
    if (isValidMerchantId(window.__MERCHANT_ID__)) {
        return window.__MERCHANT_ID__;
    }

    // Priority 5: URL query parameter
    const queryMerchantId = new URLSearchParams(window.location.search).get('merchant_id');
    if (isValidMerchantId(queryMerchantId)) {
        return queryMerchantId;
    }

    return null;
};

export const apiRequest = async (url, options = {}) => {
    const token = getAuthToken();
    const defaultHeaders = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Add merchant_id to headers for all shop routes (except landing/SaaS routes)
    const merchantId = getMerchantId();
    const skipMerchantIdRoutes = ['api/saas/register', 'api/saas/plans', 'api/saas/themes'];
    const isLandingPage = window.location.pathname === '/landing' || window.location.pathname.startsWith('/landing/');
    const shouldSkipMerchantId = skipMerchantIdRoutes.some(route => url.includes(route)) || isLandingPage;
    
    // Always add X-Merchant-Id header for shop routes if merchantId is valid and available
    // This will be the real ID from sessionStorage (if available) or route param/slug
    // Only add if merchantId is valid (not null, undefined, empty, or string "null")
    if (merchantId && isValidMerchantId(merchantId) && !shouldSkipMerchantId) {
        defaultHeaders['X-Merchant-Id'] = merchantId;
    }

    const config = {
        headers: { ...defaultHeaders, ...options.headers },
        ...options
    };

    // Ensure X-Merchant-Id is not overridden by options.headers (unless explicitly set)
    // If merchantId exists and should be sent, make sure it's in the final headers
    // Also ensure we don't send null or invalid values
    if (merchantId && isValidMerchantId(merchantId) && !shouldSkipMerchantId) {
        // Only set if not already set or if current value is invalid
        if (!config.headers['X-Merchant-Id'] || !isValidMerchantId(config.headers['X-Merchant-Id'])) {
            config.headers['X-Merchant-Id'] = merchantId;
        }
    } else {
        // Remove X-Merchant-Id header if it's invalid or should be skipped
        delete config.headers['X-Merchant-Id'];
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // Ensure URL is absolute if it starts with /
    let requestUrl = url;
    if (url.startsWith('/') && !url.startsWith('//')) {
        // Use current origin for relative URLs
        requestUrl = window.location.origin + url;
    }

    // Add merchant_id to query string if available (from window.__MERCHANT_ID__) - only for shop routes
    if (merchantId && !shouldSkipMerchantId && !requestUrl.includes('merchant_id=')) {
        const separator = requestUrl.includes('?') ? '&' : '?';
        requestUrl += `${separator}merchant_id=${merchantId}`;
    }

    // Debug: log the request URL for troubleshooting
    if (url.includes('saas/register')) {
        console.log('Making request to:', requestUrl);
        console.log('Current origin:', window.location.origin);
        console.log('Request config:', { method: config.method, headers: config.headers });
    }

    try {
        const response = await fetch(requestUrl, config);
        
        // Check for redirects (302, 301)
        if (response.status === 302 || response.status === 301) {
            const location = response.headers.get('location');
            console.error('Request was redirected:', {
                from: requestUrl,
                to: location,
                status: response.status
            });
            
            // If redirected to a non-API route, it's likely a routing issue
            if (location && !location.includes('/api/')) {
                return { 
                    success: false, 
                    error: `Request was redirected from ${requestUrl} to ${location}. Make sure the API route exists and is accessible.` 
                };
            }
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        let data;
        if (isJson) {
            data = await response.json();
        } else {
            // If not JSON, try to get text and log it for debugging
            const text = await response.text();
            console.error('Non-JSON response received:', text.substring(0, 200));
            
            // Return appropriate error
            if (response.status === 419) {
                return { 
                    success: false, 
                    error: 'CSRF token mismatch. Please refresh the page and try again.' 
                };
            }
            
            return { 
                success: false, 
                error: `Server returned non-JSON response (${response.status}). Please check the server logs.` 
            };
        }

        if (!response.ok) {
            if (response.status === 401) {
                // Clear token if unauthorized
                localStorage.removeItem('sanctum_auth_token');
                window.dispatchEvent(new CustomEvent('toast:show', { 
                    detail: { type: 'error', message: 'شما وارد نشده‌اید. لطفاً دوباره وارد شوید.' } 
                }));
                return { success: false, error: 'unauthorized' };
            }
            
            const errorMessage = data.message || data.error || `خطا در درخواست (${response.status})`;
            window.dispatchEvent(new CustomEvent('toast:show', { 
                detail: { type: 'error', message: errorMessage } 
            }));
            return { success: false, error: errorMessage, data };
        }

        // Save merchant_id to sessionStorage if returned in response
        if (data && data.merchant_id && !shouldSkipMerchantId) {
            try {
                const host = window.location.host;
                const key = `merchant_id:${host}`;
                sessionStorage.setItem(key, data.merchant_id);
            } catch (error) {
                // Ignore storage errors
            }
        }

        // Also check X-Merchant-Id header in response
        const responseMerchantId = response.headers.get('X-Merchant-Id');
        if (responseMerchantId && !shouldSkipMerchantId) {
            try {
                const host = window.location.host;
                const key = `merchant_id:${host}`;
                sessionStorage.setItem(key, responseMerchantId);
            } catch (error) {
                // Ignore storage errors
            }
        }

        return { success: true, data };
    } catch (error) {
        console.error('API request error:', error);
        
        // If it's a JSON parse error, provide more helpful message
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('JSON parse error - server likely returned HTML instead of JSON');
            window.dispatchEvent(new CustomEvent('toast:show', { 
                detail: { type: 'error', message: 'خطا در پاسخ سرور. لطفاً صفحه را refresh کنید.' } 
            }));
            return { success: false, error: 'invalid_json_response' };
        }
        
        window.dispatchEvent(new CustomEvent('toast:show', { 
            detail: { type: 'error', message: 'خطا در اتصال به سرور' } 
        }));
        return { success: false, error: 'network_error' };
    }
};

export const apiGet = (url, params = {}) => {
    const urlParams = new URLSearchParams(params).toString();
    const fullUrl = urlParams ? `${url}?${urlParams}` : url;
    return apiRequest(fullUrl, { method: 'GET' });
};

export const apiPost = (url, data) => {
    return apiRequest(url, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: {
            'Content-Type': data instanceof FormData ? undefined : 'application/json'
        }
    });
};

export const apiPut = (url, data) => {
    return apiRequest(url, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: {
            'Content-Type': data instanceof FormData ? undefined : 'application/json'
        }
    });
};

export const apiPatch = (url, data) => {
    return apiRequest(url, {
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: {
            'Content-Type': data instanceof FormData ? undefined : 'application/json'
        }
    });
};

export const apiDelete = (url) => {
    return apiRequest(url, { method: 'DELETE' });
};