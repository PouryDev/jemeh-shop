import React from 'react';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-white mb-8">پنل مدیریت</h1>
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;
