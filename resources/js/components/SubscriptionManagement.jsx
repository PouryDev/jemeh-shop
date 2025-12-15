import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

function SubscriptionManagement() {
    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [upgrading, setUpgrading] = useState(false);
    const [canceling, setCanceling] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [subscriptionRes, plansRes] = await Promise.all([
                apiRequest('/api/merchant/subscription'),
                apiRequest('/api/saas/plans'),
            ]);

            if (subscriptionRes.success && subscriptionRes.data) {
                setSubscription(subscriptionRes.data);
            }

            if (plansRes.success && plansRes.data) {
                const plansData = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.data || [];
                setPlans(plansData);
            }
        } catch (err) {
            console.error('Failed to load subscription data:', err);
            setError('خطا در بارگذاری اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId, billingCycle) => {
        try {
            setUpgrading(true);
            setError(null);

            const res = await apiRequest('/api/merchant/subscription/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: planId,
                    billing_cycle: billingCycle,
                }),
            });

            if (res.success) {
                alert('پلن با موفقیت تغییر کرد');
                await loadData();
            } else {
                setError(res.error || res.message || 'خطا در تغییر پلن');
            }
        } catch (err) {
            console.error('Upgrade error:', err);
            setError('خطا در تغییر پلن');
        } finally {
            setUpgrading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید اشتراک را لغو کنید؟')) {
            return;
        }

        try {
            setCanceling(true);
            setError(null);

            const res = await apiRequest('/api/merchant/subscription/cancel', {
                method: 'POST',
            });

            if (res.success) {
                alert('اشتراک با موفقیت لغو شد');
                await loadData();
            } else {
                setError(res.error || res.message || 'خطا در لغو اشتراک');
            }
        } catch (err) {
            console.error('Cancel error:', err);
            setError('خطا در لغو اشتراک');
        } finally {
            setCanceling(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fa-IR').format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-500 bg-green-500/10';
            case 'trial':
                return 'text-blue-500 bg-blue-500/10';
            case 'canceled':
                return 'text-red-500 bg-red-500/10';
            case 'expired':
                return 'text-gray-500 bg-gray-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'فعال';
            case 'trial':
                return 'آزمایشی';
            case 'canceled':
                return 'لغو شده';
            case 'expired':
                return 'منقضی شده';
            default:
                return status;
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

    if (error && !subscription) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadData}
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
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">مدیریت اشتراک</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {subscription && (
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">اشتراک فعلی</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">پلن فعلی</p>
                            <p className="text-white text-xl font-bold">{subscription.plan?.name || 'بدون پلن'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">وضعیت</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                                {getStatusText(subscription.status)}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">دوره پرداخت</p>
                            <p className="text-white text-lg">
                                {subscription.billing_cycle === 'yearly' ? 'سالانه' : 'ماهانه'}
                            </p>
                        </div>
                        {subscription.current_period_end && (
                            <div>
                                <p className="text-gray-400 text-sm mb-1">تاریخ تمدید</p>
                                <p className="text-white text-lg">{formatDate(subscription.current_period_end)}</p>
                            </div>
                        )}
                        {subscription.trial_ends_at && (
                            <div>
                                <p className="text-gray-400 text-sm mb-1">پایان دوره آزمایشی</p>
                                <p className="text-white text-lg">{formatDate(subscription.trial_ends_at)}</p>
                            </div>
                        )}
                    </div>

                    {subscription.status === 'active' && (
                        <div className="mt-6">
                            <button
                                onClick={handleCancel}
                                disabled={canceling}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {canceling ? 'در حال لغو...' : 'لغو اشتراک'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">پلن‌های موجود</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrentPlan = subscription?.plan_id === plan.id;
                        const price = plan.price_monthly || 0;
                        const yearlyPrice = plan.price_yearly || 0;

                        return (
                            <div
                                key={plan.id}
                                className={`bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border ${
                                    isCurrentPlan ? 'border-purple-500/50' : 'border-white/10'
                                } p-6`}
                            >
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                                <div className="mb-4">
                                    {price > 0 ? (
                                        <>
                                            <span className="text-2xl font-bold text-white">
                                                {formatPrice(price)}
                                            </span>
                                            <span className="text-gray-400"> تومان/ماه</span>
                                            {yearlyPrice > 0 && (
                                                <div className="text-sm text-gray-400 mt-1">
                                                    یا {formatPrice(yearlyPrice)} تومان/سال
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-white">رایگان</span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <ul className="space-y-2 text-sm text-gray-300">
                                        {plan.features?.product_variants && (
                                            <li className="flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                Product Variants
                                            </li>
                                        )}
                                        {plan.features?.campaigns && (
                                            <li className="flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                Campaigns
                                            </li>
                                        )}
                                        {plan.features?.analytics !== 'none' && (
                                            <li className="flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                Analytics ({plan.features.analytics})
                                            </li>
                                        )}
                                        {plan.features?.telegram_notifications && (
                                            <li className="flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                Telegram Notifications
                                            </li>
                                        )}
                                        {plan.features?.custom_domain && (
                                            <li className="flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                Custom Domain
                                            </li>
                                        )}
                                        {plan.features?.custom_templates && (
                                            <li className="flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                Custom Templates
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="w-full bg-gray-600 text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed"
                                    >
                                        پلن فعلی
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        {price > 0 && (
                                            <button
                                                onClick={() => handleUpgrade(plan.id, 'monthly')}
                                                disabled={upgrading}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {upgrading ? 'در حال تغییر...' : 'ارتقا به پلن ماهانه'}
                                            </button>
                                        )}
                                        {yearlyPrice > 0 && (
                                            <button
                                                onClick={() => handleUpgrade(plan.id, 'yearly')}
                                                disabled={upgrading}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {upgrading ? 'در حال تغییر...' : 'ارتقا به پلن سالانه'}
                                            </button>
                                        )}
                                        {price === 0 && (
                                            <button
                                                onClick={() => handleUpgrade(plan.id, 'monthly')}
                                                disabled={upgrading}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {upgrading ? 'در حال تغییر...' : 'انتخاب این پلن'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SubscriptionManagement;
