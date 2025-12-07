/**
 * Product Gallery Component
 * 
 * Image gallery for product detail page with zoom functionality
 */

import { useState } from 'react';

function ProductGallery({ images, productName }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] bg-base-200 rounded-lg flex items-center justify-center p-0">
                <span className="text-3xl sm:text-4xl opacity-50">📚</span>
            </div>
        );
    }

    const mainImage = images[selectedImage] || images[0];

    return (
        <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Main Image - Match height with product info section */}
            <div className="relative w-full bg-base-200 rounded-lg overflow-hidden group p-0 m-0 h-full">
                <img
                    src={mainImage}
                    alt={productName || 'Product'}
                    className="w-full h-full object-cover cursor-zoom-in block"
                    onClick={() => setIsZoomed(!isZoomed)}
                    loading="lazy"
                    style={{ display: 'block', margin: 0, padding: 0, width: '100%', height: '100%' }}
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                />
                {/* Zoom Indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="badge badge-primary badge-sm text-white text-xs">
                        Click to zoom
                    </div>
                </div>
            </div>

            {/* Thumbnail Images - Responsive grid */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2 sm:gap-2.5">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                ? 'border-primary scale-105'
                                : 'border-transparent hover:border-base-300'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${productName} - ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {isZoomed && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            type="button"
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
                            aria-label="Close zoom"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <img
                            src={mainImage}
                            alt={productName || 'Product'}
                            className="max-w-full max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductGallery;

