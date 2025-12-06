import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { useTranslation } from 'react-i18next';

function AppContent() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen">
            {/* Hero Section Demo */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-8">
                        {/* Badge */}
                        {/* <div className="inline-block">
                            <span className="badge badge-lg px-4 py-2 text-white font-semibold" style={{ backgroundColor: '#f06292' }}>
                                Professional & Modern
                            </span>
                        </div> */}

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            <span style={{ color: '#1E293B' }}>Discover Your Next</span>
                            <span className="block mt-2" style={{ color: '#6B8E6B' }}>Great Read</span>
                        </h1>

                        {/* Description */}
                        <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#2d3748' }}>
                            Explore thousands of books, both physical and digital.
                            From bestsellers to hidden gems, find your perfect story.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <button className="btn btn-lg px-8 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{
                                backgroundColor: '#1E293B',
                                color: '#ffffff',
                                border: 'none'
                            }}>
                                Browse Books
                            </button>
                            <button className="btn btn-lg px-8 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105" style={{
                                backgroundColor: '#6B8E6B',
                                color: '#ffffff',
                                border: 'none'
                            }}>
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12" style={{ borderTop: '1px solid #e2e8f0' }}>
                            <div className="stat rounded-lg shadow-sm p-6 bg-white">
                                <div className="stat-value text-3xl font-bold" style={{ color: '#1E293B' }}>10K+</div>
                                <div className="stat-title" style={{ color: '#2d3748' }}>Books Available</div>
                            </div>
                            <div className="stat rounded-lg shadow-sm p-6 bg-white">
                                <div className="stat-value text-3xl font-bold" style={{ color: '#6B8E6B' }}>50K+</div>
                                <div className="stat-title" style={{ color: '#2d3748' }}>Happy Readers</div>
                            </div>
                            <div className="stat rounded-lg shadow-sm p-6 bg-white">
                                <div className="stat-value text-3xl font-bold" style={{ color: '#1E293B' }}>4.8★</div>
                                <div className="stat-title" style={{ color: '#2d3748' }}>Average Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Color Palette Demo Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: '#1e293b' }}>
                            Color Palette Preview
                        </h2>
                        <p style={{ color: '#2d3748' }}>
                            Professional muted colors from the palette
                        </p>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <div className="w-32 h-32 rounded-lg shadow-md" style={{ backgroundColor: '#1e293b' }}>
                            <div className="h-full flex items-end p-2">
                                <span className="text-white text-xs font-semibold">Primary</span>
                            </div>
                        </div>
                        <div className="w-32 h-32 rounded-lg shadow-md" style={{ backgroundColor: '#64748b' }}>
                            <div className="h-full flex items-end p-2">
                                <span className="text-white text-xs font-semibold">Secondary</span>
                            </div>
                        </div>
                        <div className="w-32 h-32 rounded-lg shadow-md" style={{ backgroundColor: '#6b8e6b' }}>
                            <div className="h-full flex items-end p-2">
                                <span className="text-white text-xs font-semibold">Accent</span>
                            </div>
                        </div>
                        <div className="w-32 h-32 rounded-lg shadow-md border border-gray-200" style={{ backgroundColor: '#EFECE3' }}>
                            <div className="h-full flex items-end p-2">
                                <span className="text-gray-600 text-xs font-semibold">Base</span>
                            </div>
                        </div>
                    </div>

                    {/* Button Examples */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{
                            backgroundColor: '#1E293B',
                            color: '#ffffff',
                            border: 'none'
                        }}>
                            Primary Button
                        </button>
                        <button className="btn font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{
                            backgroundColor: '#64748b',
                            color: '#ffffff',
                            border: 'none'
                        }}>
                            Secondary Button
                        </button>
                        <button className="btn font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{
                            backgroundColor: '#6B8E6B',
                            color: '#ffffff',
                            border: 'none'
                        }}>
                            Accent Button
                        </button>
                        <button className="btn font-semibold shadow-md hover:shadow-lg transition-all" style={{
                            backgroundColor: '#EFECE3',
                            color: '#1E293B',
                            border: '2px solid #1E293B'
                        }}>
                            Outline Primary
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;

