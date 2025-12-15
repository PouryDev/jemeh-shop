import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/sanctumAuth';
import { apiGet } from '../../utils/api';
import { useMerchant } from '../../contexts/MerchantContext';

function AdminMerchantSettings() {
    const { merchantData, refreshMerchant } = useMerchant();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [merchant, setMerchant] = useState(null);
    const [formData, setFormData] = useState({
        website_title: '',
        logo: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadMerchantData();
    }, []);

    const loadMerchantData = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiGet('/api/merchant/info');

            if (result.success && result.data) {
                setMerchant(result.data);
                const settings = result.data.settings || {};
                setFormData({
                    website_title: settings.website_title || result.data.name || '',
                    logo: null
                });

                // Set logo preview if exists
                if (settings.logo_path) {
                    setLogoPreview(`/storage/${settings.logo_path}`);
                } else {
                    setLogoPreview('/images/logo.png'); // Default logo
                }
            } else {
                setError('فروشگاهی یافت نشد');
            }
        } catch (err) {
            console.error('Failed to load merchant data:', err);
            setError('خطا در بارگذاری اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('لطفاً یک فایل تصویری انتخاب کنید');
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                setError('حجم فایل نباید بیشتر از 2 مگابایت باشد');
                return;
            }

            setFormData({ ...formData, logo: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setFormData({ ...formData, logo: null });
        // Reset to default or current logo
        if (merchant?.settings?.logo_path) {
            setLogoPreview(`/storage/${merchant.settings.logo_path}`);
        } else {
            setLogoPreview('/images/logo.png');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            // Use merchantData from context or local merchant state
            const currentMerchant = merchantData || merchant;

            // Check if there are any changes
            const currentWebsiteTitle = currentMerchant?.settings?.website_title || currentMerchant?.name || '';
            const hasWebsiteTitleChange = formData.website_title !== undefined &&
                formData.website_title !== currentWebsiteTitle;
            const hasLogoChange = !!formData.logo;

            console.log('Change detection:', {
                formData_website_title: formData.website_title,
                currentWebsiteTitle,
                hasWebsiteTitleChange,
                hasLogoChange,
                currentMerchant: currentMerchant,
                merchantData: merchantData,
                merchant: merchant
            });

            // Check if there's at least something to save
            const hasWebsiteTitleToSave = formData.website_title !== undefined && formData.website_title !== null;
            if (!hasWebsiteTitleToSave && !hasLogoChange) {
                setError('لطفاً حداقل یک مورد را تغییر دهید');
                setSaving(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('_method', 'PUT')

            // Always send website_title if form has a value (even if unchanged, to ensure it's saved)
            // This ensures the value is always sent to backend
            if (formData.website_title !== undefined && formData.website_title !== null) {
                formDataToSend.append('website_title', formData.website_title || '');
                console.log('Added website_title to FormData:', formData.website_title || '');
            }

            // Add logo if a new one is selected
            if (hasLogoChange) {
                formDataToSend.append('logo', formData.logo);
                console.log('Added logo to FormData');
            }

            // Debug: Log FormData contents
            console.log('FormData contents:');
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
            }

            console.log('Sending settings update:', {
                website_title: formData.website_title,
                has_logo: !!formData.logo,
                hasWebsiteTitleChange,
                hasLogoChange
            });

            const response = await apiRequest('/api/merchant/settings', {
                method: 'POST',
                body: formDataToSend
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            let responseData;
            try {
                const text = await response.text();
                console.log('Response text:', text);
                responseData = text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                setError('خطا در پردازش پاسخ سرور');
                setSaving(false);
                return;
            }

            console.log('Response data:', responseData);

            if (response.ok && responseData.success) {
                setSuccess(true);
                // Reload merchant data to get updated settings
                await loadMerchantData();
                // Refresh merchant context to update Header and Footer
                if (refreshMerchant) {
                    refreshMerchant();
                }
                // Clear logo from form if it was uploaded
                setFormData({ ...formData, logo: null });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Show success toast
                window.dispatchEvent(new CustomEvent('toast:show', {
                    detail: { type: 'success', message: 'تنظیمات با موفقیت ذخیره شد' }
                }));

                // Hide success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            } else {
                // Handle validation errors
                let errorMessage = responseData.message || 'خطا در ذخیره تنظیمات';

                if (responseData.errors) {
                    const errorMessages = Object.values(responseData.errors).flat();
                    errorMessage = errorMessages.join(', ') || errorMessage;
                }

                console.error('Settings update failed:', errorMessage, responseData);
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError(err.message || 'خطا در ارتباط با سرور');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">در حال بارگذاری...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !merchant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadMerchantData}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">تنظیمات فروشگاه</h1>
                    <p className="text-gray-400">شخصی‌سازی عنوان و لوگوی وبسایت فروشگاه</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <p className="text-green-400">تنظیمات با موفقیت ذخیره شد</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Website Title */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            عنوان وبسایت
                        </label>
                        <input
                            type="text"
                            value={formData.website_title}
                            onChange={(e) => setFormData({ ...formData, website_title: e.target.value })}
                            placeholder="عنوان فروشگاه شما"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            maxLength={255}
                        />
                        <p className="mt-2 text-xs text-gray-400">
                            این عنوان در تب مرورگر و بخش‌های مختلف وبسایت نمایش داده می‌شود
                        </p>
                    </div>

                    {/* Logo Upload */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            لوگوی فروشگاه
                        </label>

                        {/* Current Logo Preview */}
                        <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">لوگوی فعلی:</p>
                            <div className="inline-block relative">
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="h-24 w-24 object-contain bg-white/5 rounded-lg border border-white/10 p-2"
                                />
                            </div>
                        </div>

                        {/* File Input */}
                        <div className="space-y-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                                id="logo-upload"
                            />
                            <label
                                htmlFor="logo-upload"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {formData.logo ? 'تغییر لوگو' : 'آپلود لوگوی جدید'}
                            </label>

                            {formData.logo && (
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        حذف تغییرات
                                    </button>
                                    <span className="text-xs text-gray-400">
                                        {formData.logo.name} ({(formData.logo.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="mt-2 text-xs text-gray-400">
                            فرمت‌های مجاز: JPG, PNG, GIF | حداکثر حجم: 2 مگابایت
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={loadMerchantData}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                            disabled={saving}
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    در حال ذخیره...
                                </span>
                            ) : (
                                'ذخیره تنظیمات'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminMerchantSettings;
