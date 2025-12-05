import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

export default function LandingPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        tenant_name: '',
        tenant_domain: '',
    });
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState({});
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const observerRef = useRef(null);

    useEffect(() => {
        // Set hero visible immediately
        setIsVisible({ hero: true });

        // Mark all animated elements as JS-loaded for fallback
        const animatedElements = document.querySelectorAll('[data-animate-feature], [data-animate-pricing], .fade-in-delayed');
        animatedElements.forEach(el => el.classList.add('js-loaded'));

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const elementId = entry.target.id || entry.target.getAttribute('data-section-id');
                            if (elementId) {
                                setIsVisible((prev) => ({
                                    ...prev,
                                    [elementId]: true,
                                }));
                            }
                            // Add visible class directly to element
                            entry.target.classList.add('visible');
                            
                            // Also handle child elements in sections
                            const childElements = entry.target.querySelectorAll('[data-animate-feature], [data-animate-pricing]');
                            childElements.forEach((child, index) => {
                                setTimeout(() => {
                                    child.classList.add('visible');
                                }, index * 100);
                            });
                        }
                    });
                },
                { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
            );

            // Observe sections with data-animate
            const sections = document.querySelectorAll('[data-animate]');
            sections.forEach((section) => {
                if (observerRef.current) {
                    observerRef.current.observe(section);
                }
            });

            // Observe individual feature cards
            const featureCards = document.querySelectorAll('[data-animate-feature]');
            featureCards.forEach((card) => {
                if (observerRef.current) {
                    observerRef.current.observe(card);
                }
            });

            // Observe pricing cards
            const pricingCards = document.querySelectorAll('[data-animate-pricing]');
            pricingCards.forEach((card) => {
                if (observerRef.current) {
                    observerRef.current.observe(card);
                }
            });
        }, 200);

        return () => {
            clearTimeout(timer);
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsRegistering(true);

        try {
            const registerResponse = await fetch('/api/platform/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.message || 'خطا در ثبت‌نام');
            }

            const { token } = await registerResponse.json();

            const tenantResponse = await fetch('/api/platform/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.tenant_name,
                    domain: formData.tenant_domain,
                    plan_type: selectedPlan,
                }),
            });

            if (!tenantResponse.ok) {
                const errorData = await tenantResponse.json();
                throw new Error(errorData.message || 'خطا در ایجاد فروشگاه');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsRegistering(false);
        }
    };

    if (success) {
        return (
            <>
                <Helmet>
                    <title>ثبت‌نام موفق - پلتفرم فروشگاهی</title>
                </Helmet>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center transform transition-all duration-500 animate-fade-in">
                        <div className="mb-6">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-bounce">
                                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">ثبت‌نام با موفقیت انجام شد!</h2>
                        <p className="text-gray-600 mb-8">
                            فروشگاه شما با موفقیت ایجاد شد. به زودی می‌توانید از طریق دامنه خود به پنل مدیریت دسترسی داشته باشید.
                        </p>
                        <a
                            href="/platform/login"
                            className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            ورود به پنل مدیریت
                        </a>
                    </div>
                </div>
            </>
        );
    }

    const pricingPlans = [
        {
            id: 'starter',
            name: 'استارتر',
            price: 'رایگان',
            period: 'همیشه',
            description: 'برای شروع کار و تست پلتفرم',
            features: [
                'تا 50 محصول',
                '1 گیگابایت فضای ذخیره‌سازی',
                'پشتیبانی ایمیل',
                'تم‌های رایگان',
                'گزارش‌های پایه',
            ],
            popular: false,
            gradient: 'from-gray-500 to-gray-700',
        },
        {
            id: 'pro',
            name: 'حرفه‌ای',
            price: '299,000',
            period: 'تومان/ماه',
            description: 'برای کسب‌وکارهای در حال رشد',
            features: [
                'محصولات نامحدود',
                '10 گیگابایت فضای ذخیره‌سازی',
                'پشتیبانی اولویت‌دار',
                'تم‌های حرفه‌ای',
                'گزارش‌های پیشرفته',
                'پرداخت آنلاین',
                'کد تخفیف و کوپن',
            ],
            popular: true,
            gradient: 'from-purple-600 via-pink-600 to-blue-600',
        },
        {
            id: 'enterprise',
            name: 'سازمانی',
            price: 'مذاکره',
            period: '',
            description: 'برای کسب‌وکارهای بزرگ',
            features: [
                'همه ویژگی‌های حرفه‌ای',
                'فضای ذخیره‌سازی نامحدود',
                'پشتیبانی اختصاصی',
                'API دسترسی کامل',
                'سفارشی‌سازی پیشرفته',
                'مدیریت چند فروشگاه',
                'گزارش‌های سفارشی',
            ],
            popular: false,
            gradient: 'from-blue-600 to-cyan-600',
        },
    ];

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'راه‌اندازی سریع',
            description: 'فروشگاه خود را در کمتر از 5 دقیقه راه‌اندازی کنید',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            title: 'سفارشی‌سازی کامل',
            description: 'طراحی و ظاهر فروشگاه را به دلخواه خود تغییر دهید',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'امن و قابل اعتماد',
            description: 'اطلاعات و داده‌های شما در امنیت کامل نگهداری می‌شود',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            title: 'موبایل فرست',
            description: 'فروشگاه شما در تمام دستگاه‌ها به بهترین شکل نمایش داده می‌شود',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'پرداخت آنلاین',
            description: 'پرداخت‌های امن و سریع با درگاه‌های معتبر ایرانی',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'گزارش‌های پیشرفته',
            description: 'تحلیل کامل فروش و رفتار مشتریان با داشبورد حرفه‌ای',
        },
    ];

    const stats = [
        { number: '10,000+', label: 'فروشگاه فعال' },
        { number: '50,000+', label: 'محصول' },
        { number: '99.9%', label: 'آپتایم' },
        { number: '24/7', label: 'پشتیبانی' },
    ];

    return (
        <>
            <Helmet>
                <title>پلتفرم فروشگاهی - ایجاد فروشگاه آنلاین خود</title>
                <meta name="description" content="ایجاد و مدیریت فروشگاه آنلاین خود را با پلتفرم ما شروع کنید" />
            </Helmet>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes floatReverse {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(20px) rotate(-5deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-reverse {
                    animation: floatReverse 8s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 4s ease-in-out infinite;
                }
                .animate-rotate {
                    animation: rotate 20s linear infinite;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 8s ease infinite;
                }
                .grid-pattern {
                    background-image: 
                        linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
                .dots-pattern {
                    background-image: radial-gradient(circle, rgba(236, 72, 153, 0.15) 1px, transparent 1px);
                    background-size: 30px 30px;
                }
                .fade-in {
                    opacity: 1;
                    transform: translateY(0);
                    animation: fadeInUp 0.8s ease-out;
                }
                .fade-in-delayed {
                    opacity: 1;
                    transform: translateY(0);
                    animation: fadeInUp 0.8s ease-out 0.3s both;
                }
                [data-animate-feature], [data-animate-pricing] {
                    opacity: 1;
                    transform: translateY(0);
                    animation: fadeInUp 0.8s ease-out both;
                }
            `}</style>
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 overflow-hidden relative">
                {/* Animated Background Layers */}
                <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 animate-gradient -z-10"></div>
                
                {/* Grid Pattern Overlay */}
                <div className="fixed inset-0 grid-pattern opacity-40 -z-10"></div>
                
                {/* Dots Pattern Overlay */}
                <div className="fixed inset-0 dots-pattern opacity-30 -z-10"></div>
                
                {/* Floating Shapes - Large */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    {/* Large Purple Circle */}
                    <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float"></div>
                    
                    {/* Large Pink Circle */}
                    <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float-reverse" style={{ animationDelay: '2s' }}></div>
                    
                    {/* Large Blue Circle */}
                    <div className="absolute -bottom-40 left-1/2 w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{ animationDelay: '4s' }}></div>
                    
                    {/* Medium Circles */}
                    <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse-slow"></div>
                    <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                    
                    {/* Small Accent Circles */}
                    <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float-reverse" style={{ animationDelay: '3s' }}></div>
                    <div className="absolute top-3/4 left-1/5 w-36 h-36 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float" style={{ animationDelay: '1.5s' }}></div>
                    
                    {/* Geometric Shapes */}
                    <div className="absolute top-1/2 right-1/5 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl mix-blend-multiply filter blur-2xl opacity-15 animate-rotate" style={{ animationDelay: '0s' }}></div>
                    <div className="absolute bottom-1/2 left-1/5 w-40 h-40 bg-gradient-to-br from-pink-400 to-blue-400 rounded-2xl mix-blend-multiply filter blur-2xl opacity-15 animate-rotate" style={{ animationDelay: '5s', animationDirection: 'reverse' }}></div>
                    
                    {/* Radial Gradient Overlays */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
                        background: 'radial-gradient(circle at 20% 20%, rgba(192, 132, 252, 0.2), transparent 50%)'
                    }}></div>
                    <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none" style={{
                        background: 'radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.2), transparent 50%)'
                    }}></div>
                    <div className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none" style={{
                        background: 'radial-gradient(circle at center, rgba(96, 165, 250, 0.15), transparent 60%)',
                        transform: 'translate(-50%, -50%)'
                    }}></div>
                </div>
                
                {/* Light Rays Effect */}
                <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
                    <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-300/50 to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-300/50 to-transparent transform skew-x-12"></div>
                    <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-300/50 to-transparent"></div>
                </div>

                {/* Header */}
                <header className="relative z-50 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    پلتفرم فروشگاهی
                                </h1>
                            </div>
                            <a
                                href="/platform/login"
                                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300"
                            >
                                ورود
                            </a>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section id="hero" data-animate className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className={`text-center fade-in ${isVisible.hero ? 'visible' : ''}`}>
                            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                    فروشگاه آنلاین خود را
                                </span>
                                <br />
                                <span className="text-gray-900">در چند دقیقه ایجاد کنید</span>
                        </h2>
                            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                                با پلتفرم ما، بدون نیاز به دانش فنی، فروشگاه آنلاین حرفه‌ای خود را راه‌اندازی کنید و کسب‌وکار خود را به سطح بعدی برسانید
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="#pricing"
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    شروع رایگان
                                </a>
                                <a
                                    href="#features"
                                    className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 shadow-md"
                                >
                                    مشاهده ویژگی‌ها
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* Section Divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                </section>

                {/* Stats Section */}
                <section id="stats" data-animate data-section-id="stats" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white/80 via-purple-50/50 to-white/80 backdrop-blur-sm">
                    {/* Top Divider */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto">
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 fade-in-delayed ${isVisible.stats ? 'visible' : ''}`}>
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" style={{ transitionDelay: `${index * 0.1}s` }}>
                                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                            ))}
                        </div>
                        </div>

                    {/* Bottom Divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
                </section>

                {/* Features Section */}
                <section id="features" data-animate data-section-id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/30 to-white">
                    {/* Top Divider */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto">
                        <div className={`text-center mb-16 fade-in-delayed ${isVisible.features ? 'visible' : ''}`}>
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                چرا <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">ما</span> را انتخاب کنید؟
                            </h3>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                تمام ابزارهای مورد نیاز برای موفقیت در تجارت الکترونیک
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    data-animate-feature
                                    className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100`}
                                    style={{ transitionDelay: `${index * 0.1}s` }}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bottom Divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" data-animate data-section-id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80 backdrop-blur-sm">
                    {/* Top Divider */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto">
                        <div className={`text-center mb-16 fade-in-delayed ${isVisible.pricing ? 'visible' : ''}`}>
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">قیمت‌گذاری</span> شفاف و منصفانه
                            </h3>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                پلن مناسب خود را انتخاب کنید و از امروز شروع کنید
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <div
                                    key={plan.id}
                                    data-animate-pricing
                                    className={`relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${plan.popular ? 'ring-4 ring-purple-500 scale-105' : ''}`}
                                    style={{ transitionDelay: `${index * 0.1}s` }}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                                محبوب‌ترین
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-center mb-8">
                                        <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                                        <p className="text-gray-600 mb-4">{plan.description}</p>
                                        <div className="mb-4">
                                            <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                {plan.price}
                                            </span>
                                            {plan.period && (
                                                <span className="text-gray-600 text-lg">/{plan.period}</span>
                                            )}
                                        </div>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <svg className="w-6 h-6 text-green-500 ml-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => {
                                            setSelectedPlan(plan.id);
                                            document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                                            plan.popular
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {plan.id === 'enterprise' ? 'تماس با ما' : 'شروع کنید'}
                                    </button>
                            </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bottom Divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
                </section>

                {/* Registration Form */}
                <section id="register-form" data-animate data-section-id="register" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-purple-50/20 to-white">
                    {/* Top Divider */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                    <div className="max-w-2xl mx-auto">
                        <div className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 fade-in-delayed ${isVisible.register ? 'visible' : ''}`}>
                            <div className="text-center mb-8">
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    ایجاد حساب کاربری و فروشگاه
                                </h3>
                                <p className="text-gray-600">
                                    پلن انتخاب شده: <span className="font-semibold text-purple-600">
                                        {pricingPlans.find(p => p.id === selectedPlan)?.name}
                                    </span>
                                </p>
                            </div>
                        
                        {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in-up">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نام و نام خانوادگی
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ایمیل
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                />
                                    </div>
                            </div>

                                <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رمز عبور
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تکرار رمز عبور
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                />
                                    </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نام فروشگاه
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.tenant_name}
                                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    دامنه فروشگاه (مثال: mystore.com)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.tenant_domain}
                                    onChange={(e) => {
                                        // Allow domain format: example.com, shop.example.com, etc.
                                        const value = e.target.value.toLowerCase().trim();
                                        setFormData({ ...formData, tenant_domain: value });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                    placeholder="mystore.com یا shop.example.com"
                                />
                                <p className="mt-2 text-sm text-gray-500">دامنه کامل خود را وارد کنید (مثل mystore.com یا shop.example.com)</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isRegistering}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isRegistering ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            در حال ثبت‌نام...
                                        </span>
                                    ) : (
                                        'ایجاد فروشگاه'
                                    )}
                            </button>
                        </form>

                            <p className="mt-8 text-center text-sm text-gray-600">
                            با ثبت‌نام، شما{' '}
                                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                                شرایط استفاده
                            </a>
                            {' '}و{' '}
                                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                                حریم خصوصی
                            </a>
                            {' '}را می‌پذیرید
                        </p>
                    </div>
                </div>
                
                    {/* Bottom Divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                </section>

                {/* Footer */}
                <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                    {/* Top Divider */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold">پلتفرم فروشگاهی</h4>
                                </div>
                                <p className="text-gray-400">
                                    راهکار کامل برای ایجاد و مدیریت فروشگاه آنلاین
                                </p>
                            </div>
                            <div>
                                <h5 className="font-semibold mb-4">محصول</h5>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#features" className="hover:text-white transition-colors">ویژگی‌ها</a></li>
                                    <li><a href="#pricing" className="hover:text-white transition-colors">قیمت‌گذاری</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">مستندات</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold mb-4">شرکت</h5>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">درباره ما</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">تماس با ما</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">وبلاگ</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold mb-4">پشتیبانی</h5>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">مرکز راهنما</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">پشتیبانی</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">وضعیت سرویس</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                            <p>© 2025 پلتفرم فروشگاهی. تمامی حقوق محفوظ است.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
