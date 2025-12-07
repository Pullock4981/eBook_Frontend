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
            <div className="w-full h-96 bg-base-200 rounded-lg flex items-center justify-center">
                <span className="text-4xl opacity-50">📚</span>
            </div>
        );
    }

    const mainImage = images[selectedImage] || images[0];

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-base-200 rounded-lg overflow-hidden group">
                <img
                    src={mainImage}
                    alt={productName || 'Product'}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setIsZoomed(!isZoomed)}
                    loading="lazy"
                />
                {/* Zoom Indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="badge badge-primary text-white">
                        Click to zoom
                    </div>
                </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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

