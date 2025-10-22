/**
 * Admin API Request Utility
 * Handles CSRF token properly for admin API calls
 */

import { apiRequest } from './csrfToken';

/**
 * Make admin API request with proper CSRF handling
 * @param {string} url - Admin API endpoint (without /api/admin prefix)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function adminApiRequest(url, options = {}) {
    // Ensure URL starts with /api/admin/
    const fullUrl = url.startsWith('/api/admin/') ? url : `/api/admin${url.startsWith('/') ? url : '/' + url}`;
    
    console.log('Making admin API request to:', fullUrl);
    
    try {
        const response = await apiRequest(fullUrl, options);
        
        // Log response for debugging
        console.log('Admin API response status:', response.status);
        
        return response;
    } catch (error) {
        console.error('Admin API request failed:', error);
        throw error;
    }
}

/**
 * Test CSRF token for admin
 * @returns {Promise<boolean>} True if CSRF token is valid
 */
export async function testAdminCsrfToken() {
    try {
        const response = await adminApiRequest('/csrf-test');
        const data = await response.json();
        
        if (data.success) {
            console.log('Admin CSRF token is valid');
            return true;
        } else {
            console.error('Admin CSRF token test failed:', data);
            return false;
        }
    } catch (error) {
        console.error('Admin CSRF token test error:', error);
        return false;
    }
}

/**
 * Initialize admin API with CSRF token test
 * Call this when admin panel loads
 */
export async function initializeAdminApi() {
    console.log('Initializing admin API...');
    
    // Test CSRF token
    const isValid = await testAdminCsrfToken();
    
    if (!isValid) {
        console.warn('Admin CSRF token is not valid, attempting to refresh...');
        // The apiRequest function will automatically handle CSRF token refresh
        await testAdminCsrfToken();
    }
    
    console.log('Admin API initialized');
}
