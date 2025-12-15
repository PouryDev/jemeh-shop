import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { apiGet } from '../utils/api';

const MerchantContext = createContext(null);

/**
 * Get merchant ID from route parameter
 */
const getMerchantIdFromRoute = (pathname) => {
    // Extract merchantId from route pattern: /:merchantId/...
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
        // First part could be merchantId
        const potentialMerchantId = parts[0];
        // Check if it's a valid merchant ID format (numeric or UUID)
        if (potentialMerchantId && potentialMerchantId !== 'landing' && 
            potentialMerchantId !== 'admin' && potentialMerchantId !== 'account' &&
            potentialMerchantId !== 'merchant' && potentialMerchantId !== 'subscription') {
            return potentialMerchantId;
        }
    }
    return null;
};

/**
 * Get merchant ID from sessionStorage with domain key
 */
const getMerchantIdFromStorage = () => {
    try {
        const host = window.location.host;
        const key = `merchant_id:${host}`;
        const value = sessionStorage.getItem(key);
        // Return null if value is null, undefined, empty string, or string "null"
        if (!value || value === 'null' || value === 'undefined') {
            return null;
        }
        return value;
    } catch (error) {
        console.error('Failed to read from sessionStorage:', error);
        return null;
    }
};

/**
 * Save merchant ID to sessionStorage with domain key
 */
const saveMerchantIdToStorage = (merchantId) => {
    try {
        const host = window.location.host;
        const key = `merchant_id:${host}`;
        // Only save if merchantId is valid (not null, undefined, empty, or string "null")
        if (merchantId && merchantId !== 'null' && merchantId !== 'undefined' && String(merchantId).trim().length > 0) {
            sessionStorage.setItem(key, String(merchantId));
        } else {
            sessionStorage.removeItem(key);
        }
    } catch (error) {
        console.error('Failed to save to sessionStorage:', error);
    }
};

/**
 * Extract subdomain from host
 */
const getSubdomainFromHost = () => {
    const host = window.location.host;
    const mainDomain = process.env.VITE_MAIN_DOMAIN || '';
    
    if (mainDomain && host.endsWith('.' + mainDomain)) {
        return host.replace('.' + mainDomain, '');
    }
    
    return null;
};

export function MerchantProvider({ children }) {
    const [merchantId, setMerchantId] = useState(null);
    const [merchantData, setMerchantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const params = useParams();

    // Get merchant ID from various sources
    const resolveMerchantId = () => {
        // Priority 1: Route parameter (from useParams or pathname)
        const routeMerchantId = params.merchantId || getMerchantIdFromRoute(location.pathname);
        if (routeMerchantId) {
            return routeMerchantId;
        }

        // Priority 2: sessionStorage with domain key
        const storageMerchantId = getMerchantIdFromStorage();
        if (storageMerchantId) {
            return storageMerchantId;
        }

        // Priority 3: Subdomain detection
        const subdomain = getSubdomainFromHost();
        if (subdomain) {
            return subdomain; // This might be a slug, not ID
        }

        // Priority 4: window.__MERCHANT_ID__ (for SSR)
        if (window.__MERCHANT_ID__) {
            return window.__MERCHANT_ID__;
        }

        // Priority 5: URL query parameter
        const queryMerchantId = new URLSearchParams(location.search).get('merchant_id');
        if (queryMerchantId) {
            return queryMerchantId;
        }

        return null;
    };

    const loadMerchantInfo = async (id) => {
        if (!id) {
            setMerchantId(null);
            setMerchantData(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await apiGet('/api/merchant/info', {
                headers: {
                    'X-Merchant-Id': id
                }
            });

            if (result.success && result.data) {
                const merchant = result.data;
                setMerchantId(merchant.id || id);
                setMerchantData(merchant);
                
                // Save to sessionStorage for future requests
                saveMerchantIdToStorage(merchant.id || id);
                
                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('merchant:changed', { 
                    detail: { merchantId: merchant.id || id, merchant } 
                }));
            } else {
                // Merchant not found or invalid
                setMerchantId(null);
                setMerchantData(null);
                saveMerchantIdToStorage(null);
            }
        } catch (error) {
            console.error('Failed to load merchant info:', error);
            setMerchantId(null);
            setMerchantData(null);
            saveMerchantIdToStorage(null);
        } finally {
            setLoading(false);
        }
    };

    // Load merchant when route or location changes
    useEffect(() => {
        const resolvedId = resolveMerchantId();
        
        // Skip if on landing page
        if (location.pathname === '/landing' || location.pathname.startsWith('/landing/')) {
            setMerchantId(null);
            setMerchantData(null);
            saveMerchantIdToStorage(null);
            setLoading(false);
            return;
        }

        // If merchant ID changed, load new merchant
        if (resolvedId !== merchantId) {
            loadMerchantInfo(resolvedId);
        } else if (!merchantId && !loading) {
            // If no merchant ID and not loading, set loading to false
            setLoading(false);
        }
    }, [location.pathname, location.search, params.merchantId]);

    // Listen for merchant changes from other components
    useEffect(() => {
        const handleMerchantChange = (event) => {
            const { merchantId: newMerchantId } = event.detail || {};
            if (newMerchantId && newMerchantId !== merchantId) {
                loadMerchantInfo(newMerchantId);
            }
        };

        window.addEventListener('merchant:changed', handleMerchantChange);
        return () => {
            window.removeEventListener('merchant:changed', handleMerchantChange);
        };
    }, [merchantId]);

    // Refresh merchant data (useful after settings update)
    const refreshMerchant = () => {
        if (merchantId) {
            loadMerchantInfo(merchantId);
        }
    };

    const value = {
        merchantId,
        merchantData,
        loading,
        isMerchantDetected: !!merchantData,
        refreshMerchant,
    };

    return (
        <MerchantContext.Provider value={value}>
            {children}
        </MerchantContext.Provider>
    );
}

export function useMerchant() {
    const context = useContext(MerchantContext);
    if (!context) {
        throw new Error('useMerchant must be used within a MerchantProvider');
    }
    return context;
}
