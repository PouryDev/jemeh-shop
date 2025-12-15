import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

function CommissionManagement() {
    const [commissions, setCommissions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        status: 'all',
        merchant_id: 'all',
    });
    const [markingPaid, setMarkingPaid] = useState(null);

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [commissionsRes, summaryRes] = await Promise.all([
                apiRequest('/api/admin/commissions'),
                apiRequest('/api/admin/commissions/summary'),
            ]);

            if (commissionsRes.success && commissionsRes.data) {
                let filteredCommissions = commissionsRes.data;

                if (filter.status !== 'all') {
                    filteredCommissions = filteredCommissions.filter(
                        (c) => c.status === filter.status
                    );
                }

                if (filter.merchant_id !== 'all') {
                    filteredCommissions = filteredCommissions.filter(
                        (c) => c.merchant_id === parseInt(filter.merchant_id)
                    );
                }

                setCommissions(filteredCommissions);
            }

            if (summaryRes.success && summaryRes.data) {
                setSummary(summaryRes.data);
            }
        } catch (err) {
            console.error('Failed to load commission data:', err);
            setError('خطا در بارگذاری اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (commissionId) => {
        try {
            setMarkingPaid(commissionId);
            setError(null);

            const res = await apiRequest(`/api/admin/commissions/${commissionId}/mark-paid`, {
                method: 'PATCH',
            });

            if (res.success) {
                await loadData();
            } else {
                setError(res.error || res.message || 'خطا در علامت‌گذاری');
            }
        } catch (err) {
            console.error('Mark as paid error:', err);
            setError('خطا در علامت‌گذاری');
        } finally {
            setMarkingPaid(null);
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
            case 'paid':
                return 'text-green-500 bg-green-500/10';
            case 'pending':
                return 'text-yellow-500 bg-yellow-500/10';
            case 'canceled':
                return 'text-red-500 bg-red-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid':
                return 'پرداخت شده';
            case 'pending':
                return 'در انتظار پرداخت';
            case 'canceled':
                return 'لغو شده';
            default:
                return status;
        }
    };

    // Get unique merchants for filter
    const merchants = [...new Set(commissions.map((c) => ({ id: c.merchant_id, name: c.merchant?.name })))].filter(
        (m) => m.id
    );

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
            <h1 className="text-3xl font-bold text-white mb-8">مدیریت کمیسیون‌ها</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-xl border border-blue-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-1">کل کمیسیون‌ها</p>
                        <p className="text-white text-2xl font-bold">
                            {formatPrice(summary.reduce((sum, s) => sum + (s.total || 0), 0))} تومان
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-1">در انتظار پرداخت</p>
                        <p className="text-white text-2xl font-bold">
                            {formatPrice(summary.reduce((sum, s) => sum + (s.pending || 0), 0))} تومان
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-1">پرداخت شده</p>
                        <p className="text-white text-2xl font-bold">
                            {formatPrice(summary.reduce((sum, s) => sum + (s.paid || 0), 0))} تومان
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
                        <p className="text-gray-400 text-sm mb-1">تعداد کمیسیون‌ها</p>
                        <p className="text-white text-2xl font-bold">
                            {summary.reduce((sum, s) => sum + (s.count?.pending || 0), 0)} در انتظار
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">فیلترها</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">وضعیت</label>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        >
                            <option value="all">همه</option>
                            <option value="pending">در انتظار پرداخت</option>
                            <option value="paid">پرداخت شده</option>
                            <option value="canceled">لغو شده</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">فروشگاه</label>
                        <select
                            value={filter.merchant_id}
                            onChange={(e) => setFilter({ ...filter, merchant_id: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        >
                            <option value="all">همه</option>
                            {merchants.map((merchant) => (
                                <option key={merchant.id} value={merchant.id}>
                                    {merchant.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    فروشگاه
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    سفارش
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    مبلغ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    درصد
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    وضعیت
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    تاریخ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    عملیات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {commissions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                                        کمیسیونی یافت نشد
                                    </td>
                                </tr>
                            ) : (
                                commissions.map((commission) => (
                                    <tr key={commission.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {commission.merchant?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            #{commission.order_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {formatPrice(commission.amount)} تومان
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            {commission.percentage}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                    commission.status
                                                )}`}
                                            >
                                                {getStatusText(commission.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {formatDate(commission.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {commission.status === 'pending' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(commission.id)}
                                                    disabled={markingPaid === commission.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50 text-xs"
                                                >
                                                    {markingPaid === commission.id ? '...' : 'علامت‌گذاری پرداخت'}
                                                </button>
                                            )}
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

export default CommissionManagement;
