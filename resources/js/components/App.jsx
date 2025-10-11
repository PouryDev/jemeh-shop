import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShopPage from './ShopPage';
import ProductPage from './ProductPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminCampaigns from './admin/AdminCampaigns';
import AdminDiscountCodes from './admin/AdminDiscountCodes';
import AdminCategories from './admin/AdminCategories';
import AdminProductVariants from './admin/AdminProductVariants';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';
import AccountLayout from './account/AccountLayout';
import AccountProfile from './account/AccountProfile';
import AccountOrders from './account/AccountOrders';
import AccountAddresses from './account/AccountAddresses';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import Layout from './Layout';
import NotFound from './NotFound';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    {/* Shop Routes */}
                    <Route path="/" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductPage />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Account Routes */}
                    <Route path="/account" element={<AccountLayout />}>
                        <Route index element={<AccountProfile />} />
                        <Route path="orders" element={<AccountOrders />} />
                        <Route path="addresses" element={<AccountAddresses />} />
                    </Route>
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="campaigns" element={<AdminCampaigns />} />
                        <Route path="discount-codes" element={<AdminDiscountCodes />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="product-variants" element={<AdminProductVariants />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="reports" element={<AdminReports />} />
                    </Route>
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
