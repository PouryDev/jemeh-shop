import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

function MerchantManagement() {
    const [merchants, setMerchants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [merchantsRes, plansRes] = await Promise.all([
                apiRequest('/api/admin/merchants'),
                apiRequest('/api/saas/plans'),
            ]);

            if (merchantsRes.success && merchantsRes.data) {
                setMerchants(merchantsRes.data);
            }

            if (plansRes.success && plansRes.data) {
                const plansData = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.data || [];
                setPlans(plansData);
            }
        } catch (err) {
            console.error('Failed to load merchant data:', err);
            setError('خطا در بارگذاری اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (merchantId, currentStatus) => {
        try {
            setUpdating(merchantId);
            setError(null);

            const res = await apiRequest(`/api/admin/merchants/${merchantId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_active: !currentStatus,
                }),
            });

            if (res.success) {
                await loadData();
            } else {
                setError(res.error || res.message || 'خطا در تغییر وضعیت');
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            setError('خطا در تغییر وضعیت');
        } finally {
            setUpdating(null);
        }
    };

    const handleChangePlan = async (merchantId, planId) => {
        try {
            setUpdating(merchantId);
            setError(null);

            const res = await apiRequest(`/api/admin/merchants/${merchantId}/plan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: planId,
                }),
            });

            if (res.success) {
                alert('پلن با موفقیت تغییر کرد');
                await loadData();
            } else {
                setError(res.error || res.message || 'خطا در تغییر پلن');
            }
        } catch (err) {
            console.error('Change plan error:', err);
            setError('خطا در تغییر پلن');
        } finally {
            setUpdating(null);
        }
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

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">مدیریت فروشگاه‌ها</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    نام فروشگاه
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Subdomain
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    مالک
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    پلن
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    وضعیت اشتراک
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    وضعیت
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    عملیات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {merchants.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                                        فروشگاهی یافت نشد
                                    </td>
                                </tr>
                            ) : (
                                merchants.map((merchant) => (
                                    <tr key={merchant.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {merchant.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {merchant.subdomain || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {merchant.user?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={merchant.plan_id || ''}
                                                onChange={(e) =>
                                                    handleChangePlan(merchant.id, parseInt(e.target.value))
                                                }
                                                disabled={updating === merchant.id}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm disabled:opacity-50"
                                            >
                                                {plans.map((plan) => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    merchant.subscription?.status === 'active'
                                                        ? 'text-green-500 bg-green-500/10'
                                                        : merchant.subscription?.status === 'trial'
                                                        ? 'text-blue-500 bg-blue-500/10'
                                                        : 'text-gray-500 bg-gray-500/10'
                                                }`}
                                            >
                                                {merchant.subscription?.status === 'active'
                                                    ? 'فعال'
                                                    : merchant.subscription?.status === 'trial'
                                                    ? 'آزمایشی'
                                                    : merchant.subscription_status || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    merchant.is_active
                                                        ? 'text-green-500 bg-green-500/10'
                                                        : 'text-red-500 bg-red-500/10'
                                                }`}
                                            >
                                                {merchant.is_active ? 'فعال' : 'غیرفعال'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleToggleStatus(merchant.id, merchant.is_active)}
                                                disabled={updating === merchant.id}
                                                className={`px-3 py-1 rounded-lg transition-colors disabled:opacity-50 text-xs ${
                                                    merchant.is_active
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                            >
                                                {updating === merchant.id
                                                    ? '...'
                                                    : merchant.is_active
                                                    ? 'غیرفعال کردن'
                                                    : 'فعال کردن'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MerchantManagement;
