/**
 * Theme Loader Utility
 * Handles dynamic theme loading and application
 */

let currentTheme = null;
let themeConfig = null;

const getMerchantId = () => {
    // Get merchant ID from sessionStorage first (real ID), then fallback
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
    
    // Return null if invalid
    if (!merchantId || merchantId === 'null' || merchantId === 'undefined') {
        return null;
    }
    
    return merchantId;
};

/**
 * Initialize and apply theme based on merchant's theme selection
 */
export async function initTheme() {
    try {
        const merchantId = getMerchantId();
        
        // Build URL with merchant_id query parameter if present
        let url = '/api/merchant/theme';

        let headers = {};
        // Only add header if merchantId is valid (not null, undefined, empty, or string "null")
        if (merchantId && merchantId !== 'null' && merchantId !== 'undefined' && merchantId.trim && merchantId.trim().length > 0) {
            headers['X-Merchant-Id'] = merchantId;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.warn('Failed to fetch theme, using default');
            await loadTheme('default');
            return;
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.theme) {
            const themeSlug = data.data.theme.slug || 'default';
            await loadTheme(themeSlug);
        } else {
            // No theme found, use default
            await loadTheme('default');
        }
    } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to default theme
        await loadTheme('default');
    }
}

/**
 * Load theme configuration and apply styles
 */
async function loadTheme(themeSlug) {
    try {
        // Avoid reloading the same theme
        if (currentTheme === themeSlug && themeConfig) {
            return;
        }
        
        // Dynamically import theme configuration
        let config;
        try {
            const themeModule = await import(`../themes/${themeSlug}/theme.config.js`);
            config = themeModule.default;
        } catch (error) {
            console.warn(`Theme ${themeSlug} not found, falling back to default`);
            if (themeSlug !== 'default') {
                return await loadTheme('default');
            }
            // If default also fails, use a minimal config
            config = {
                name: 'پیش‌فرض',
                slug: 'default',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#1e40af',
                },
            };
        }
        
        themeConfig = config;
        currentTheme = themeSlug;
        
        // Apply theme styles
        applyThemeStyles(config);
        
        // Store theme info for later use
        window.__THEME__ = {
            slug: themeSlug,
            config: config,
        };
        
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

/**
 * Apply theme-specific CSS variables and styles
 */
function applyThemeStyles(config) {
    const root = document.documentElement;
    
    // Apply color variables if defined
    if (config.colors) {
        if (config.colors.primary) {
            root.style.setProperty('--theme-primary', config.colors.primary);
        }
        if (config.colors.secondary) {
            root.style.setProperty('--theme-secondary', config.colors.secondary);
        }
    }
    
    // Apply font variables if defined
    if (config.fonts) {
        if (config.fonts.primary) {
            root.style.setProperty('--theme-font-primary', config.fonts.primary);
        }
    }
    
    // Add theme class to body for theme-specific styling
    document.body.classList.remove('theme-default', 'theme-modern', 'theme-minimal');
    document.body.classList.add(`theme-${config.slug}`);
}

/**
 * Get current theme configuration
 */
export function getCurrentTheme() {
    return {
        slug: currentTheme,
        config: themeConfig,
    };
}

/**
 * Reload theme (useful after theme changes)
 */
export async function reloadTheme() {
    currentTheme = null;
    themeConfig = null;
    await initTheme();
}
