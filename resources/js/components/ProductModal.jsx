import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/csrfToken';

function ProductModal({ product, isOpen, onClose }) {
    const navigate = useNavigate();
    const [mainImage, setMainImage] = useState(null);
    const [selectedColorId, setSelectedColorId] = useState(null);
    const [selectedSizeId, setSelectedSizeId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [addStatus, setAddStatus] = useState(null);
    const [displayPrice, setDisplayPrice] = useState(null);
    const [fullProduct, setFullProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            fetchProductDetails();
        }
    }, [isOpen, product]);

    async function fetchProductDetails() {
        if (!product?.slug) return;
        
        setLoading(true);
        try {
            const response = await apiRequest(`/api/products/${product.slug}`);
            
            if (response.ok) {
                const responseData = await response.json();
                const data = responseData.data || responseData;
                setFullProduct(data);
                
                // Set initial image
                const firstImage = data?.images?.[0]?.path ? resolveImageUrl(data.images[0].path) : null;
                setMainImage(firstImage);
                
                // Reset selections
                setSelectedColorId(null);
                setSelectedSizeId(null);
                
                // Set initial selections after a brief delay
                setTimeout(() => {
                    if (data?.has_colors) {
                        const availableColors = getAvailableColors(data);
                        if (availableColors.length > 0) {
                            setSelectedColorId(availableColors[0].id);
                        }
                    }
                    if (data?.has_sizes) {
                        const availableSizes = getAvailableSizes(data);
                        if (availableSizes.length > 0) {
                            setSelectedSizeId(availableSizes[0].id);
                        }
                    }
                    
                    // Update price after setting initial selections
                    setTimeout(() => {
                        updatePrice();
                    }, 50);
                }, 100);
                
                setQuantity(1);
                setAddStatus(null);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            // Fallback to basic product data
            setFullProduct(product);
            const firstImage = product?.images?.[0]?.path ? resolveImageUrl(product.images[0].path) : null;
            setMainImage(firstImage);
            setDisplayPrice(product.price);
        } finally {
            setLoading(false);
        }
    }

    function resolveImageUrl(path) {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        if (path.startsWith('/')) path = path.slice(1);
        return `/storage/${path}`;
    }


    function getAvailableVariants() {
        if (!product?.activeVariants) return [];
        return product.activeVariants.filter(v => {
            if (product.has_colors && selectedColorId && v.color_id !== selectedColorId) return false;
            if (product.has_sizes && selectedSizeId && v.size_id !== selectedSizeId) return false;
            return true;
        });
    }

    function getSelectedVariant() {
        const currentProduct = fullProduct || product;
        if (!currentProduct?.active_variants) return null;
        
        // Find exact variant match
        const variant = currentProduct.active_variants.find(v => {
            const colorMatch = !currentProduct.has_colors || !selectedColorId || String(v.color_id) === String(selectedColorId);
            const sizeMatch = !currentProduct.has_sizes || !selectedSizeId || String(v.size_id) === String(selectedSizeId);
            
            return colorMatch && sizeMatch;
        });
        
        return variant;
    }

    function getAvailableColors(productData = null) {
        const currentProduct = productData || fullProduct || product;
        
        // Use available_colors attribute if available (like in product details page)
        if (currentProduct?.available_colors) {
            return currentProduct.available_colors;
        }
        
        // Fallback to extracting from active_variants
        if (!currentProduct?.active_variants) return [];
        const colors = new Map();
        
        currentProduct.active_variants.forEach(variant => {
            if (variant.color && !colors.has(variant.color.id)) {
                colors.set(variant.color.id, variant.color);
            }
        });
        
        return Array.from(colors.values());
    }

    function getAvailableSizes(productData = null) {
        const currentProduct = productData || fullProduct || product;
        
        // Use available_sizes attribute if available (like in product details page)
        if (currentProduct?.available_sizes) {
            return currentProduct.available_sizes;
        }
        
        // Fallback to extracting from active_variants
        if (!currentProduct?.active_variants) return [];
        const sizes = new Map();
        
        currentProduct.active_variants.forEach(variant => {
            if (variant.size && !sizes.has(variant.size.id)) {
                sizes.set(variant.size.id, variant.size);
            }
        });
        
        return Array.from(sizes.values());
    }

    function updatePrice() {
        const currentProduct = fullProduct || product;
        const variant = getSelectedVariant();
        
        if (variant && variant.price) {
            setDisplayPrice(variant.price);
        } else {
            setDisplayPrice(currentProduct.price);
        }
    }

    useEffect(() => {
        updatePrice();
    }, [selectedColorId, selectedSizeId, fullProduct]);

    // Update price when selections change
    useEffect(() => {
        updatePrice();
    }, [selectedColorId, selectedSizeId]);

    function formatPrice(price) {
        try {
            return Number(price || 0).toLocaleString('fa-IR');
        } catch {
            return price;
        }
    }

    function getStockCount() {
        const currentProduct = fullProduct || product;
        const variant = getSelectedVariant();
        if (variant) return variant.stock;
        return currentProduct.stock;
    }

    function getMaxQuantity() {
        const stock = getStockCount();
        return Math.min(stock, 10);
    }

    async function addToCart() {
        if (adding) return;
        
        setAdding(true);
        setAddStatus(null);
        
        try {
            const currentProduct = fullProduct || product;
            const variant = getSelectedVariant();
            
            // Always use product slug for the URL
            const url = `/cart/add/${currentProduct.slug}`;
            
            // Prepare request body with variant info
            const requestBody = {
                quantity,
                color_id: selectedColorId || null,
                size_id: selectedSizeId || null
            };
            
            const response = await apiRequest(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.success || data.ok) {
                setAddStatus('success');
                // Update cart count
                window.dispatchEvent(new CustomEvent('cart:update'));
                // Show toast
                try {
                    window.showToast('به سبد افزوده شد');
                } catch {}
                
                setTimeout(() => {
                    setAddStatus(null);
                }, 2000);
            } else {
                setAddStatus('error');
                setTimeout(() => {
                    setAddStatus(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            setAddStatus('error');
            setTimeout(() => {
                setAddStatus(null);
            }, 3000);
        } finally {
            setAdding(false);
        }
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            onClose();
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const currentProduct = fullProduct || product;
    const stock = getStockCount();
    const maxQuantity = getMaxQuantity();
    const isOutOfStock = stock <= 0;

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Modal */}
            <div className="relative w-full max-w-md md:max-w-2xl h-[90vh] md:h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-white truncate px-2">{product.title}</h2>
                    <div className="w-9" /> {/* Spacer */}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-2 border-cherry-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-gray-400">در حال بارگذاری...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Images */}
                            <div className="relative">
                        <div className="aspect-square bg-gray-800">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={currentProduct.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        {/* Image Gallery */}
                        {currentProduct.images && currentProduct.images.length > 1 && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex gap-2 overflow-x-auto">
                                    {currentProduct.images.slice(0, 5).map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setMainImage(resolveImageUrl(img.path))}
                                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 ${
                                                mainImage === resolveImageUrl(img.path) 
                                                    ? 'border-cherry-500' 
                                                    : 'border-white/20'
                                            }`}
                                        >
                                            <img
                                                src={resolveImageUrl(img.path)}
                                                alt={`${currentProduct.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-4">
                        {/* Title & Price */}
                        <div>
                            <h1 className="text-xl font-bold text-white mb-2">{currentProduct.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-cherry-400">
                                    {formatPrice(displayPrice)} تومان
                                </span>
                                {currentProduct.campaigns && currentProduct.campaigns.length > 0 && (
                                    <span className="bg-cherry-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                                        تخفیف ویژه
                                    </span>
                                )}
                                {getSelectedVariant() && getSelectedVariant().price !== currentProduct.price && (
                                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                                        قیمت متغیر
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {currentProduct.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 mb-2">توضیحات</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{currentProduct.description}</p>
                            </div>
                        )}

                        {/* Colors */}
                        {currentProduct.has_colors && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                                    رنگ {selectedColorId && `(${getAvailableColors().find(c => c.id === selectedColorId)?.name})`}
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {getAvailableColors().map(color => (
                                        <button
                                            key={color.id}
                                            onClick={() => setSelectedColorId(color.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                                selectedColorId === color.id
                                                    ? 'bg-cherry-600 text-white border-cherry-500'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border-white/20'
                                            }`}
                                        >
                                            {color.hex_code && (
                                                <div 
                                                    className="w-4 h-4 rounded-full border border-white/20" 
                                                    style={{ backgroundColor: color.hex_code }}
                                                />
                                            )}
                                            <span>{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {currentProduct.has_sizes && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                                    سایز {selectedSizeId && `(${getAvailableSizes().find(s => s.id === selectedSizeId)?.name})`}
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {getAvailableSizes().map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSizeId(size.id)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                                selectedSizeId === size.id
                                                    ? 'bg-cherry-600 text-white border-cherry-500'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border-white/20'
                                            }`}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Info */}
                        <div className="text-sm text-gray-400">
                            {isOutOfStock ? (
                                <span className="text-red-400">ناموجود</span>
                            ) : (
                                <span>{stock} عدد موجود</span>
                            )}
                        </div>
                    </div>
                        </>
                    )}
                </div>

                {/* Footer - Add to Cart */}
                <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        {/* Quantity */}
                        <div className="flex items-center bg-white/10 rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="px-3 py-2 text-white font-medium min-w-[3rem] text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                disabled={quantity >= maxQuantity}
                                className="p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={addToCart}
                            disabled={adding || isOutOfStock}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                                addStatus === 'success'
                                    ? 'bg-green-600 text-white'
                                    : addStatus === 'error'
                                    ? 'bg-red-600 text-white'
                                    : isOutOfStock
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-cherry-600 hover:bg-cherry-700 text-white'
                            }`}
                        >
                            {adding ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    در حال افزودن...
                                </span>
                            ) : addStatus === 'success' ? (
                                'افزوده شد!'
                            ) : addStatus === 'error' ? (
                                'خطا! دوباره تلاش کنید'
                            ) : isOutOfStock ? (
                                'ناموجود'
                            ) : (
                                'افزودن به سبد'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductModal;
