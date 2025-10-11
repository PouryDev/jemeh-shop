import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="min-h-screen py-20 text-center text-white">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-7xl mb-4">404</div>
                <h1 className="text-2xl font-bold mb-2">صفحه مورد نظر پیدا نشد</h1>
                <p className="text-gray-300 mb-6">ممکن است آدرس تغییر کرده یا صفحه حذف شده باشد.</p>
                <Link to="/" className="bg-cherry-600 hover:bg-cherry-500 text-white px-6 py-3 rounded-lg">بازگشت به صفحه اصلی</Link>
            </div>
        </div>
    );
}

export default NotFound;


