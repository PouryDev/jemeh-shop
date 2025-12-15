import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';

// Icon Components
const LightningIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const PaletteIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

const ChartBarIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CreditCardIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const DeviceMobileIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const LockClosedIcon = ({ className = "w-12 h-12" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const ShoppingCartIcon = ({ className = "w-10 h-10" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CurrencyDollarIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CubeIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const ChartLineIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const PlusIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const CogIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const HeartIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

const StarIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

function LandingPage() {
    const [plans, setPlans] = useState([]);
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
    const [currentStep, setCurrentStep] = useState(1); // 1: billing cycle, 2: registration, 3: success/payment
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        shop_name: '',
        slug: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [plansRes, themesRes] = await Promise.all([
                apiRequest('/api/saas/plans'),
                apiRequest('/api/saas/themes'),
            ]);

            if (plansRes.success && plansRes.data) {
                const plansData = Array.isArray(plansRes.data) 
                    ? plansRes.data 
                    : (plansRes.data.data || []);
                setPlans(Array.isArray(plansData) ? plansData : []);
            }

            if (themesRes.success && themesRes.data) {
                const themesData = Array.isArray(themesRes.data) 
                    ? themesRes.data 
                    : (themesRes.data.data || []);
                setThemes(Array.isArray(themesData) ? themesData : []);
                if (themesData.length > 0) {
                    setSelectedTheme(themesData[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        // If plan has both monthly and yearly, start at step 1 (billing selection)
        // Otherwise, skip directly to step 2 (registration)
        const hasBothOptions = plan.price_monthly > 0 && plan.price_yearly > 0;
        setCurrentStep(hasBothOptions ? 1 : 2);
        setBillingCycle(plan.price_yearly > 0 && plan.price_monthly === 0 ? 'yearly' : 'monthly');
        setRegistrationSuccess(false);
        setIsSubmitting(false);
        setShowRegisterForm(true);
        // Reset form data
        setFormData({
            name: '',
            shop_name: '',
            slug: '',
            phone: '',
            password: '',
            password_confirmation: '',
        });
    };

    const handleNextStep = () => {
        // If plan has both monthly and yearly, show billing cycle selection
        if (currentStep === 1 && selectedPlan?.price_monthly > 0 && selectedPlan?.price_yearly > 0) {
            setCurrentStep(2);
        } else if (currentStep === 1) {
            // If only one billing option, skip to registration
            setCurrentStep(2);
        }
    };

    const handleBackStep = () => {
        if (currentStep === 2 && selectedPlan?.price_monthly > 0 && selectedPlan?.price_yearly > 0) {
            setCurrentStep(1);
        }
    };

    const getPlanPrice = () => {
        if (!selectedPlan) return 0;
        return billingCycle === 'yearly' && selectedPlan.price_yearly > 0
            ? selectedPlan.price_yearly
            : selectedPlan.price_monthly;
    };

    const getBillingPeriod = () => {
        return billingCycle === 'yearly' ? 'سالانه' : 'ماهانه';
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Map form data to API format
            const payload = {
                name: formData.name,
                subdomain: formData.slug || formData.shop_name?.toLowerCase().replace(/[^a-z0-9\-]/g, ''),
                phone: formData.phone,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                plan_id: selectedPlan?.id,
                theme_id: selectedTheme?.id,
            };

            const res = await fetch('/api/saas/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
                // Store token if provided
                if (data.data?.token) {
                    localStorage.setItem('sanctum_auth_token', data.data.token);
                }
                
                setRegistrationSuccess(true);
                setCurrentStep(3);
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    // Redirect to merchant subdomain or merchant dashboard
                    if (data.data?.merchant?.subdomain) {
                        const mainDomain = window.location.hostname.replace(/^[^.]+\./, '') || window.location.hostname;
                        const merchantUrl = `https://${data.data.merchant.subdomain}.${mainDomain}/merchant?merchant_id=${data.data.merchant.id}`;
                        window.location.href = merchantUrl;
                    } else {
                        window.location.href = `/merchant?merchant_id=${data.data.merchant.id}`;
                    }
                }, 2000);
            } else {
                const errorMessage = data.message || data.error || 'خطا در ثبت‌نام';
                alert(errorMessage);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowRegisterForm(false);
        setSelectedPlan(null);
        setCurrentStep(1);
        setBillingCycle('monthly');
        setRegistrationSuccess(false);
        setIsSubmitting(false);
        setFormData({
            name: '',
            shop_name: '',
            slug: '',
            phone: '',
            password: '',
            password_confirmation: '',
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fa-IR').format(price);
    };

    // Mock analytics data for demo
    const mockAnalytics = {
        totalSales: 125000000,
        totalOrders: 1247,
        totalProducts: 156,
        growthRate: 23.5,
        salesByDay: [
            { day: 'شنبه', sales: 4500000, orders: 23 },
            { day: 'یکشنبه', sales: 5200000, orders: 28 },
            { day: 'دوشنبه', sales: 4800000, orders: 25 },
            { day: 'سه‌شنبه', sales: 6100000, orders: 32 },
            { day: 'چهارشنبه', sales: 5500000, orders: 29 },
            { day: 'پنج‌شنبه', sales: 6800000, orders: 35 },
            { day: 'جمعه', sales: 7200000, orders: 38 },
        ],
        salesByMonth: [
            { month: 'مرداد', sales: 18500000, orders: 95 },
            { month: 'شهریور', sales: 22000000, orders: 112 },
            { month: 'مهر', sales: 24500000, orders: 128 },
            { month: 'آبان', sales: 28000000, orders: 145 },
            { month: 'آذر', sales: 32000000, orders: 165 },
        ],
        ordersByStatus: [
            { name: 'در انتظار', value: 45, color: '#f59e0b' },
            { name: 'در حال پردازش', value: 32, color: '#3b82f6' },
            { name: 'ارسال شده', value: 78, color: '#10b981' },
            { name: 'تحویل داده شده', value: 156, color: '#6366f1' },
            { name: 'لغو شده', value: 8, color: '#ef4444' },
        ],
        topProducts: [
            { name: 'تیشرت کلاسیک', sales: 45, revenue: 6750000 },
            { name: 'شلوار جین', sales: 38, revenue: 5700000 },
            { name: 'کفش ورزشی', sales: 32, revenue: 4800000 },
            { name: 'کاپشن زمستانی', sales: 28, revenue: 4200000 },
        ],
        revenueByHour: [
            { hour: '8', revenue: 1200000 },
            { hour: '10', revenue: 2500000 },
            { hour: '12', revenue: 3800000 },
            { hour: '14', revenue: 4200000 },
            { hour: '16', revenue: 5100000 },
            { hour: '18', revenue: 6800000 },
            { hour: '20', revenue: 7500000 },
            { hour: '22', revenue: 6200000 },
        ],
    };

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                    <p className="text-white font-semibold mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatPrice(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cherry-50 via-purple-50 to-blue-50 px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-3 sm:border-4 border-cherry-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 sm:mt-5 md:mt-6 text-base sm:text-lg md:text-xl text-gray-700 font-medium">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cherry-50 via-purple-50 to-blue-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32">
                <div className="absolute inset-0 bg-gradient-to-r from-cherry-600/10 via-purple-600/10 to-blue-600/10"></div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-cherry-100 text-cherry-700 rounded-full text-xs sm:text-sm font-semibold animate-pulse">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M5 21v-4M3 19h4m10-16v4m2-2h-4m2 18v-4m2 2h-4M7 3h10M7 21h10M7 7h10M7 15h10" />
                            </svg>
                            <span className="hidden sm:inline">پلتفرم فروشگاه‌سازی آنلاین</span>
                            <span className="sm:hidden">فروشگاه‌سازی آنلاین</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
                            فروشگاه آنلاین خود را
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cherry-600 to-purple-600 mt-2">
                                در کمتر از ۵ دقیقه
                            </span>
                            راه‌اندازی کنید
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4">
                            بدون نیاز به کدنویسی، طراحی و هاستینگ. همه چیز آماده است!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                            <button
                                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cherry-600 to-purple-600 text-white text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                شروع رایگان
                            </button>
                            <button
                                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 text-base sm:text-lg font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-gray-200 transform hover:scale-105 transition-all duration-300"
                            >
                                مشاهده دمو
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Animated Background Elements - Hidden on mobile */}
                <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="hidden md:block absolute top-40 right-10 w-72 h-72 bg-cherry-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="hidden md:block absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-4">چرا ما را انتخاب کنید؟</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">همه چیز برای موفقیت فروشگاه شما</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
                        {[
                            { Icon: LightningIcon, title: 'راه‌اندازی سریع', desc: 'فروشگاه شما در کمتر از ۵ دقیقه آماده می‌شود', color: 'text-yellow-500' },
                            { Icon: PaletteIcon, title: 'قالب‌های زیبا', desc: 'چندین قالب حرفه‌ای و قابل سفارشی‌سازی', color: 'text-purple-500' },
                            { Icon: ChartBarIcon, title: 'آمار و گزارش', desc: 'گزارش‌های کامل از فروش و عملکرد فروشگاه', color: 'text-blue-500' },
                            { Icon: CreditCardIcon, title: 'درگاه پرداخت', desc: 'اتصال به درگاه‌های معتبر پرداخت ایرانی', color: 'text-green-500' },
                            { Icon: DeviceMobileIcon, title: 'ریسپانسیو', desc: 'سازگار با تمام دستگاه‌ها و صفحات نمایش', color: 'text-pink-500' },
                            { Icon: LockClosedIcon, title: 'امنیت بالا', desc: 'محافظت از اطلاعات شما با بالاترین استانداردها', color: 'text-red-500' },
                        ].map((feature, idx) => (
                            <div key={idx} className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                                <div className={`mb-3 sm:mb-4 ${feature.color}`}>
                                    <feature.Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Theme Preview Section */}
            <section id="demo" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-purple-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-4">قالب‌های زیبا و حرفه‌ای</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">انتخاب از بین چندین قالب آماده</p>
                    </div>
                    
                    {themes.length > 0 && (
                        <div className="max-w-6xl mx-auto">
                            {/* Theme Selector */}
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 px-2">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setSelectedTheme(theme)}
                                        className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 ${
                                            selectedTheme?.id === theme.id
                                                ? 'bg-gradient-to-r from-cherry-600 to-purple-600 text-white shadow-lg scale-105'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                                        }`}
                                    >
                                        {theme.name}
                                    </button>
                                ))}
                            </div>

                            {/* Live Theme Preview */}
                            {selectedTheme && (
                                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 mx-2 sm:mx-0">
                                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 sm:p-4 flex items-center gap-2">
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                                        <div className="flex-1 text-center text-xs sm:text-sm text-gray-600 font-medium">
                                            <span className="hidden sm:inline">{selectedTheme.name} - پیش‌نمایش زنده</span>
                                            <span className="sm:hidden">{selectedTheme.name}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Theme-specific previews */}
                                    {selectedTheme.slug === 'default' && (
                                        <DefaultThemePreview theme={selectedTheme} formatPrice={formatPrice} />
                                    )}
                                    {selectedTheme.slug === 'modern' && (
                                        <ModernThemePreview theme={selectedTheme} formatPrice={formatPrice} />
                                    )}
                                    {selectedTheme.slug === 'minimal' && (
                                        <MinimalThemePreview theme={selectedTheme} formatPrice={formatPrice} />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Analytics Dashboard Preview */}
            <section className="py-12 sm:py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-4">داشبورد مدیریتی کامل</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">کنترل کامل بر فروشگاه خود</p>
                    </div>
                    
                    <div className="max-w-7xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
                        {/* Dashboard Header */}
                        <div className="bg-gray-800 p-4 sm:p-5 md:p-6 border-b border-gray-700">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-white">داشبورد مدیریتی</h3>
                                <div className="flex gap-2 items-center">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                                    <span className="text-green-400 text-xs sm:text-sm font-medium">آنلاین</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-4 sm:p-6 md:p-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
                                {[
                                    { label: 'فروش کل', value: formatPrice(mockAnalytics.totalSales), Icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-600' },
                                    { label: 'سفارشات', value: mockAnalytics.totalOrders.toLocaleString('fa-IR'), Icon: CubeIcon, color: 'from-blue-500 to-cyan-600' },
                                    { label: 'محصولات', value: mockAnalytics.totalProducts.toLocaleString('fa-IR'), Icon: ShoppingCartIcon, color: 'from-purple-500 to-pink-600' },
                                    { label: 'رشد', value: `+${mockAnalytics.growthRate}%`, Icon: ChartLineIcon, color: 'from-cherry-500 to-red-600' },
                                ].map((stat, idx) => (
                                    <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                                        <div className="mb-2 sm:mb-3">
                                            <stat.Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                                        </div>
                                        <div className="text-2xl sm:text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                                        <div className="text-xs sm:text-sm opacity-90">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
                                {/* Sales Chart - Modern Bar Chart */}
                                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 shadow-xl">
                                    <h4 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                        <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cherry-400" />
                                        فروش هفتگی
                                    </h4>
                                    <div className="h-[200px] sm:h-[220px] md:h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={mockAnalytics.salesByDay} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                            <defs>
                                                {mockAnalytics.salesByDay.map((entry, index) => (
                                                    <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                                                        <stop offset="50%" stopColor="#a855f7" stopOpacity={0.9} />
                                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                            <XAxis 
                                                dataKey="day" 
                                                stroke="#9ca3af"
                                                style={{ fontSize: '10px', fontWeight: '500' }}
                                                className="text-[10px] sm:text-xs"
                                                tickLine={false}
                                                axisLine={{ stroke: '#4b5563' }}
                                            />
                                            <YAxis 
                                                stroke="#9ca3af"
                                                style={{ fontSize: '10px', fontWeight: '500' }}
                                                className="text-[10px] sm:text-xs"
                                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                                tickLine={false}
                                                axisLine={{ stroke: '#4b5563' }}
                                                width={40}
                                            />
                                            <Tooltip 
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-2xl">
                                                                <p className="text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">{data.day}</p>
                                                                <div className="space-y-0.5 sm:space-y-1">
                                                                    <p className="text-xs sm:text-sm">
                                                                        <span className="text-gray-400">فروش: </span>
                                                                        <span className="text-cherry-400 font-bold">{formatPrice(data.sales)}</span>
                                                                    </p>
                                                                    <p className="text-xs sm:text-sm">
                                                                        <span className="text-gray-400">سفارشات: </span>
                                                                        <span className="text-purple-400 font-bold">{data.orders}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar 
                                                dataKey="sales" 
                                                radius={[8, 8, 0, 0]}
                                            >
                                                {mockAnalytics.salesByDay.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={`url(#barGradient-${index})`}
                                                        style={{ 
                                                            filter: 'drop-shadow(0 4px 6px rgba(236, 72, 153, 0.4))',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Orders Status - Modern Donut Pie Chart */}
                                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700">
                                    <h4 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">وضعیت سفارشات</h4>
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                <defs>
                                                    {mockAnalytics.ordersByStatus.map((entry, index) => (
                                                        <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                                                        </linearGradient>
                                                    ))}
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur"/>
                                                            <feMergeNode in="SourceGraphic"/>
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <Pie
                                                    data={mockAnalytics.ordersByStatus}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="45%"
                                                    outerRadius="70%"
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="#1f2937"
                                                    strokeWidth={2}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                >
                                                    {mockAnalytics.ordersByStatus.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={`url(#gradient-${index})`}
                                                            style={{ 
                                                                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            const total = mockAnalytics.ordersByStatus.reduce((sum, item) => sum + item.value, 0);
                                                            const percent = ((data.value / total) * 100).toFixed(1);
                                                            return (
                                                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-2xl backdrop-blur-sm">
                                                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                                        <div 
                                                                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-lg" 
                                                                            style={{ backgroundColor: data.color }}
                                                                        ></div>
                                                                        <p className="text-white font-bold text-xs sm:text-sm md:text-base">{data.name}</p>
                                                                    </div>
                                                                    <div className="space-y-0.5 sm:space-y-1">
                                                                        <p className="text-gray-300 text-xs sm:text-sm">
                                                                            تعداد: <span className="text-white font-bold text-sm sm:text-base md:text-lg">{data.value}</span>
                                                                        </p>
                                                                        <p className="text-gray-300 text-xs sm:text-sm">
                                                                            درصد: <span className="text-white font-bold text-sm sm:text-base md:text-lg">{percent}%</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        
                                        {/* Center Label */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                                                    {mockAnalytics.ordersByStatus.reduce((sum, item) => sum + item.value, 0)}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-400">کل سفارشات</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {mockAnalytics.ordersByStatus.map((status, idx) => {
                                            const total = mockAnalytics.ordersByStatus.reduce((sum, item) => sum + item.value, 0);
                                            const percent = ((status.value / total) * 100).toFixed(1);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-700/40 to-gray-700/20 rounded-lg sm:rounded-xl hover:from-gray-700/60 hover:to-gray-700/40 transition-all duration-300 cursor-pointer border border-gray-600/30 hover:border-gray-500/50"
                                                >
                                                    <div 
                                                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-lg group-hover:scale-125 transition-transform ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-gray-800" 
                                                        style={{ 
                                                            backgroundColor: status.color,
                                                            ringColor: status.color + '40'
                                                        }}
                                                    ></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-white text-xs sm:text-sm font-semibold truncate">{status.name}</div>
                                                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                                            <span className="text-gray-300 text-xs font-medium">{status.value}</span>
                                                            <span className="text-gray-500 text-xs">({percent}%)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Second Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
                                {/* Monthly Sales - Modern Line Chart */}
                                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 shadow-xl">
                                    <h4 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                        <ChartLineIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                                        <span className="text-sm sm:text-base md:text-lg">فروش ماهانه (۵ ماه اخیر)</span>
                                    </h4>
                                    <div className="h-[200px] sm:h-[220px] md:h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={mockAnalytics.salesByMonth} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                            <XAxis 
                                                dataKey="month" 
                                                stroke="#9ca3af"
                                                style={{ fontSize: '10px', fontWeight: '500' }}
                                                className="text-[10px] sm:text-xs"
                                                tickLine={false}
                                                axisLine={{ stroke: '#4b5563' }}
                                            />
                                            <YAxis 
                                                stroke="#9ca3af"
                                                style={{ fontSize: '10px', fontWeight: '500' }}
                                                className="text-[10px] sm:text-xs"
                                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                                tickLine={false}
                                                axisLine={{ stroke: '#4b5563' }}
                                                width={40}
                                            />
                                            <Tooltip 
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-2xl">
                                                                <p className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">{data.month}</p>
                                                                <div className="space-y-1 sm:space-y-2">
                                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cherry-500"></div>
                                                                        <span className="text-gray-400 text-xs sm:text-sm">فروش: </span>
                                                                        <span className="text-cherry-400 font-bold text-xs sm:text-sm">{formatPrice(data.sales)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
                                                                        <span className="text-gray-400 text-xs sm:text-sm">سفارشات: </span>
                                                                        <span className="text-purple-400 font-bold text-xs sm:text-sm">{data.orders}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend 
                                                wrapperStyle={{ color: '#9ca3af', fontSize: '10px', paddingTop: '10px' }}
                                                iconType="line"
                                                className="text-[10px] sm:text-xs"
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="sales" 
                                                fill="url(#salesGradient)" 
                                                stroke="none"
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="orders" 
                                                fill="url(#ordersGradient)" 
                                                stroke="none"
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="sales" 
                                                stroke="#ec4899" 
                                                strokeWidth={2}
                                                dot={{ fill: '#ec4899', r: 4, strokeWidth: 1.5, stroke: '#fff' }}
                                                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                                name="فروش"
                                                style={{ filter: 'drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3))' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="orders" 
                                                stroke="#8b5cf6" 
                                                strokeWidth={2}
                                                strokeDasharray="6 4"
                                                dot={{ fill: '#8b5cf6', r: 3.5, strokeWidth: 1.5, stroke: '#fff' }}
                                                activeDot={{ r: 5.5, stroke: '#fff', strokeWidth: 2 }}
                                                name="سفارشات"
                                                style={{ filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))' }}
                                            />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Products - Modern */}
                                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 shadow-xl">
                                    <h4 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                        <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                                        محصولات پرفروش
                                    </h4>
                                    <div className="space-y-2 sm:space-y-3">
                                        {mockAnalytics.topProducts.map((product, idx) => {
                                            const rankColors = [
                                                'from-yellow-500 to-orange-500',
                                                'from-gray-400 to-gray-500',
                                                'from-orange-600 to-red-600',
                                                'from-blue-500 to-purple-500'
                                            ];
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-700/40 to-gray-700/20 rounded-lg sm:rounded-xl hover:from-gray-700/60 hover:to-gray-700/40 transition-all duration-300 cursor-pointer border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg"
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${rankColors[idx] || 'from-cherry-500 to-purple-500'} rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-gray-800 flex-shrink-0`}
                                                             style={{ ringColor: idx === 0 ? '#eab30840' : idx === 1 ? '#9ca3af40' : idx === 2 ? '#ea580c40' : '#6366f140' }}
                                                        >
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-white font-semibold text-sm sm:text-base group-hover:text-cherry-400 transition-colors truncate">
                                                                {product.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-gray-400 text-xs sm:text-sm">{product.sales}</span>
                                                                <span className="text-gray-500 text-xs">فروش</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right sm:text-left w-full sm:w-auto">
                                                        <div className="text-cherry-400 font-bold text-base sm:text-lg group-hover:text-cherry-300 transition-colors">
                                                            {formatPrice(product.revenue)}
                                                        </div>
                                                        <div className="text-gray-500 text-xs mt-0.5 sm:mt-1">درآمد</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Revenue by Hour Chart - Modern */}
                            <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 mb-6 sm:mb-8 shadow-xl">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                    فروش ساعتی (امروز)
                                </h4>
                                <div className="h-[200px] sm:h-[220px] md:h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockAnalytics.revenueByHour} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                        <defs>
                                            {mockAnalytics.revenueByHour.map((entry, index) => {
                                                const maxRevenue = Math.max(...mockAnalytics.revenueByHour.map(e => e.revenue));
                                                const intensity = entry.revenue / maxRevenue;
                                                return (
                                                    <linearGradient key={`hourGradient-${index}`} id={`hourGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9 + intensity * 0.1} />
                                                        <stop offset="50%" stopColor="#059669" stopOpacity={0.8 + intensity * 0.1} />
                                                        <stop offset="100%" stopColor="#047857" stopOpacity={0.7 + intensity * 0.1} />
                                                    </linearGradient>
                                                );
                                            })}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis 
                                            dataKey="hour" 
                                            stroke="#9ca3af"
                                            style={{ fontSize: '10px', fontWeight: '500' }}
                                            className="text-[10px] sm:text-xs"
                                            tickLine={false}
                                            axisLine={{ stroke: '#4b5563' }}
                                            label={{ 
                                                value: 'ساعت', 
                                                position: 'insideBottom', 
                                                offset: -3, 
                                                style: { fill: '#9ca3af', fontSize: '10px', fontWeight: '500' } 
                                            }}
                                        />
                                        <YAxis 
                                            stroke="#9ca3af"
                                            style={{ fontSize: '10px', fontWeight: '500' }}
                                            className="text-[10px] sm:text-xs"
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                            tickLine={false}
                                            axisLine={{ stroke: '#4b5563' }}
                                            width={40}
                                        />
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-2xl">
                                                            <p className="text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">
                                                                ساعت {data.hour}:00
                                                            </p>
                                                            <p className="text-xs sm:text-sm">
                                                                <span className="text-gray-400">فروش: </span>
                                                                <span className="text-green-400 font-bold">{formatPrice(data.revenue)}</span>
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar 
                                            dataKey="revenue" 
                                            radius={[8, 8, 0, 0]}
                                        >
                                            {mockAnalytics.revenueByHour.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={`url(#hourGradient-${index})`}
                                                    style={{ 
                                                        filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.4))',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            ))}
                                        </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                {[
                                    { Icon: PlusIcon, label: 'افزودن محصول', color: 'from-blue-500 to-cyan-600' },
                                    { Icon: ChartBarIcon, label: 'مشاهده گزارشات', color: 'from-purple-500 to-pink-600' },
                                    { Icon: CogIcon, label: 'تنظیمات', color: 'from-gray-600 to-gray-700' },
                                ].map((action, idx) => (
                                    <button
                                        key={idx}
                                        className={`bg-gradient-to-r ${action.color} text-white p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0`}
                                    >
                                        <action.Icon className="w-5 h-5 sm:w-6 sm:h-6 sm:mb-2" />
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section id="plans" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-cherry-50 via-purple-50 to-blue-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-4">پلن‌های مناسب برای شما</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">انتخاب کنید و شروع کنید</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-7 md:p-8 relative transform transition-all duration-300 hover:scale-105 ${
                                    plan.slug === 'professional' ? 'ring-2 sm:ring-4 ring-cherry-500 scale-100 sm:scale-105' : ''
                                }`}
                            >
                                {plan.slug === 'professional' && (
                                    <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cherry-600 to-purple-600 text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
                                        <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        محبوب‌ترین
                                    </div>
                                )}
                                
                                <div className="text-center mb-4 sm:mb-5 md:mb-6">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{plan.name}</h3>
                                    <p className="text-sm sm:text-base text-gray-600">{plan.description}</p>
                                </div>

                                <div className="text-center mb-6 sm:mb-7 md:mb-8">
                                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cherry-600 mb-1 sm:mb-2">
                                        {plan.price_monthly > 0 ? (
                                            <>
                                                {formatPrice(plan.price_monthly)}
                                                <span className="text-base sm:text-lg text-gray-600"> تومان</span>
                                            </>
                                        ) : (
                                            <span className="text-xl sm:text-2xl">رایگان</span>
                                        )}
                                    </div>
                                    {plan.price_monthly > 0 && (
                                        <div className="text-xs sm:text-sm text-gray-500">/ماه</div>
                                    )}
                                    {plan.price_yearly > 0 && (
                                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                            سالانه: {formatPrice(plan.price_yearly)} تومان
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-7 md:mb-8">
                                    {plan.features?.product_variants && (
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm sm:text-base text-gray-700">محصولات با variant</span>
                                        </li>
                                    )}
                                    {plan.features?.campaigns && (
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm sm:text-base text-gray-700">کمپین‌های تخفیف</span>
                                        </li>
                                    )}
                                    {plan.features?.analytics !== 'none' && (
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm sm:text-base text-gray-700">آمار و گزارش‌ها {plan.features?.analytics === 'advanced' && '(پیشرفته)'}</span>
                                        </li>
                                    )}
                                    {plan.features?.custom_domain && (
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm sm:text-base text-gray-700">دامنه سفارشی</span>
                                        </li>
                                    )}
                                    {plan.limits?.max_products && (
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm sm:text-base text-gray-700">تا {plan.limits.max_products.toLocaleString('fa-IR')} محصول</span>
                                        </li>
                                    )}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-3 sm:py-3.5 md:py-4 px-5 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 ${
                                        plan.slug === 'professional'
                                            ? 'bg-gradient-to-r from-cherry-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                    }`}
                                >
                                    انتخاب پلن
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modern Purchase Modal */}
            {showRegisterForm && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full my-auto shadow-2xl transform transition-all duration-300 scale-100">
                        {/* Header with Progress Steps */}
                        <div className="bg-gradient-to-r from-cherry-600 to-purple-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    {currentStep === 1 && 'انتخاب دوره پرداخت'}
                                    {currentStep === 2 && 'ثبت‌نام و ایجاد فروشگاه'}
                                    {currentStep === 3 && (registrationSuccess ? 'ثبت‌نام موفق' : 'پرداخت')}
                                </h2>
                                {!registrationSuccess && (
                                    <button
                                        onClick={closeModal}
                                        className="text-white hover:text-gray-200 text-xl sm:text-2xl flex-shrink-0 transition-colors"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            
                            {/* Progress Steps */}
                            <div className="flex items-center justify-center gap-2 sm:gap-4">
                                {(() => {
                                    const hasBothOptions = selectedPlan.price_monthly > 0 && selectedPlan.price_yearly > 0;
                                    const steps = hasBothOptions ? [1, 2, 3] : [2, 3];
                                    return steps.map((step, index) => {
                                        // For plans with only one option, show step numbers as 1, 2 instead of 2, 3
                                        const displayStep = hasBothOptions ? step : (step === 2 ? 1 : 2);
                                        return (
                                            <div key={step} className="flex items-center">
                                                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${
                                                    currentStep >= step 
                                                        ? 'bg-white text-cherry-600 scale-110 shadow-lg' 
                                                        : 'bg-white/30 text-white'
                                                }`}>
                                                    {currentStep > step ? '✓' : displayStep}
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 transition-all duration-300 ${
                                                        currentStep > step ? 'bg-white' : 'bg-white/30'
                                                    }`}></div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        <div className="p-5 sm:p-6 md:p-8">
                            {/* Step 1: Billing Cycle Selection */}
                            {currentStep === 1 && selectedPlan.price_monthly > 0 && selectedPlan.price_yearly > 0 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">پلن {selectedPlan.name}</h3>
                                        <p className="text-gray-600 text-sm sm:text-base">{selectedPlan.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setBillingCycle('monthly');
                                                setTimeout(() => setCurrentStep(2), 300);
                                            }}
                                            className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                                billingCycle === 'monthly'
                                                    ? 'border-cherry-500 bg-cherry-50 shadow-lg'
                                                    : 'border-gray-200 hover:border-cherry-300'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                                    {formatPrice(selectedPlan.price_monthly)}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-1">تومان</div>
                                                <div className="text-base font-semibold text-gray-700">ماهانه</div>
                                                {selectedPlan.price_yearly > 0 && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {formatPrice(selectedPlan.price_monthly * 12)} تومان در سال
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setBillingCycle('yearly');
                                                setTimeout(() => setCurrentStep(2), 300);
                                            }}
                                            className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 relative ${
                                                billingCycle === 'yearly'
                                                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                                                    : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            {selectedPlan.price_yearly > 0 && (
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-cherry-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    صرفه‌جویی {formatPrice((selectedPlan.price_monthly * 12) - selectedPlan.price_yearly)} تومان
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                                    {formatPrice(selectedPlan.price_yearly)}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-1">تومان</div>
                                                <div className="text-base font-semibold text-gray-700">سالانه</div>
                                                {selectedPlan.price_yearly > 0 && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {formatPrice(Math.round(selectedPlan.price_yearly / 12))} تومان در ماه
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all text-sm sm:text-base text-gray-700"
                                        >
                                            انصراف
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Registration Form */}
                            {currentStep === 2 && (
                                <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
                                    {/* Plan Summary */}
                                    <div className="bg-gradient-to-r from-cherry-50 to-purple-50 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-gray-900">{selectedPlan.name}</div>
                                                <div className="text-sm text-gray-600">{getBillingPeriod()}</div>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xl font-bold text-cherry-600">
                                                    {getPlanPrice() > 0 ? formatPrice(getPlanPrice()) : 'رایگان'}
                                                </div>
                                                {getPlanPrice() > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        {billingCycle === 'yearly' ? 'سالانه' : 'ماهانه'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    نام و نام خانوادگی
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cherry-500 focus:border-cherry-500 transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                    placeholder="مثال: علی احمدی"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    نام فروشگاه
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.shop_name}
                                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cherry-500 focus:border-cherry-500 transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                    placeholder="مثال: فروشگاه من"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    شناسه فروشگاه (subdomain)
                                </label>
                                <input
                                    type="text"
                                    required
                                    pattern="[a-z0-9\-]+"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '') })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cherry-500 focus:border-cherry-500 transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                    placeholder="my-shop"
                                />
                                <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                                    آدرس شما: <span className="font-semibold">{formData.slug || 'your-shop'}.yourdomain.com</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    شماره موبایل
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cherry-500 focus:border-cherry-500 transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                    placeholder="09123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    رمز عبور
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cherry-500 focus:border-cherry-500 transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                    placeholder="حداقل ۸ کاراکتر"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    تکرار رمز عبور
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cherry-500 focus:border-cherry-500 transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        {selectedPlan.price_monthly > 0 && selectedPlan.price_yearly > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleBackStep}
                                                className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all text-sm sm:text-base text-gray-700"
                                            >
                                                بازگشت
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className={`py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all text-sm sm:text-base text-gray-700 ${
                                                selectedPlan.price_monthly > 0 && selectedPlan.price_yearly > 0 ? 'flex-1' : 'flex-1'
                                            }`}
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-3 px-4 bg-gradient-to-r from-cherry-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    <span>در حال پردازش...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>ثبت‌نام و ایجاد فروشگاه</span>
                                                    {getPlanPrice() > 0 && (
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                                            {formatPrice(getPlanPrice())} تومان
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 3: Success/Payment */}
                            {currentStep === 3 && registrationSuccess && (
                                <div className="text-center space-y-6 animate-fadeIn">
                                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">فروشگاه شما با موفقیت ایجاد شد!</h3>
                                        <p className="text-gray-600 mb-4">
                                            {getPlanPrice() === 0 
                                                ? 'فروشگاه شما آماده استفاده است.'
                                                : 'لطفاً پرداخت را انجام دهید تا پلن شما فعال شود.'}
                                        </p>
                                    </div>
                                    {getPlanPrice() > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-2">مبلغ قابل پرداخت:</div>
                                            <div className="text-3xl font-bold text-cherry-600">{formatPrice(getPlanPrice())} تومان</div>
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        در حال هدایت به داشبورد...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to get theme color
const getThemeColor = (theme, colorKey, defaultValue) => {
    if (!theme.config) return defaultValue;
    if (typeof theme.config === 'string') {
        try {
            const parsed = JSON.parse(theme.config);
            return parsed[colorKey] || defaultValue;
        } catch {
            return defaultValue;
        }
    }
    return theme.config[colorKey] || defaultValue;
};

// Default Theme Preview Component
function DefaultThemePreview({ theme, formatPrice }) {
    const primaryColor = getThemeColor(theme, 'primary_color', '#3b82f6');
    
    return (
        <div className="p-4 sm:p-6 md:p-8 bg-white">
            <div className="max-w-5xl mx-auto">
                {/* Classic Header */}
                <header className="bg-white border-b-2 mb-4 sm:mb-6 md:mb-8 pb-4 sm:pb-5 md:pb-6" style={{ borderColor: primaryColor }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: primaryColor }}>فروشگاه نمونه</h1>
                            <p className="text-gray-600 text-xs sm:text-sm">بهترین محصولات با بهترین قیمت</p>
                        </div>
                        <nav className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm">خانه</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm">محصولات</a>
                            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm">درباره ما</a>
                        </nav>
                    </div>
                </header>

                {/* Hero Banner */}
                <div className="mb-4 sm:mb-6 md:mb-8 rounded-lg overflow-hidden" style={{ backgroundColor: primaryColor + '15' }}>
                    <div className="p-4 sm:p-6 md:p-8 text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: primaryColor }}>فروش ویژه</h2>
                        <p className="text-sm sm:text-base text-gray-700">تخفیف ۵۰٪ روی تمام محصولات</p>
                    </div>
                </div>

                {/* Products Grid - Classic Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all" style={{ borderColor: primaryColor + '40' }}>
                            <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <span className="text-gray-400 text-xs sm:text-sm">تصویر محصول</span>
                            </div>
                            <div className="p-3 sm:p-4">
                                <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">محصول نمونه {i}</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">توضیحات کوتاه محصول</p>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                    <span className="text-lg sm:text-xl font-bold" style={{ color: primaryColor }}>
                                        {formatPrice(150000 + i * 50000)}
                                    </span>
                                    <button 
                                        className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        افزودن
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Modern Theme Preview Component
function ModernThemePreview({ theme, formatPrice }) {
    const primaryColor = getThemeColor(theme, 'primary_color', '#10b981');
    
    return (
        <div className="p-4 sm:p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
            <div className="max-w-5xl mx-auto">
                {/* Modern Header with Gradient */}
                <header className="mb-4 sm:mb-6 md:mb-8">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r bg-clip-text text-transparent" 
                                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #059669)` }}>
                                    فروشگاه مدرن
                                </h1>
                                <p className="text-gray-600 text-xs sm:text-sm">تجربه خرید مدرن و راحت</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white" 
                                     style={{ backgroundColor: primaryColor }}>
                                    <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Large Hero Card */}
                <div className="mb-4 sm:mb-6 md:mb-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 sm:p-8 md:p-12 text-center text-white relative overflow-hidden"
                         style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #059669 100%)` }}>
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">فروش ویژه تابستان</h2>
                            <p className="text-base sm:text-lg md:text-xl opacity-90">تا ۷۰٪ تخفیف</p>
                        </div>
                    </div>
                </div>

                {/* Products Grid - Modern Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                                    <div className="h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400 text-xs sm:text-sm">تصویر محصول</span>
                                    </div>
                                    <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-white rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                                        <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 md:p-5">
                                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">محصول نمونه {i}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">توضیحات کوتاه محصول با جزئیات بیشتر</p>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                        <div>
                                            <span className="text-xl sm:text-2xl font-bold block" style={{ color: primaryColor }}>
                                                {formatPrice(150000 + i * 50000)}
                                            </span>
                                            <span className="text-xs text-gray-500 line-through">{formatPrice(200000 + i * 50000)}</span>
                                        </div>
                                        <button 
                                            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                                            style={{ background: `linear-gradient(135deg, ${primaryColor}, #059669)` }}
                                        >
                                            خرید
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Minimal Theme Preview Component
function MinimalThemePreview({ theme, formatPrice }) {
    const primaryColor = getThemeColor(theme, 'primary_color', '#6366f1');
    
    return (
        <div className="p-4 sm:p-6 md:p-8 bg-white">
            <div className="max-w-4xl mx-auto">
                {/* Minimal Header */}
                <header className="mb-6 sm:mb-8 md:mb-12 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-light mb-1 sm:mb-2 tracking-wide" style={{ color: primaryColor }}>
                        فروشگاه مینیمال
                    </h1>
                    <div className="w-16 sm:w-20 md:w-24 h-0.5 mx-auto mb-2 sm:mb-3 md:mb-4" style={{ backgroundColor: primaryColor }}></div>
                    <p className="text-gray-500 text-xs sm:text-sm">سادگی و زیبایی</p>
                </header>

                {/* Minimal Navigation */}
                <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 border-b border-gray-200 pb-3 sm:pb-4">
                    <a href="#" className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-light">خانه</a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-light">محصولات</a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-light">درباره</a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-light">تماس</a>
                </nav>

                {/* Minimal Products - List Style */}
                <div className="space-y-6 sm:space-y-7 md:space-y-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 pb-6 sm:pb-7 md:pb-8 border-b border-gray-100 last:border-0">
                            <div className="w-full sm:w-32 md:w-40 lg:w-48 h-32 sm:h-36 md:h-44 lg:h-48 bg-gray-100 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                                <span className="text-gray-400 text-xs">تصویر</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-light mb-1 sm:mb-2 text-gray-900">محصول نمونه {i}</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                        توضیحات کوتاه محصول با طراحی مینیمال و فضای خالی مناسب
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                    <span className="text-xl sm:text-2xl font-light" style={{ color: primaryColor }}>
                                        {formatPrice(150000 + i * 50000)}
                                    </span>
                                    <button 
                                        className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 border-2 font-light text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                                        style={{ borderColor: primaryColor, color: primaryColor }}
                                    >
                                        افزودن به سبد
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Minimal Footer */}
                <footer className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-7 md:pt-8 text-center border-t border-gray-200">
                    <p className="text-gray-400 text-xs">© ۱۴۰۳ فروشگاه مینیمال</p>
                </footer>
            </div>
        </div>
    );
}

export default LandingPage;
