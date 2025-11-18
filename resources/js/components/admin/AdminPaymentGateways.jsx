import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/sanctumAuth';
import { showToast } from '../../utils/toast';

function AdminPaymentGateways() {
    const [gateways, setGateways] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showConfigForm, setShowConfigForm] = useState(false);
    const [editingGateway, setEditingGateway] = useState(null);
    const [configGateway, setConfigGateway] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        display_name: '',
        description: '',
        is_active: true,
        sort_order: 0
    });
    const [configData, setConfigData] = useState({});

    useEffect(() => {
        fetchGateways();
    }, []);

    const fetchGateways = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/admin/payment-gateways');
            
            if (response.ok) {
                const data = await response.json();
                setGateways(data.data);
            } else {
                setError('خطا در بارگذاری درگاه‌های پرداخت');
            }
        } catch (err) {
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingGateway 
                ? `/api/admin/payment-gateways/${editingGateway.id}`
                : '/api/admin/payment-gateways';
            
            const method = editingGateway ? 'PUT' : 'POST';
            
            const response = await apiRequest(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showToast(editingGateway ? 'درگاه پرداخت با موفقیت به‌روزرسانی شد' : 'درگاه پرداخت با موفقیت ایجاد شد', 'success');
                await fetchGateways();
                setShowForm(false);
                setEditingGateway(null);
                setFormData({
                    name: '',
                    type: '',
                    display_name: '',
                    description: '',
                    is_active: true,
                    sort_order: 0
                });
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'خطا در ذخیره درگاه پرداخت', 'error');
            }
        } catch (err) {
            showToast('خطا در ارتباط با سرور', 'error');
        }
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await apiRequest(`/api/admin/payment-gateways/${configGateway.id}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ config: configData }),
            });

            if (response.ok) {
                showToast('تنظیمات درگاه با موفقیت به‌روزرسانی شد', 'success');
                await fetchGateways();
                setShowConfigForm(false);
                setConfigGateway(null);
                setConfigData({});
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'خطا در به‌روزرسانی تنظیمات', 'error');
            }
        } catch (err) {
            showToast('خطا در ارتباط با سرور', 'error');
        }
    };

    const handleEdit = (gateway) => {
        setEditingGateway(gateway);
        setFormData({
            name: gateway.name,
            type: gateway.type,
            display_name: gateway.display_name,
            description: gateway.description || '',
            is_active: gateway.is_active,
            sort_order: gateway.sort_order
        });
        setShowForm(true);
    };

    const handleConfig = (gateway) => {
        setConfigGateway(gateway);
        setConfigData(gateway.config || {});
        setShowConfigForm(true);
    };

    const handleToggle = async (gateway) => {
        try {
            const response = await apiRequest(`/api/admin/payment-gateways/${gateway.id}/toggle`, {
                method: 'PATCH'
            });

            if (response.ok) {
                showToast(gateway.is_active ? 'درگاه پرداخت غیرفعال شد' : 'درگاه پرداخت فعال شد', 'success');
                await fetchGateways();
            } else {
                showToast('خطا در تغییر وضعیت درگاه', 'error');
            }
        } catch (err) {
            showToast('خطا در ارتباط با سرور', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این درگاه پرداخت را حذف کنید؟')) {
            return;
        }

        try {
            const response = await apiRequest(`/api/admin/payment-gateways/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('درگاه پرداخت با موفقیت حذف شد', 'success');
                await fetchGateways();
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'خطا در حذف درگاه پرداخت', 'error');
            }
        } catch (err) {
            showToast('خطا در ارتباط با سرور', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-cherry-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">مدیریت درگاه‌های پرداخت</h1>
                <button
                    onClick={() => {
                        setEditingGateway(null);
                        setFormData({
                            name: '',
                            type: '',
                            display_name: '',
                            description: '',
                            is_active: true,
                            sort_order: 0
                        });
                        setShowForm(true);
                    }}
                    className="bg-cherry-600 hover:bg-cherry-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    افزودن درگاه جدید
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                    {error}
                </div>
            )}

            <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/10">
                        <tr>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-white">نام</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-white">نوع</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-white">وضعیت</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-white">ترتیب</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-white">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {gateways.map((gateway) => (
                            <tr key={gateway.id} className="hover:bg-white/5">
                                <td className="px-4 py-3 text-white">{gateway.display_name}</td>
                                <td className="px-4 py-3 text-gray-300">{gateway.type}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        gateway.is_active 
                                            ? 'bg-green-500/10 text-green-400' 
                                            : 'bg-red-500/10 text-red-400'
                                    }`}>
                                        {gateway.is_active ? 'فعال' : 'غیرفعال'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-300">{gateway.sort_order}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(gateway)}
                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                        >
                                            {gateway.is_active ? 'غیرفعال' : 'فعال'}
                                        </button>
                                        <button
                                            onClick={() => handleConfig(gateway)}
                                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                                        >
                                            تنظیمات
                                        </button>
                                        <button
                                            onClick={() => handleEdit(gateway)}
                                            className="text-green-400 hover:text-green-300 text-sm"
                                        >
                                            ویرایش
                                        </button>
                                        <button
                                            onClick={() => handleDelete(gateway.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Gateway Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingGateway ? 'ویرایش درگاه پرداخت' : 'افزودن درگاه پرداخت'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">نام</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">نوع (type)</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-1 focus:border-cherry-500 focus:ring-cherry-500"
                                    required
                                    disabled={!!editingGateway}
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="">انتخاب کنید</option>
                                    <option value="zarinpal">زرین‌پال</option>
                                    <option value="card_to_card">کارت به کارت</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">نام نمایشی</label>
                                <input
                                    type="text"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">توضیحات</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">ترتیب نمایش</label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm text-gray-300">فعال</label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-cherry-600 hover:bg-cherry-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    ذخیره
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingGateway(null);
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    انصراف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Config Form Modal */}
            {showConfigForm && configGateway && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            تنظیمات {configGateway.display_name}
                        </h2>
                        <form onSubmit={handleConfigSubmit} className="space-y-4">
                            {configGateway.type === 'zarinpal' && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Merchant ID</label>
                                        <input
                                            type="text"
                                            value={configData.merchant_id || ''}
                                            onChange={(e) => setConfigData({ ...configData, merchant_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                            placeholder="مرچنت کد زرین‌پال"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={configData.sandbox || false}
                                            onChange={(e) => setConfigData({ ...configData, sandbox: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label className="text-sm text-gray-300">Sandbox Mode</label>
                                    </div>
                                </>
                            )}
                            {configGateway.type === 'card_to_card' && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">شماره کارت</label>
                                        <input
                                            type="text"
                                            value={configData.card_number || ''}
                                            onChange={(e) => setConfigData({ ...configData, card_number: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                            placeholder="6037991553211859"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">نام دارنده کارت</label>
                                        <input
                                            type="text"
                                            value={configData.card_holder || ''}
                                            onChange={(e) => setConfigData({ ...configData, card_holder: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                            placeholder="نام دارنده کارت"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-cherry-600 hover:bg-cherry-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    ذخیره تنظیمات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfigForm(false);
                                        setConfigGateway(null);
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    انصراف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPaymentGateways;

