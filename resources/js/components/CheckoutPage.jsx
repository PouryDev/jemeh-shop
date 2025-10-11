import React from 'react';
import CheckoutAuthModal from './CheckoutAuthModal';

function CheckoutPage() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [cart, setCart] = React.useState({ items: [], total: 0, count: 0 });
    const [form, setForm] = React.useState({ name: '', phone: '', address: '', discount_code: '' });
    const [submitting, setSubmitting] = React.useState(false);
    const [discountInfo, setDiscountInfo] = React.useState(null);

    const formatPrice = (v) => {
        try { return Number(v || 0).toLocaleString('fa-IR'); } catch { return v; }
    };

    const [authUser, setAuthUser] = React.useState(null);
    const [authOpen, setAuthOpen] = React.useState(false);

        React.useEffect(() => {
        // Try to fetch current user; if using Sanctum, this requires cookie session
        fetch('/api/auth/user', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((data) => {
                if (data?.success && data?.data) {
                    setAuthUser(data.data);
                    setForm((prev) => ({
                        ...prev,
                        name: data.data.name || '',
                        phone: data.data.phone || '',
                        address: data.data.address || '',
                    }));
                }
            })
            .catch(() => {
                setAuthUser(null);
            });
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
    }, [fetchCart]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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
            const res = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    customer_name: form.name,
                    customer_phone: form.phone,
                    customer_address: form.address,
                    discount_code: form.discount_code || undefined,
                }),
            });
            if (!res.ok) throw new Error('failed');
            // expect redirect URL or success
            window.location.href = '/thanks/last';
        } catch (e) {
            setError('ثبت سفارش با خطا مواجه شد');
        } finally {
            setSubmitting(false);
        }
    }

    const finalAmount = React.useMemo(() => {
        if (!discountInfo) return cart.total;
        return Math.max(0, cart.total - (discountInfo.amount || 0));
    }, [cart.total, discountInfo]);

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
                                <div className="p-4">
                                    <div className="flex items-center justify-between text-white mb-1">
                                        <span className="text-sm text-gray-300">جمع کل</span>
                                        <span className="font-extrabold">{formatPrice(cart.total)} تومان</span>
                                    </div>
                                    {discountInfo && (
                                        <div className="flex items-center justify-between text-green-400 text-sm mb-1">
                                            <span>تخفیف ({discountInfo.code})</span>
                                            <span>-{formatPrice(discountInfo.amount)} تومان</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-white mt-2">
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
                                    <label className="block text-sm text-gray-300 mb-1">آپلود فیش واریزی (اختیاری)</label>
                                    <input type="file" accept="image/*" className="block w-full text-sm text-gray-300" />
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
