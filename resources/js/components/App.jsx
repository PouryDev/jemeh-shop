import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { MerchantProvider, useMerchant } from '../contexts/MerchantContext';
import ShopPage from './ShopPage';
import ProductsPage from './ProductsPage';
import ProductPage from './ProductPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminProductManagement from './admin/AdminProductManagement';
import AdminProductForm from './admin/AdminProductForm';
import AdminOrderManagement from './admin/AdminOrderManagement';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminDeliveryManagement from './admin/AdminDeliveryManagement';
import AdminCampaignManagement from './admin/AdminCampaignManagement';
import AdminCampaignForm from './admin/AdminCampaignForm';
import AdminDiscountManagement from './admin/AdminDiscountManagement';
import AdminDiscountForm from './admin/AdminDiscountForm';
import AdminHeroSlideManagement from './admin/AdminHeroSlideManagement';
import AdminHeroSlideForm from './admin/AdminHeroSlideForm';
import AdminPaymentGateways from './admin/AdminPaymentGateways';
import AdminCategoryManagement from './admin/AdminCategoryManagement';
import AdminCategoryForm from './admin/AdminCategoryForm';
import AdminMerchantSettings from './admin/AdminMerchantSettings';
import AccountLayout from './account/AccountLayout';
import AccountProfile from './account/AccountProfile';
import AccountOrders from './account/AccountOrders';
import AccountAddresses from './account/AccountAddresses';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import Layout from './Layout';
import NotFound from './NotFound';
import CategoryPage from './CategoryPage';
import CategoriesPage from './CategoriesPage';
import ThanksPage from './ThanksPage';
import PaymentErrorPage from './PaymentErrorPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import ShippingPage from './ShippingPage';
import ReturnsPage from './ReturnsPage';
import LandingPage from './LandingPage';
import MerchantDashboard from './MerchantDashboard';
import SubscriptionManagement from './SubscriptionManagement';
import CommissionManagement from './admin/CommissionManagement';
import MerchantManagement from './admin/MerchantManagement';
import { initTheme } from '../utils/themeLoader';

function AppContent() {
    const { merchantId, merchantData, loading, isMerchantDetected } = useMerchant();
    const location = useLocation();

    useEffect(() => {
        // Initialize theme when merchant is loaded
        if (!loading) {
            initTheme();
        }
    }, [loading, merchantData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cherry-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    // Always show landing page for root path (/landing)
    if (location.pathname === '/landing' || location.pathname.startsWith('/landing/')) {
        return (
            <HelmetProvider>
                <Routes>
                    <Route path="/landing/*" element={<LandingPage />} />
                </Routes>
            </HelmetProvider>
        );
    }

    // Show landing page if no merchant detected and not on a merchant route
    if (!isMerchantDetected && !location.pathname.startsWith('/landing')) {
        // Check if we're on a route that might have merchantId
        const pathParts = location.pathname.split('/').filter(Boolean);
        const hasMerchantRoute = pathParts.length > 0 && 
            !['landing', 'admin', 'account', 'merchant', 'subscription'].includes(pathParts[0]);
        
        // If no merchant detected and not a potential merchant route, show landing
        if (!hasMerchantRoute) {
            return (
                <HelmetProvider>
                    <Routes>
                        <Route path="/*" element={<LandingPage />} />
                    </Routes>
                </HelmetProvider>
            );
        }
    }

    // Show shop for detected merchant or routes with merchantId parameter
    return (
        <HelmetProvider>
            <AuthProvider>
                <CartProvider>
                    <Layout>
                        <Routes>
                        {/* Shop Routes with merchantId parameter (optional for backward compatibility) */}
                        <Route path="/:merchantId/shop" element={<ShopPage />} />
                        <Route path="/:merchantId/products" element={<ProductsPage />} />
                        <Route path="/:merchantId/product/:slug" element={<ProductPage />} />
                        <Route path="/:merchantId/category/:id" element={<CategoryPage />} />
                        <Route path="/:merchantId/categories" element={<CategoriesPage />} />
                        <Route path="/:merchantId/404" element={<NotFound />} />
                        <Route path="/:merchantId/cart" element={<CartPage />} />
                        <Route path="/:merchantId/checkout" element={<CheckoutPage />} />
                        <Route path="/:merchantId/thanks/:invoiceId" element={<ThanksPage />} />
                        <Route path="/:merchantId/payment/error" element={<PaymentErrorPage />} />
                        
                        {/* Static Pages with merchantId */}
                        <Route path="/:merchantId/about" element={<AboutPage />} />
                        <Route path="/:merchantId/contact" element={<ContactPage />} />
                        <Route path="/:merchantId/shipping" element={<ShippingPage />} />
                        <Route path="/:merchantId/returns" element={<ReturnsPage />} />
                        
                        {/* Auth Routes with merchantId */}
                        <Route path="/:merchantId/login" element={<LoginPage />} />
                        <Route path="/:merchantId/register" element={<RegisterPage />} />
                        
                        {/* Merchant Dashboard */}
                        <Route path="/:merchantId/merchant" element={<MerchantDashboard />} />
                        <Route path="/:merchantId/subscription" element={<SubscriptionManagement />} />
                        
                        {/* Account Routes with merchantId */}
                        <Route path="/:merchantId/account" element={<AccountLayout />}>
                            <Route index element={<AccountProfile />} />
                            <Route path="profile" element={<AccountProfile />} />
                            <Route path="orders" element={<AccountOrders />} />
                            <Route path="addresses" element={<AccountAddresses />} />
                        </Route>
                        
                        {/* Admin Routes with merchantId */}
                        <Route path="/:merchantId/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="products" element={<AdminProductManagement />} />
                            <Route path="products/create" element={<AdminProductForm />} />
                            <Route path="products/:id/edit" element={<AdminProductForm />} />
                            <Route path="orders" element={<AdminOrderManagement />} />
                            <Route path="orders/:id" element={<AdminOrderDetail />} />
                            <Route path="delivery" element={<AdminDeliveryManagement />} />
                            <Route path="campaigns" element={<AdminCampaignManagement />} />
                            <Route path="campaigns/create" element={<AdminCampaignForm />} />
                            <Route path="campaigns/:id/edit" element={<AdminCampaignForm />} />
                            <Route path="discounts" element={<AdminDiscountManagement />} />
                            <Route path="discounts/create" element={<AdminDiscountForm />} />
                            <Route path="discounts/:id/edit" element={<AdminDiscountForm />} />
                            <Route path="hero-slides" element={<AdminHeroSlideManagement />} />
                            <Route path="hero-slides/create" element={<AdminHeroSlideForm />} />
                            <Route path="hero-slides/:id/edit" element={<AdminHeroSlideForm />} />
                            <Route path="payment-gateways" element={<AdminPaymentGateways />} />
                            <Route path="categories" element={<AdminCategoryManagement />} />
                            <Route path="categories/create" element={<AdminCategoryForm />} />
                            <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
                            <Route path="settings" element={<AdminMerchantSettings />} />
                            <Route path="merchants" element={<MerchantManagement />} />
                            <Route path="commissions" element={<CommissionManagement />} />
                        </Route>
                        
                        {/* Fallback routes without merchantId (for backward compatibility and redirects) */}
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:slug" element={<ProductPage />} />
                        <Route path="/category/:id" element={<CategoryPage />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/thanks/:invoiceId" element={<ThanksPage />} />
                        <Route path="/payment/error" element={<PaymentErrorPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/shipping" element={<ShippingPage />} />
                        <Route path="/returns" element={<ReturnsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/merchant" element={<MerchantDashboard />} />
                        <Route path="/subscription" element={<SubscriptionManagement />} />
                        <Route path="/account" element={<AccountLayout />}>
                            <Route index element={<AccountProfile />} />
                            <Route path="profile" element={<AccountProfile />} />
                            <Route path="orders" element={<AccountOrders />} />
                            <Route path="addresses" element={<AccountAddresses />} />
                        </Route>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="products" element={<AdminProductManagement />} />
                            <Route path="products/create" element={<AdminProductForm />} />
                            <Route path="products/:id/edit" element={<AdminProductForm />} />
                            <Route path="orders" element={<AdminOrderManagement />} />
                            <Route path="orders/:id" element={<AdminOrderDetail />} />
                            <Route path="delivery" element={<AdminDeliveryManagement />} />
                            <Route path="campaigns" element={<AdminCampaignManagement />} />
                            <Route path="campaigns/create" element={<AdminCampaignForm />} />
                            <Route path="campaigns/:id/edit" element={<AdminCampaignForm />} />
                            <Route path="discounts" element={<AdminDiscountManagement />} />
                            <Route path="discounts/create" element={<AdminDiscountForm />} />
                            <Route path="discounts/:id/edit" element={<AdminDiscountForm />} />
                            <Route path="hero-slides" element={<AdminHeroSlideManagement />} />
                            <Route path="hero-slides/create" element={<AdminHeroSlideForm />} />
                            <Route path="hero-slides/:id/edit" element={<AdminHeroSlideForm />} />
                            <Route path="payment-gateways" element={<AdminPaymentGateways />} />
                            <Route path="categories" element={<AdminCategoryManagement />} />
                            <Route path="categories/create" element={<AdminCategoryForm />} />
                            <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
                            <Route path="settings" element={<AdminMerchantSettings />} />
                            <Route path="merchants" element={<MerchantManagement />} />
                            <Route path="commissions" element={<CommissionManagement />} />
                        </Route>
                        </Routes>
                    </Layout>
                </CartProvider>
            </AuthProvider>
        </HelmetProvider>
    );
}

function App() {
    return (
        <Router>
            <MerchantProvider>
                <AppContent />
            </MerchantProvider>
        </Router>
    );
}

export default App;