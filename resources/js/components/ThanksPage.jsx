import React from 'react';
import { Link, useParams } from 'react-router-dom';

function ThanksPage() {
    const { invoiceId } = useParams();

    return (
        <div className="min-h-screen py-12 text-center">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white/5 glass-card rounded-2xl p-6 md:p-8 border border-white/10 soft-shadow">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">سفارش شما ثبت شد</h1>
                    <p className="text-gray-300 mb-6">
                        با تشکر از خرید شما. سفارش شما با موفقیت ثبت شد و به زودی پردازش می‌شود.
                    </p>
                    {invoiceId && invoiceId !== 'last' && (
                        <div className="bg-black/20 rounded-lg p-4 mb-6">
                            <div className="text-sm text-gray-400">شماره فاکتور</div>
                            <div className="text-cherry-400 font-bold">{invoiceId}</div>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/" className="inline-block bg-cherry-600 hover:bg-cherry-500 text-white rounded-lg px-6 py-2.5">بازگشت به صفحه اصلی</Link>
                        <Link to="/account/orders" className="inline-block bg-white/10 hover:bg-white/15 text-white rounded-lg px-6 py-2.5">مشاهده سفارش‌ها</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThanksPage;

