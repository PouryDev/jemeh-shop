/**
 * Utility functions for generating links with merchant ID
 */

/**
 * Get merchant ID from current context
 */
export const getCurrentMerchantId = () => {
    // Try to get from route
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length > 0) {
        const potentialMerchantId = parts[0];
        const skipRoutes = ['landing', 'admin', 'account', 'merchant', 'subscription'];
        if (potentialMerchantId && !skipRoutes.includes(potentialMerchantId)) {
            return potentialMerchantId;
        }
    }
    
    // Try sessionStorage
    try {
        const host = window.location.host;
        const key = `merchant_id:${host}`;
        return sessionStorage.getItem(key);
    } catch (error) {
        return null;
    }
};

/**
 * Generate a link with merchant ID prepended
 * @param {string} path - The path to navigate to (without merchantId)
 * @param {string} merchantId - Optional merchant ID, will be auto-detected if not provided
 * @returns {string} Full path with merchant ID
 */
export const merchantLink = (path, merchantId = null) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Get merchant ID if not provided
    const mId = merchantId || getCurrentMerchantId();
    
    // If no merchant ID, return path as-is (might be landing page or other route)
    if (!mId) {
        return `/${cleanPath}`;
    }
    
    // Return path with merchant ID
    return `/${mId}/${cleanPath}`;
};

/**
 * Generate a link for routes that don't need merchant ID (like landing, admin, account)
 * @param {string} path - The path to navigate to
 * @returns {string} Full path
 */
export const absoluteLink = (path) => {
    return path.startsWith('/') ? path : `/${path}`;
};
