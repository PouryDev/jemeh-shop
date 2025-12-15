/**
 * Sanctum Token Management for React App
 */

let authToken = null;

/**
 * Get current auth token
 * @returns {string|null} Current auth token
 */
export function getAuthToken() {
    if (!authToken) {
        authToken = localStorage.getItem('sanctum_auth_token');
        console.log('Loading token from localStorage:', authToken);
    }
    return authToken;
}

/**
 * Set auth token
 * @param {string} token - Auth token
 */
export function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('sanctum_auth_token', token);
        console.log('Token stored in localStorage:', token);
    } else {
        localStorage.removeItem('sanctum_auth_token');
        console.log('Token removed from localStorage');
    }
}

/**
 * Clear auth token
 */
export function clearAuthToken() {
    authToken = null;
    localStorage.removeItem('sanctum_auth_token');
    console.log('Token cleared from localStorage');
}

/**
 * Debug function to check token status
 */
export function debugTokenStatus() {
    const storedToken = localStorage.getItem('sanctum_auth_token');
    console.log('=== Token Debug Info ===');
    console.log('In-memory token:', authToken);
    console.log('localStorage token:', storedToken);
    console.log('Tokens match:', authToken === storedToken);
    console.log('=======================');
    return { inMemory: authToken, localStorage: storedToken, match: authToken === storedToken };
}

/**
 * Test function to manually set a token (for debugging)
 */
export function setTestToken(token) {
    console.log('Setting test token:', token);
    setAuthToken(token);
    debugTokenStatus();
}

/**
 * Make API request with Sanctum token
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    console.log('Making API request to:', url, 'with token:', token ? 'Present' : 'Missing');
    console.log('Token value:', token);
    console.log('localStorage token:', localStorage.getItem('sanctum_auth_token'));

    // Don't set Content-Type for FormData - browser will set it automatically with boundary
    const isFormData = options.body instanceof FormData;
    
    let headers = {
        'Accept': 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // Add X-Merchant-Id header for all shop routes (except landing/SaaS routes)
    // Get merchant ID from sessionStorage first (real ID), then fallback to window or query
    let merchantId = null;
    try {
        const host = window.location.host;
        const key = `merchant_id:${host}`;
        const storageValue = sessionStorage.getItem(key);
        if (storageValue && storageValue !== 'null' && storageValue !== 'undefined') {
            merchantId = storageValue;
        }
    } catch (error) {
        // Ignore storage errors
    }
    
    // Fallback to window or query param
    if (!merchantId) {
        merchantId = window.__MERCHANT_ID__ || new URLSearchParams(window.location.search).get('merchant_id');
    }
    
    // Extract from route if available
    if (!merchantId) {
        const pathname = window.location.pathname;
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length > 0) {
            const potentialMerchantId = parts[0];
            const skipRoutes = ['landing', 'admin', 'account', 'merchant', 'subscription', 'api'];
            if (potentialMerchantId && !skipRoutes.includes(potentialMerchantId)) {
                merchantId = potentialMerchantId;
            }
        }
    }
    
    const skipMerchantIdRoutes = ['/api/saas/register', '/api/saas/plans', '/api/saas/themes'];
    const isLandingPage = window.location.pathname === '/landing' || window.location.pathname.startsWith('/landing/');
    const shouldSkipMerchantId = skipMerchantIdRoutes.some(route => url.includes(route)) || isLandingPage;
    
    // Only add header if merchantId is valid (not null, undefined, empty, or string "null")
    if (merchantId && merchantId !== 'null' && merchantId !== 'undefined' && merchantId.trim && merchantId.trim().length > 0 && !shouldSkipMerchantId) {
        headers['X-Merchant-Id'] = merchantId;
    }


    const requestOptions = {
        ...options,
        headers: headers,
        credentials: 'same-origin',
    };

    // Log headers for debugging
    console.log('Request headers:', requestOptions.headers);
    console.log('Is FormData:', isFormData);
    console.log('Body type:', options.body?.constructor?.name);
    
    // Ensure Content-Type is removed for FormData (browser will set it with boundary)
    if (isFormData && requestOptions.headers['Content-Type']) {
        delete requestOptions.headers['Content-Type'];
        console.log('Removed Content-Type header for FormData');
    }

    try {
        const response = await fetch(url, requestOptions);

        // If unauthorized (401), clear token and redirect to login
        if (response.status === 401) {
            console.log('Unauthorized request, clearing token');
            clearAuthToken();
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        // If this is a login/register request and successful, store the token
        if ((url.includes('/api/auth/login') || url.includes('/api/auth/register')) && response.ok) {
            try {
                const data = await response.clone().json();
                console.log('Login/register response data:', data);
                if (data.success && data.token) {
                    setAuthToken(data.token);
                    console.log('Token stored from login/register response:', data.token);
                    console.log('Token verification - localStorage:', localStorage.getItem('sanctum_auth_token'));
                } else {
                    console.log('No token found in response:', data);
                }
            } catch (e) {
                console.error('Failed to parse response for token storage:', e);
            }
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Login user and store token
 * @param {string} loginField - Instagram ID or phone
 * @param {string} password - Password
 * @returns {Promise<object>} Login response
 */
export async function login(loginField, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login_field: loginField,
            password: password
        })
    });

    const data = await response.json();

    if (data.success && data.token) {
        setAuthToken(data.token);
        console.log('Login successful, token stored');
    }

    return data;
}

/**
 * Logout user and clear token
 * @returns {Promise<object>} Logout response
 */
export async function logout() {
    const token = getAuthToken();

    if (token) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }
    }

    clearAuthToken();
    console.log('Logout successful, token cleared');

    return { success: true };
}

/**
 * Get current user info
 * @returns {Promise<object>} User info
 */
export async function getCurrentUser() {
    const token = getAuthToken();

    if (!token) {
        return { success: false, message: 'No token available' };
    }

    // Get merchant ID from sessionStorage first, then fallback
    let merchantId = null;
    try {
        const host = window.location.host;
        const key = `merchant_id:${host}`;
        const storageValue = sessionStorage.getItem(key);
        if (storageValue && storageValue !== 'null' && storageValue !== 'undefined') {
            merchantId = storageValue;
        }
    } catch (error) {
        // Ignore storage errors
    }
    
    if (!merchantId) {
        merchantId = window.__MERCHANT_ID__;
    }
    
    // Extract from route if available
    if (!merchantId) {
        const pathname = window.location.pathname;
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length > 0) {
            const potentialMerchantId = parts[0];
            const skipRoutes = ['landing', 'admin', 'account', 'merchant', 'subscription', 'api'];
            if (potentialMerchantId && !skipRoutes.includes(potentialMerchantId)) {
                merchantId = potentialMerchantId;
            }
        }
    }
    
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    
    // Only add X-Merchant-Id if it's valid
    if (merchantId && merchantId !== 'null' && merchantId !== 'undefined' && merchantId.trim && merchantId.trim().length > 0) {
        headers['X-Merchant-Id'] = merchantId;
    }
    
    const response = await fetch('/api/auth/user', {
        method: 'GET',
        headers: headers
    });

    const data = await response.json();

    if (!data.success && response.status === 401) {
        clearAuthToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    return data;
}
