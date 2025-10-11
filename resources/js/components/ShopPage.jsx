import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

function ShopPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Initialize search query from URL
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setSearchQuery(q);
        }
    }, [searchParams]);

    // Fetch products
    const fetchProducts = useCallback(async (page = 1, query = '', append = false) => {
        setLoading(true);
        
        try {
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (page > 1) params.set('page', page);
            
            const response = await fetch(`/api/products?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            if (data.success) {
                if (append) {
                    setProducts(prev => [...prev, ...data.data]);
                } else {
                    setProducts(data.data);
                }
                setHasMorePages(data.pagination.has_more_pages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch campaigns
    const fetchCampaigns = useCallback(async () => {
        try {
            const response = await fetch('/api/campaigns/active', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setCampaigns(data.data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            if (data.success) setCategories(data.data || []);
        } catch {}
    }, []);

    // Fetch best sellers (fallback to random if not available)
    const fetchBestSellers = useCallback(async () => {
        try {
            const res = await fetch('/api/products?per_page=8&sort=random', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            if (data.success) setBestSellers(data.data || []);
        } catch {}
    }, []);

    // Load initial products and campaigns
    useEffect(() => {
        fetchProducts(1, searchQuery);
        fetchCampaigns();
        fetchCategories();
        fetchBestSellers();
    }, [fetchProducts, fetchCampaigns, fetchCategories, fetchBestSellers, searchQuery]);

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
        setProducts([]);
        
        // Update URL
        const newSearchParams = new URLSearchParams();
        if (query) newSearchParams.set('q', query);
        setSearchParams(newSearchParams);
        
        fetchProducts(1, query);
    };

    // Load more products (infinite scroll)
    const loadMore = () => {
        if (!loading && hasMorePages) {
            fetchProducts(currentPage + 1, searchQuery, true);
        }
    };

    // Handle search from URL on initial load
    useEffect(() => {
        const q = searchParams.get('q');
        if (q && q !== searchQuery) {
            setSearchQuery(q);
            fetchProducts(1, q);
        }
    }, [searchParams]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMorePages) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            observer.observe(loadMoreBtn);
        }

        return () => observer.disconnect();
    }, [loading, hasMorePages, loadMore]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Hero Section */}
            <section className="relative py-10 md:py-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-2xl glass-card soft-shadow p-5 md:p-7 border border-white/10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                                    استایل مینیمال با عطر شمال
                                </h1>
                                <p className="text-sm text-gray-300 mt-1">
                                    انتخابی هوشمندانه برای استایل روزمره
                                </p>
                            </div>
                            <div className="w-full md:w-80">
                                <SearchForm onSearch={handleSearch} initialQuery={searchQuery} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Sellers Carousel */}
            {bestSellers.length > 0 && (
                <section className="px-4 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-white font-bold text-lg mb-4">محبوب‌ترین‌ها</h2>
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none]" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {bestSellers.map((p, i) => (
                                <div key={p.id} className="snap-start w-[280px] sm:w-72 shrink-0 flex-none">
                                    <ProductCard product={p} index={i} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Carousels */}
            {categories.slice(0, 5).map((cat) => (
                <section key={cat.id} className="px-4 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold text-lg">{cat.name}</h2>
                            <button className="text-sm text-cherry-400 hover:text-cherry-300">مشاهده همه</button>
                        </div>
                        <CategoryCarousel categoryId={cat.id} />
                    </div>
                </section>
            ))}

            {/* Campaigns Banners Carousel */}
            {campaigns.length > 0 && (
                <section className="px-4 mb-10">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-white font-bold text-lg mb-4">کمپین‌ها</h2>
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none]" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {campaigns.map((campaign) => (
                                <div key={campaign.id} className="snap-start w-[320px] sm:w-96 shrink-0 flex-none">
                                    <BannerCard campaign={campaign} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products Grid */}
            <section className="px-4">
                <div className="max-w-7xl mx-auto">
                    {loading && products.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-white mb-2">محصولی یافت نشد</h3>
                            <p className="text-gray-400 mb-4">
                                متأسفانه محصولی با این کلمات پیدا نشد
                            </p>
                            <button
                                onClick={() => handleSearch('')}
                                className="bg-cherry-600 hover:bg-cherry-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                پاک کردن جستجو
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* Load More Button */}
                            {hasMorePages && (
                                <div id="load-more-container" className="text-center mt-8">
                                    <button
                                        id="load-more-btn"
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="bg-cherry-600 hover:bg-cherry-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <LoadingSpinner size="sm" />
                                                <span>در حال بارگذاری...</span>
                                            </span>
                                        ) : (
                                            'مشاهده بیشتر'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

// Search Form Component
function SearchForm({ onSearch, initialQuery }) {
    const [query, setQuery] = useState(initialQuery);
    const [timeoutId, setTimeoutId] = useState(null);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        
        // Clear existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Set new timeout for search
        const newTimeoutId = setTimeout(() => {
            onSearch(value);
        }, 500);
        
        setTimeoutId(newTimeoutId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="جستجوی محصول، مثل: دستبند نقره"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cherry-600 text-white"
            />
        </form>
    );
}

// Campaign Card Component
function CampaignCard({ campaign }) {
    return (
        <div className="bg-gradient-to-r from-cherry-600/20 to-pink-600/20 border border-cherry-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                <span className="bg-cherry-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {campaign.discount_percentage}% تخفیف
                </span>
            </div>
            {campaign.description && (
                <p className="text-gray-300 text-sm mb-4">{campaign.description}</p>
            )}
            <div className="text-xs text-gray-400">
                تا {new Date(campaign.ends_at).toLocaleDateString('fa-IR')}
            </div>
        </div>
    );
}

export default ShopPage;

// Category carousel that fetches products by category
function CategoryCarousel({ categoryId }) {
    const [items, setItems] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/products?per_page=10&category_id=${categoryId}`, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                if (data.success) setItems(data.data || []);
            } catch {}
        })();
    }, [categoryId]);
    return (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none]" style={{ WebkitOverflowScrolling: 'touch' }}>
            {items.map((p, i) => (
                <div key={p.id} className="snap-start w-[280px] sm:w-72 shrink-0 flex-none">
                    <ProductCard product={p} index={i} />
                </div>
            ))}
        </div>
    );
}

function BannerCard({ campaign }) {
    return (
        <div className="rounded-2xl overflow-hidden glass-card soft-shadow border border-white/10">
            <div className="h-36 bg-gradient-to-r from-cherry-600/30 to-pink-600/30 flex items-center justify-center text-white font-bold text-center px-4">
                {campaign.name}
            </div>
            {campaign.description && (
                <div className="p-3 text-gray-300 text-sm">{campaign.description}</div>
            )}
        </div>
    );
}
