import React, { useState } from 'react';
import ProductModal from './ProductModal';
import { apiRequest } from '../utils/sanctumAuth';
import { useCart } from '../contexts/CartContext';

function ProductCard({ product, index }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { getProductQuantity } = useCart();

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    function formatPriceFa(value) {
        try { return Number(value || 0).toLocaleString('fa-IR'); } catch { return value; }
    }

    const qtyInCart = getProductQuantity(product.id);

    const increment = async (e) => {
        e.stopPropagation();
        
        // If product has variants, open modal instead of direct add to cart
        if (product.has_variants || product.has_colors || product.has_sizes) {
            setIsModalOpen(true);
            return;
        }
        
        try {
            const response = await apiRequest(`/api/cart/add/${product.slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: 1 })
            });
            if (!response.ok) throw new Error('failed');
            const data = await response.json();
            if (data && data.ok) {
                window.dispatchEvent(new Event('cart:update'));
                window.dispatchEvent(new CustomEvent('toast:show', { detail: { type: 'success', message: 'به سبد اضافه شد' } }));
                // Don't call refreshQtyFromAPI() here - let the cart:update event handle it
            }
        } catch (err) {
            console.error(err);
        }
    };

    const decrement = async (e) => {
        e.stopPropagation();
        try {
            // Fetch current cart to identify exact cart_key and quantity
            const summary = await apiRequest('/api/cart/json');
            if (!summary.ok) throw new Error('failed');
            const payload = await summary.json();
            const items = payload.items || [];
            const target = items.find((it) => String(it.product?.id) === String(product.id));
            if (!target) return; // nothing to do

            // Remove the current key completely
            const removeRes = await apiRequest(`/api/cart/remove/${encodeURIComponent(target.key)}`, {
                method: 'DELETE'
            });
            if (!removeRes.ok) throw new Error('failed');
            let state = await removeRes.json();
            // Re-add with quantity - 1 if still >= 1
            if ((target.quantity || 0) - 1 > 0) {
                const addRes = await apiRequest(`/api/cart/add/${product.slug}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: (target.quantity - 1) })
                });
                if (!addRes.ok) throw new Error('failed');
                state = await addRes.json();
            }
            if (state && state.ok) {
                window.dispatchEvent(new Event('cart:update'));
                // Don't call refreshQtyFromAPI() here - let the cart:update event handle it
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div
                className={`product-card group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 glass-card hover-lift soft-shadow opacity-0 translate-y-4 transition-all duration-500 ease-out ${
                    isHovered ? 'border-cherry-500/30' : ''
                }`}
                style={{ 
                    animationDelay: `${index * 100}ms`,
                    opacity: 1,
                    transform: 'translateY(0)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleCardClick}
            >
            {/* Campaign Badge */}
            {product.campaigns && product.campaigns.length > 0 && (
                <div className="absolute top-2 left-2 z-20">
                    <span className="px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-cherry-600/90 to-pink-600/90 text-white ring-1 ring-white/20 shadow">
                        {product.campaigns[0].badge_text || `${product.campaigns[0].discount_value}% تخفیف`}
                    </span>
                </div>
            )}

            {/* Product Image */}
            <div className="relative bg-black/20">
                <img
                    src={/^https?:\/\//i.test(product.images?.[0]?.path) ? product.images[0].path : (product.images?.[0]?.path ? `/storage/${product.images[0].path}` : '/images/placeholder.jpg')}
                    alt={product.title}
                    className="w-full aspect-square object-cover transition duration-300 group-hover:scale-[1.02]"
                    onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                    }}
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                {/* Qty Controls - overlay on image bottom-right */}
                <div className="absolute bottom-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur rounded-full px-1.5 py-1 border border-white/10">
                        <button onClick={decrement} className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-white text-xs">−</button>
                        <div className="min-w-[28px] text-center text-white text-[11px] bg-black/20 rounded px-1 py-0.5">
                            {formatPriceFa(qtyInCart || 0)}
                        </div>
                        <button onClick={increment} className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cherry-600 to-pink-600 hover:from-cherry-500 hover:to-pink-500 text-white text-xs">+</button>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-3 md:p-3">
                <h3 className="font-semibold text-[13px] md:text-base text-white line-clamp-2 min-h-[36px]">
                    {product.title}
                </h3>
                {/* Price Section */}
                <div className="mt-1 flex items-center gap-2">
                    {product.campaigns && product.campaigns.length > 0 ? (
                        <>
                            <span className="text-gray-400 text-xs line-through">
                                {formatPriceFa(product.price)} تومان
                            </span>
                            <span className="text-cherry-400 text-sm font-bold">
                                {formatPriceFa(Math.round(product.price * (1 - product.campaigns[0].discount_value / 100)))} تومان
                            </span>
                        </>
                    ) : (
                        <span className="text-cherry-400 text-sm font-bold">
                            {formatPriceFa(product.price)} تومان
                        </span>
                    )}
                </div>
            </div>

            {/* Qty Controls moved into image overlay to avoid overlapping price on mobile */}
            </div>
            
            {/* Product Modal */}
            <ProductModal 
                product={product} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}

export default ProductCard;
