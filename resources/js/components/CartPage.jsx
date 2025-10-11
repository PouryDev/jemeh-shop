import React from 'react';
import { Link } from 'react-router-dom';

function CartPage() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [items, setItems] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [removingKey, setRemovingKey] = React.useState(null);

    const fetchCart = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/cart/json', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || 0);
            setCount(data.count || 0);
        } catch (e) {
            setError('خطا در دریافت سبد خرید');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    async function handleRemove(cartKey) {
        setRemovingKey(cartKey);
        try {
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const res = await fetch(`/cart/remove/${encodeURIComponent(cartKey)}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || 0);
            setCount(data.count || 0);
            try { localStorage.setItem('cart', JSON.stringify(data.items || [])); } catch {}
            window.dispatchEvent(new Event('cart:update'));
        } catch (e) {
            // noop: keep current state, could show toast
        } finally {
            setRemovingKey(null);
        }
    }

    async function decrementItem(item) {
        setRemovingKey(item.cart_key);
        try {
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const removeRes = await fetch(`/cart/remove/${encodeURIComponent(item.cart_key)}`, {
                method: 'DELETE', headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': token }, credentials: 'same-origin'
            });
            if (!removeRes.ok) throw new Error('failed');
            let state = await removeRes.json();
            if ((item.quantity || 0) - 1 > 0) {
                const addRes = await fetch(`/cart/add/${item.slug}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token }, credentials: 'same-origin', body: JSON.stringify({ quantity: (item.quantity - 1) })
                });
                if (!addRes.ok) throw new Error('failed');
                state = await addRes.json();
            }
            setItems(state.items || []);
            setTotal(state.total || 0);
            setCount(state.count || 0);
            try { localStorage.setItem('cart', JSON.stringify(state.items || [])); } catch {}
            window.dispatchEvent(new Event('cart:update'));
        } catch (e) {
        } finally {
            setRemovingKey(null);
        }
    }

    async function incrementItem(item) {
        setRemovingKey(item.cart_key);
        try {
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const res = await fetch(`/cart/add/${item.slug}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token }, credentials: 'same-origin', body: JSON.stringify({ quantity: 1 })
            });
            if (!res.ok) throw new Error('failed');
            const state = await res.json();
            setItems(state.items || []);
            setTotal(state.total || 0);
            setCount(state.count || 0);
            try { localStorage.setItem('cart', JSON.stringify(state.items || [])); } catch {}
            window.dispatchEvent(new Event('cart:update'));
        } catch (e) {
        } finally {
            setRemovingKey(null);
        }
    }

    function formatPrice(value) {
        try { return Number(value || 0).toLocaleString('fa-IR'); } catch { return value; }
    }

    return (
        <div className="min-h-screen pb-28 md:pb-8 pt-6 md:pt-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">سبد خرید</h1>

                {loading ? (
                    <div className="text-gray-300">در حال بارگذاری...</div>
                ) : error ? (
                    <div className="text-red-400">{error}</div>
                ) : count === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-gray-300 text-center">
                        سبد خرید خالی است.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="lg:col-span-2 bg-white/5 glass-card rounded-xl divide-y divide-white/10 soft-shadow">
                            {items.map((item) => (
                                <div key={item.cart_key} className="p-3 md:p-4">
                                    <div className="flex items-start gap-3 md:gap-4">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">🛍️</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <div className="font-semibold md:font-bold text-white">{item.title}</div>
                                                    {item.variant_display_name && (
                                                        <div className="text-xs text-gray-300 mt-0.5">{item.variant_display_name}</div>
                                                    )}
                                                    <div className="text-xs text-cherry-400 mt-1">{formatPrice(item.price)} تومان</div>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="inline-flex items-center gap-1 bg-black/30 border border-white/10 rounded-full px-1.5 py-1">
                                                        <button onClick={() => decrementItem(item)} disabled={removingKey === item.cart_key} className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">−</button>
                                                        <div className="min-w-[28px] text-center text-white text-[11px] bg-black/20 rounded px-1 py-0.5">{item.quantity}</div>
                                                        <button onClick={() => incrementItem(item)} disabled={removingKey === item.cart_key} className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cherry-600 to-pink-600 hover:from-cherry-500 hover:to-pink-500 text-white text-xs">+</button>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="font-extrabold text-white text-sm md:text-base whitespace-nowrap">{formatPrice(item.total)} <span className="text-xs text-gray-300">تومان</span></div>
                                                        <button
                                                            onClick={() => handleRemove(item.cart_key)}
                                                            disabled={removingKey === item.cart_key}
                                                            className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-50 transition flex-shrink-0"
                                                            aria-label="حذف"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sticky top-20">
                                <div className="flex items-center justify-between text-white mb-2">
                                    <span>تعداد</span>
                                    <span>{count}</span>
                                </div>
                                <div className="flex items-center justify-between text-white font-extrabold">
                                    <span>جمع</span>
                                    <span className="text-cherry-400">{formatPrice(total)} تومان</span>
                                </div>
                                <Link to="/checkout" className="mt-4 w-full inline-flex items-center justify-center bg-cherry-600 hover:bg-cherry-500 text-white rounded-lg px-4 py-2.5">ادامه خرید</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Checkout Bar */}
            {count > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/70 backdrop-blur border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xs text-gray-300">جمع</div>
                            <div className="text-white font-extrabold">{formatPrice(total)} تومان</div>
                        </div>
                        <Link to="/checkout" className="flex-1 text-center bg-cherry-600 hover:bg-cherry-500 text-white rounded-lg py-2">ادامه خرید</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;
