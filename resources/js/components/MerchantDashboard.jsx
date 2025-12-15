import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/sanctumAuth';

function MerchantDashboard() {
    const navigate = useNavigate();
    const [merchantData, setMerchantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMerchantData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await apiRequest('/api/merchant/info');
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setMerchantData(data.data);
                    } else {
                        setError('اطلاعات فروشگاه یافت نشد');
                    }
                } else {
                    setError('خطا در ارتباط با سرور');
                }
            } catch (error) {
                console.error('Failed to load merchant data:', error);
                setError('خطا در بارگذاری اطلاعات');
            } finally {
                setLoading(false);
            }
        };

        loadMerchantData();
    }, []);

    const formatPrice = (value) => {
        try { 
            return Number(value || 0).toLocaleString('fa-IR'); 
        } catch { 
            return value || '0'; 
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">در حال بارگذاری...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-red-400 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!merchantData) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <p className="text-gray-400">فروشگاهی یافت نشد</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">داشبورد فروشگاه</h1>
                <p className="text-gray-400">خوش آمدید! مدیریت فروشگاه خود را از اینجا شروع کنید</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-xl border border-blue-500/20 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">کل محصولات</p>
                            <p className="text-white text-2xl font-bold">{formatPrice(merchantData.products_count || 0)}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">کل سفارش‌ها</p>
                            <p className="text-white text-2xl font-bold">{formatPrice(merchantData.orders_count || 0)}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">درآمد کل</p>
                            <p className="text-white text-2xl font-bold">{formatPrice(merchantData.total_revenue || 0)} تومان</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Info */}
            {merchantData.plan && (
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">اطلاعات اشتراک</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">پلن فعلی</p>
                            <p className="text-white text-xl font-bold">{merchantData.plan.name || 'بدون پلن'}</p>
                        </div>
                        {merchantData.subscription && (
                            <div>
                                <p className="text-gray-400 text-sm">وضعیت اشتراک</p>
                                <p className={`text-xl font-bold ${merchantData.subscription.status === 'active' ? 'text-green-400' : 'text-orange-400'}`}>
                                    {merchantData.subscription.status === 'active' ? 'فعال' : 'غیرفعال'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">دسترسی سریع</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="bg-gradient-to-br from-green-500 to-green-600 hover:scale-105 transition-all duration-200 rounded-xl p-6 text-white text-left transform hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">مدیریت محصولات</h3>
                        <p className="text-white/80 text-sm">مشاهده و مدیریت محصولات فروشگاه</p>
                    </button>

                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 hover:scale-105 transition-all duration-200 rounded-xl p-6 text-white text-left transform hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">مدیریت سفارش‌ها</h3>
                        <p className="text-white/80 text-sm">مشاهده و مدیریت سفارش‌های فروشگاه</p>
                    </button>

                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 hover:scale-105 transition-all duration-200 rounded-xl p-6 text-white text-left transform hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">تحلیل و آمار</h3>
                        <p className="text-white/80 text-sm">مشاهده آمار و تحلیل فروشگاه</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MerchantDashboard;
