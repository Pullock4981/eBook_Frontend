/**
 * Home Page Component
 * Main landing page with hero section and product sections
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { fetchDashboardStats, selectDashboardOverview, selectDashboardOrders, selectDashboardRevenue, selectDashboardProducts, selectDashboardLoading } from '../store/slices/adminSlice';
import { useThemeColors } from '../hooks/useThemeColors';
import HomeSection from '../components/home/HomeSection';
import Loading from '../components/common/Loading';
import UserAnalyticsChart from '../components/admin/UserAnalyticsChart';
import ProductAnalyticsChart from '../components/admin/ProductAnalyticsChart';
import PaymentAnalyticsChart from '../components/admin/PaymentAnalyticsChart';
import * as homeService from '../services/homeService';

function Home() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const isAdmin = user?.role === 'admin';
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

    // Admin dashboard data
    const overview = useSelector(selectDashboardOverview);
    const orders = useSelector(selectDashboardOrders);
    const revenue = useSelector(selectDashboardRevenue);
    const products = useSelector(selectDashboardProducts);
    const isLoadingAdmin = useSelector(selectDashboardLoading);

    // State for regular user product sections (only Favourited and Frequently Downloaded)
    const [favourited, setFavourited] = useState([]);
    const [frequentlyDownloaded, setFrequentlyDownloaded] = useState([]);

    // Loading states
    const [loadingFavourited, setLoadingFavourited] = useState(true);
    const [loadingFrequentlyDownloaded, setLoadingFrequentlyDownloaded] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            // Fetch admin dashboard stats
            dispatch(fetchDashboardStats());
        } else {
            // Fetch regular user product sections (only Favourited and Frequently Downloaded)
            const fetchSections = async () => {
                try {
                    // Fetch only Favourited and Frequently Downloaded sections
                    const [
                        favouritedData,
                        frequentlyDownloadedData
                    ] = await Promise.allSettled([
                        isAuthenticated ? homeService.getFavourited(3) : Promise.resolve({ success: true, data: [] }),
                        homeService.getFrequentlyDownloaded(3)
                    ]);

                    // Favourited
                    if (favouritedData.status === 'fulfilled' && favouritedData.value.success) {
                        setFavourited(favouritedData.value.data || []);
                    }
                    setLoadingFavourited(false);

                    // Frequently Downloaded
                    if (frequentlyDownloadedData.status === 'fulfilled' && frequentlyDownloadedData.value.success) {
                        setFrequentlyDownloaded(frequentlyDownloadedData.value.data || []);
                    }
                    setLoadingFrequentlyDownloaded(false);
                } catch (error) {
                    console.error('Error fetching home sections:', error);
                    setLoadingFavourited(false);
                    setLoadingFrequentlyDownloaded(false);
                }
            };

            fetchSections();
        }
    }, [isAuthenticated, isAdmin, dispatch]);

    return (
        <div className="w-full" style={{ backgroundColor }}>
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-6 sm:space-y-8">
                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            <span style={{ color: primaryTextColor }}>{t('home.discoverYourNext') || 'Discover Your Next'}</span>
                            <span className="block mt-2" style={{ color: '#6B8E6B' }}>{t('home.greatRead') || 'Great Read'}</span>
                        </h1>

                        {/* Description */}
                        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-4" style={{ color: secondaryTextColor }}>
                            {t('home.description') || 'Explore thousands of books, both physical and digital. From bestsellers to hidden gems, find your perfect story.'}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 px-4">
                            {isAdmin ? (
                                <Link
                                    to="/admin"
                                    className="btn btn-lg px-6 sm:px-8 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto text-white"
                                    style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                                >
                                    {t('home.startAsAdmin') || 'Start as Admin'}
                                </Link>
                            ) : (
                                <Link
                                    to="/register"
                                    className="btn btn-lg px-6 sm:px-8 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto text-white"
                                    style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                                >
                                    {t('home.getStarted') || 'Get Started'}
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t" style={{ borderColor: '#e2e8f0' }}>
                            <div className="stat rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-base-200">
                                <div className="stat-value text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>10K+</div>
                                <div className="stat-title text-sm sm:text-base" style={{ color: secondaryTextColor }}>{t('home.booksAvailable') || 'Books Available'}</div>
                            </div>
                            <div className="stat rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-base-200">
                                <div className="stat-value text-2xl sm:text-3xl font-bold" style={{ color: '#6B8E6B' }}>50K+</div>
                                <div className="stat-title text-sm sm:text-base" style={{ color: secondaryTextColor }}>{t('home.happyReaders') || 'Happy Readers'}</div>
                            </div>
                            <div className="stat rounded-lg shadow-sm p-4 sm:p-6 bg-white dark:bg-base-200">
                                <div className="stat-value text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>4.8★</div>
                                <div className="stat-title text-sm sm:text-base" style={{ color: secondaryTextColor }}>{t('home.averageRating') || 'Average Rating'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Conditional Content Based on User Role */}
            {isAdmin ? (
                /* Admin Analytics Section */
                <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-7xl">
                        {isLoadingAdmin ? (
                            <div className="flex justify-center items-center py-20">
                                <Loading />
                            </div>
                        ) : (
                            <div className="space-y-6 sm:space-8">
                                {/* User Analytics Chart */}
                                <UserAnalyticsChart overview={overview} />

                                {/* Product Analytics Chart */}
                                <ProductAnalyticsChart products={products} overview={overview} />

                                {/* Payment & Revenue Analytics Chart */}
                                <PaymentAnalyticsChart revenue={revenue} orders={orders} />
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                /* Regular User Product Sections - Only Favourited and Frequently Downloaded */
                <>
                    {/* Favourited Section */}
                    {isAuthenticated && (
                        <HomeSection
                            titleKey="home.sections.favourited"
                            products={favourited}
                            seeMoreLink="/products?section=favourited"
                            loading={loadingFavourited}
                        />
                    )}

                    {/* Frequently Downloaded Section */}
                    <HomeSection
                        titleKey="home.sections.frequentlyDownloaded"
                        products={frequentlyDownloaded}
                        seeMoreLink="/products?section=frequently-downloaded"
                        loading={loadingFrequentlyDownloaded}
                    />
                </>
            )}
        </div>
    );
}

export default Home;

