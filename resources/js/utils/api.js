// API utility functions for consistent error handling and authentication

export const apiRequest = async (url, options = {}) => {
    const defaultHeaders = {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    };

    const config = {
        credentials: 'same-origin',
        headers: { ...defaultHeaders, ...options.headers },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                window.dispatchEvent(new CustomEvent('toast:show', { 
                    detail: { type: 'error', message: 'شما وارد نشده‌اید. لطفاً دوباره وارد شوید.' } 
                }));
                return { success: false, error: 'unauthorized' };
            }
            
            const errorMessage = data.message || `خطا در درخواست (${response.status})`;
            window.dispatchEvent(new CustomEvent('toast:show', { 
                detail: { type: 'error', message: errorMessage } 
            }));
            return { success: false, error: errorMessage, data };
        }

        return { success: true, data };
    } catch (error) {
        console.error('API request error:', error);
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