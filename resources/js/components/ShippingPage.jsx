import React from 'react';
import { useSeo } from '../hooks/useSeo';

function ShippingPage(){
    useSeo({
        title: 'ارسال و تحویل - فروشگاه جمه',
        description: 'قوانین و زمان‌بندی ارسال سفارش، هزینه ارسال، مناطق پوشش‌دهی و رویه تحویل درب منزل در فروشگاه جمه.',
        keywords: 'ارسال, تحویل, هزینه ارسال, پست, پیک, زمان تحویل',
        image: '/images/logo.png',
        canonical: window.location.origin + '/shipping'
    });

    React.useEffect(() => {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': 'سفارش‌ها چه زمانی ارسال می‌شوند؟',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'سفارش‌های ثبت‌شده در روزهای کاری بین ۲۴ تا ۷۲ ساعت پردازش و تحویل شرکت حمل‌ونقل می‌شوند. در مناسبت‌های شلوغ ممکن است کمی بیشتر شود.'
                    }
                },
                {
                    '@type': 'Question',
                    'name': 'هزینه ارسال چقدر است؟',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'هزینه ارسال بر اساس آدرس و روش حمل‌ونقل در مرحله پرداخت محاسبه و نمایش داده می‌شود. برای برخی سفارش‌ها بالای مبلغ مشخص، ارسال رایگان فعال می‌شود.'
                    }
                }
            ]
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
        return () => { try { document.head.removeChild(script); } catch {} };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-6">
            <div className="max-w-7xl mx-auto">
                <section className="rounded-2xl glass-card soft-shadow border border-white/10 p-5 md:p-7 mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold mb-2">ارسال و تحویل</h1>
                    <p className="text-gray-300 text-sm leading-7">همه‌چیز درباره زمان ارسال، شیوه‌های حمل‌ونقل و جزئیات تحویل سفارش شما.</p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl glass-card soft-shadow border border-white/10 p-4">
                        <div className="text-white font-semibold mb-1">زمان آماده‌سازی</div>
                        <p className="text-gray-300 text-sm leading-7">سفارش‌ها در روزهای کاری طی ۱ تا ۳ روز پردازش می‌شوند. جزئیات دقیق در فاکتور و صفحه پیگیری نمایش داده می‌شود.</p>
                    </div>
                    <div className="rounded-2xl glass-card soft-shadow border border-white/10 p-4">
                        <div className="text-white font-semibold mb-1">روش‌های ارسال</div>
                        <p className="text-gray-300 text-sm leading-7">پست پیشتاز برای سراسر ایران و پیک شهری برای برخی شهرها. در مرحله تسویه می‌توانید روش مناسب را انتخاب کنید.</p>
                    </div>
                    <div className="rounded-2xl glass-card soft-shadow border border-white/10 p-4">
                        <div className="text-white font-semibold mb-1">هزینه و تخفیف ارسال</div>
                        <p className="text-gray-300 text-sm leading-7">هزینه بر اساس مقصد و وزن محاسبه می‌شود. برای سفارش‌های بالاتر از حد نصاب، ارسال رایگان فعال می‌شود.</p>
                    </div>
                </section>

                <section className="rounded-2xl glass-card soft-shadow border border-white/10 p-5 md:p-7">
                    <h2 className="text-lg font-bold mb-3">سوالات رایج</h2>
                    <div className="space-y-3 text-sm">
                        <details className="rounded-xl bg-white/5 border border-white/10 p-3">
                            <summary className="font-semibold cursor-pointer">چطور سفارش را پیگیری کنم؟</summary>
                            <p className="text-gray-300 mt-2 leading-6">بعد از ارسال، کد رهگیری برای شما پیامک می‌شود. همچنین می‌توانید از بخش «سفارش‌ها» در حساب کاربری وضعیت مرسوله را ببینید.</p>
                        </details>
                        <details className="rounded-xl bg-white/5 border border-white/10 p-3">
                            <summary className="font-semibold cursor-pointer">اگر گیرنده در آدرس نبود چه می‌شود؟</summary>
                            <p className="text-gray-300 mt-2 leading-6">شرکت حمل‌ونقل طبق روال خود با شما هماهنگ می‌کند. در صورت مرجوع شدن مرسوله، پشتیبانی جمه برای ارسال مجدد راهنمایی می‌کند.</p>
                        </details>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ShippingPage;


