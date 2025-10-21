import axios from 'axios';
import { refreshCSRFToken, getCSRFToken } from './utils/csrfToken';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up CSRF token handling for axios
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Add axios interceptor to handle CSRF token refresh on 419 errors
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 419) {
            console.log('CSRF token expired, refreshing...');
            try {
                await refreshCSRFToken();
                const newToken = getCSRFToken();
                if (newToken) {
                    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
                    // Retry the original request
                    return window.axios.request(error.config);
                }
            } catch (refreshError) {
                console.error('Failed to refresh CSRF token:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);
