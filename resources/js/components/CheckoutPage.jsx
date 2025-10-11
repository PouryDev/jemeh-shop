import React from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutAuthModal from './CheckoutAuthModal';
import { convertPersianToEnglish } from '../utils/convertPersianNumbers';

function CheckoutPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [cart, setCart] = React.useState({ items: [], total: 0, count: 0 });
    const [form, setForm] = React.useState({ name: '', phone: '', address: '', discount_code: '', delivery_method_id: '' });
    const [submitting, setSubmitting] = React.useState(false);
    const [discountInfo, setDiscountInfo] = React.useState(null);
    const [deliveryMethods, setDeliveryMethods] = React.useState([]);
    const [selectedDelivery, setSelectedDelivery] = React.useState(null);
    const [receiptPreview, setReceiptPreview] = React.useState(null);
    const [receiptFile, setReceiptFile] = React.useState(null);

    const formatPrice = (v) => {
        try { return Number(v || 0).toLocaleString('fa-IR'); } catch { return v; }
    };

    const [authUser, setAuthUser] = React.useState(null);
    const [authOpen, setAuthOpen] = React.useState(false);

        React.useEffect(() => {
        // Bootstrap user from Laravel (window.__USER__ or session)
        const bootstrapUser = window.__USER__ || null;
        if (bootstrapUser) {
            setAuthUser(bootstrapUser);
            setForm((prev) => ({
                ...prev,
                name: bootstrapUser.name || '',
                phone: bootstrapUser.phone || '',
                address: bootstrapUser.address || '',
            }));
        }
    }, []);

    const fetchCart = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/cart/json', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            setCart({ items: data.items || [], total: data.total || 0, count: data.count || 0 });
        } catch (e) {
            setError('خطا در دریافت اطلاعات سبد');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCart();
        fetchDeliveryMethods();
    }, [fetchCart]);

    const fetchDeliveryMethods = async () => {
        try {
            const res = await fetch('/api/delivery-methods', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            if (data.success) {
                setDeliveryMethods(data.data || []);
                if (data.data && data.data.length > 0) {
                    const firstMethod = data.data[0];
                    setSelectedDelivery(firstMethod);
                    setForm((prev) => ({ ...prev, delivery_method_id: firstMethod.id }));
                }
            }
        } catch (e) {}
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'phone' ? convertPersianToEnglish(value) : value;
        setForm((prev) => ({ ...prev, [name]: finalValue }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setReceiptPreview(reader.result);
        reader.readAsDataURL(file);
    };

    async function applyDiscount() {
        // Placeholder: here you could call a dedicated API to validate discount; for now just show a dummy confirmation
        if (!form.discount_code) return;
        setDiscountInfo({ code: form.discount_code, amount: Math.min(50000, Math.round(cart.total * 0.1)) });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        // Gate by auth: if not logged in, open auth modal instead of submit
        if (!authUser) {
            setAuthOpen(true);
            return;
        }
        setSubmitting(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const formData = new FormData();
            formData.append('customer_name', form.name);
            formData.append('customer_phone', convertPersianToEnglish(form.phone));
            formData.append('customer_address', form.address);
            formData.append('delivery_method_id', form.delivery_method_id);
            if (form.discount_code) formData.append('discount_code', form.discount_code);
            if (receiptFile) formData.append('receipt', receiptFile);

            const res = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                credentials: 'same-origin',
                body: formData,
            });
            if (!res.ok) throw new Error('failed');
            const result = await res.json();
            // Navigate to thanks page
            navigate('/thanks/last');
            // Clear cart
            try { localStorage.setItem('cart', JSON.stringify([])); } catch {}
            window.dispatchEvent(new Event('cart:update'));
        } catch (e) {
            setError('ثبت سفارش با خطا مواجه شد');
        } finally {
            setSubmitting(false);
        }
    }

    const deliveryFee = selectedDelivery?.fee || 0;

    const finalAmount = React.useMemo(() => {
        const subtotal = cart.total;
        const discount = discountInfo?.amount || 0;
        const delivery = deliveryFee;
        return Math.max(0, subtotal - discount + delivery);
    }, [cart.total, discountInfo, deliveryFee]);

    return (
        <div className="min-h-screen pb-28 md:pb-8 pt-6 md:pt-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">تسویه حساب</h1>

                {loading ? (
                    <div className="text-gray-300">در حال بارگذاری...</div>
                ) : error ? (
                    <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 p-3 text-rose-300">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Summary / Invoice */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/5 glass-card rounded-xl overflow-hidden soft-shadow">
                                <div className="bg-gradient-to-r from-white/10 to-white/0 px-4 py-3 flex items-center justify-between">
                                    <div className="text-white font-bold">جزئیات سفارش</div>
                                    <div className="text-xs text-gray-300">{cart.count} قلم</div>
                                </div>
                                <div className="divide-y divide-white/10">
                                    {cart.items.map((item) => (
                                        <div key={item.cart_key} className="p-3 md:p-4 flex items-start gap-3 md:gap-4">
                                            <div className="w-14 h-14 rounded bg-white/10 flex items-center justify-center">🧾</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="text-white font-semibold truncate max-w-[200px] md:max-w-none">{item.title}</div>
                                                        {item.variant_display_name && (
                                                            <div className="text-xs text-gray-300 mt-0.5">{item.variant_display_name}</div>
                                                        )}
                                                        <div className="text-xs text-gray-400 mt-1">{item.quantity} عدد × {formatPrice(item.price)} تومان</div>
                                                    </div>
                                                    <div className="text-white font-bold text-sm md:text-base">{formatPrice(item.total)} تومان</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 space-y-1">
                                    <div className="flex items-center justify-between text-white">
                                        <span className="text-sm text-gray-300">جمع کل</span>
                                        <span className="font-extrabold">{formatPrice(cart.total)} تومان</span>
                                    </div>
                                    {discountInfo && (
                                        <div className="flex items-center justify-between text-green-400 text-sm">
                                            <span>تخفیف ({discountInfo.code})</span>
                                            <span>-{formatPrice(discountInfo.amount)} تومان</span>
                                        </div>
                                    )}
                                    {selectedDelivery && (
                                        <div className="flex items-center justify-between text-white text-sm">
                                            <span className="text-gray-300">هزینه ارسال ({selectedDelivery.title})</span>
                                            <span>{deliveryFee === 0 ? 'رایگان' : `${formatPrice(deliveryFee)} تومان`}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-white mt-2 pt-2 border-t border-white/10">
                                        <span className="font-semibold">مبلغ نهایی</span>
                                        <span className="font-extrabold text-cherry-400">{formatPrice(finalAmount)} تومان</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div>
                            <form onSubmit={handleSubmit} className="bg-white/5 glass-card rounded-xl p-4 space-y-3 soft-shadow">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">نام و نام خانوادگی</label>
                                    <input name="name" value={form.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">شماره تماس</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="09123456789" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">آدرس کامل</label>
                                    <textarea name="address" value={form.address} onChange={handleChange} rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" required />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">نحوه ارسال</label>
                                    <div className="space-y-2">
                                        {deliveryMethods.map((dm) => (
                                            <label key={dm.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${form.delivery_method_id === dm.id ? 'border-cherry-500 bg-gradient-to-r from-cherry-500/10 to-pink-500/5 ring-1 ring-cherry-500/30' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="radio"
                                                            name="delivery_method_id"
                                                            value={dm.id}
                                                            checked={form.delivery_method_id === dm.id}
                                                            onChange={(e) => {
                                                                setForm((prev) => ({ ...prev, delivery_method_id: Number(e.target.value) }));
                                                                setSelectedDelivery(dm);
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${form.delivery_method_id === dm.id ? 'border-cherry-500' : 'border-white/30'}`}>
                                                            <div className={`w-full h-full rounded-full transition-all ${form.delivery_method_id === dm.id ? 'bg-cherry-500 scale-[0.5]' : 'bg-transparent scale-0'}`} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-white text-sm font-medium">{dm.title}</div>
                                                        {dm.fee === 0 && <div className="text-xs text-emerald-400">ارسال رایگان</div>}
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold ${dm.fee === 0 ? 'text-emerald-400' : 'text-cherry-400'}`}>
                                                    {dm.fee === 0 ? 'رایگان' : `${formatPrice(dm.fee)} تومان`}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">کد تخفیف</label>
                                    <div className="flex gap-2">
                                        <input name="discount_code" value={form.discount_code} onChange={handleChange} placeholder="کد تخفیف را وارد کنید" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                        <button type="button" onClick={applyDiscount} className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 whitespace-nowrap">اعمال</button>
                                    </div>
                                    {discountInfo && (
                                        <div className="text-xs text-green-400 mt-2">✅ کد {discountInfo.code} اعمال شد ({formatPrice(discountInfo.amount)} تومان تخفیف)</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">آپلود فیش واریزی (اختیاری)</label>
                                    <div className="space-y-2">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                            className="hidden" 
                                            id="receipt-upload"
                                        />
                                        <label 
                                            htmlFor="receipt-upload" 
                                            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5 cursor-pointer transition text-gray-300 text-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {receiptFile ? receiptFile.name : 'انتخاب فایل'}
                                        </label>
                                        {receiptPreview && (
                                            <div className="relative rounded-lg overflow-hidden border border-white/10">
                                                <img src={receiptPreview} alt="Preview" className="w-full h-auto max-h-48 object-contain bg-black/20" />
                                                <button 
                                                    type="button"
                                                    onClick={() => { setReceiptPreview(null); setReceiptFile(null); }}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition flex items-center justify-center"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" disabled={submitting} className="w-full bg-cherry-600 hover:bg-cherry-500 disabled:opacity-60 text-white rounded-lg px-4 py-2.5">
                                    {submitting ? 'در حال ثبت...' : 'ثبت سفارش'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile sticky CTA */}
            {!loading && cart.count > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/70 backdrop-blur border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xs text-gray-300">مبلغ نهایی</div>
                            <div className="text-white font-extrabold">{formatPrice(finalAmount)} تومان</div>
                        </div>
                        <button onClick={(e) => { if (!authUser) { setAuthOpen(true); return; } const formEl = document.querySelector('form'); if (formEl) formEl.requestSubmit(); }} className="flex-1 text-center bg-cherry-600 hover:bg-cherry-500 text-white rounded-lg py-2">ثبت سفارش</button>
                    </div>
                </div>
            )}

            <CheckoutAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={(user) => {
                    setAuthUser(user);
                    setForm((prev) => ({ ...prev, name: user.name || '', phone: user.phone || '', address: user.address || '' }));
                }}
            />
        </div>
    );
}

export default CheckoutPage;
