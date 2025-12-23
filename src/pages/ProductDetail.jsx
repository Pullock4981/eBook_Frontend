/**
 * Product Detail Page
 * 
 * Detailed product information page
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchProductBySlug, selectCurrentProduct, selectIsLoading, selectError, clearCurrentProduct } from '../store/slices/productSlice';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { addItemToCart, selectCartItems, fetchCart } from '../store/slices/cartSlice';
import { deleteProduct } from '../services/adminService';
import { checkeBookAccess } from '../services/ebookService';
import ProductGallery from '../components/products/ProductGallery';
import Loading from '../components/common/Loading';
import { formatCurrency, calculateDiscount } from '../utils/helpers';
import { PRODUCT_TYPES } from '../utils/constants';
import { useThemeColors } from '../hooks/useThemeColors';

function ProductDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const product = useSelector(selectCurrentProduct);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const cartItems = useSelector(selectCartItems);

    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [addToCartError, setAddToCartError] = useState(null);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    // Initialize hasEBookAccess as false - only set to true if explicitly confirmed
    const [hasEBookAccess, setHasEBookAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(false);
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor, successColor, infoColor } = useThemeColors();

    // Track the current product ID for which views have been incremented
    // This prevents double incrementing in React StrictMode (development)
    // Use sessionStorage with timestamp to persist across component remounts
    const VIEW_INCREMENT_KEY = 'productViewsIncremented';
    const VIEW_INCREMENT_TIMEOUT = 2000; // 2 seconds - prevent rapid double clicks
    
    const getViewsIncremented = () => {
        try {
            const data = sessionStorage.getItem(VIEW_INCREMENT_KEY);
            if (!data) return null;
            const { productId, timestamp } = JSON.parse(data);
            // Check if timestamp is still valid (within timeout)
            const now = Date.now();
            if (now - timestamp < VIEW_INCREMENT_TIMEOUT) {
                return productId;
            }
            // Timestamp expired, clear it
            clearViewsIncremented();
            return null;
        } catch {
            return null;
        }
    };
    
    const setViewsIncremented = (productId) => {
        try {
            const data = {
                productId,
                timestamp: Date.now()
            };
            sessionStorage.setItem(VIEW_INCREMENT_KEY, JSON.stringify(data));
        } catch {
            // Ignore if sessionStorage is not available
        }
    };
    
    const clearViewsIncremented = () => {
        try {
            sessionStorage.removeItem(VIEW_INCREMENT_KEY);
        } catch {
            // Ignore if sessionStorage is not available
        }
    };

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    // Check product type (must be defined before use in useEffect)
    const isDigital = product?.type === PRODUCT_TYPES.DIGITAL;
    const isPhysical = product?.type === PRODUCT_TYPES.PHYSICAL;

    useEffect(() => {
        if (id) {
            // Clean ID
            const cleanId = String(id).trim();

            // Debug log
            if (import.meta.env.DEV) {
                console.log('🔍 ProductDetail - ID from URL:', id);
                console.log('🔍 ProductDetail - Clean ID:', cleanId);
                console.log('🔍 ProductDetail - ID Length:', cleanId.length);
                console.log('🔍 ProductDetail - Is ObjectId:', /^[0-9a-fA-F]{24}$/.test(cleanId));
            }

            // Check if views have already been incremented for this product ID in this session
            // This prevents double incrementing in React StrictMode (development)
            const incrementedProductId = getViewsIncremented();
            const hasIncremented = incrementedProductId === cleanId;
            
            // Check if it's a MongoDB ObjectId (24 hex characters) or a slug
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);

            if (!hasIncremented) {
                // Mark as incremented BEFORE dispatching to prevent race conditions
                setViewsIncremented(cleanId);

                if (isObjectId) {
                    // It's an ObjectId, fetch by ID with view increment
                    dispatch(fetchProductById({ id: cleanId, incrementViews: true }));
                } else {
                    // It's a slug, fetch by slug with view increment
                    dispatch(fetchProductBySlug({ slug: cleanId, incrementViews: true }));
                }
            } else {
                // Views already incremented for this ID in this session, fetch without incrementing
                if (isObjectId) {
                    dispatch(fetchProductById({ id: cleanId, incrementViews: false }));
                } else {
                    dispatch(fetchProductBySlug({ slug: cleanId, incrementViews: false }));
                }
            }
        } else {
            console.error('❌ No product ID in URL');
        }

        return () => {
            // Clean up when ID changes or component unmounts
            // Clear the sessionStorage entry for this product so views can increment again
            // if user navigates away and comes back to the same product
            if (id) {
                const cleanId = String(id).trim();
                const incrementedProductId = getViewsIncremented();
                if (incrementedProductId === cleanId) {
                    // Only clear if it's the same product - this allows incrementing again on revisit
                    clearViewsIncremented();
                }
            }
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id]);

    // Fetch cart when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    // Check if product is in cart
    const isProductInCart = () => {
        if (!product || !cartItems || cartItems.length === 0) {
            return false;
        }
        const productId = String(product.id || product._id);
        return cartItems.some(item => {
            const itemProductId = item.product?._id 
                ? String(item.product._id) 
                : String(item.product);
            return itemProductId === productId;
        });
    };

    // Check if actually purchased (not just in cart)
    const [isActuallyPurchased, setIsActuallyPurchased] = useState(false);

    // Check if user has eBook access (for digital products)
    // Access granted if: 1) Actually purchased, OR 2) Product is in cart (since payment system not implemented yet)
    useEffect(() => {
        const checkAccess = async () => {
            // Reset to false first
            setHasEBookAccess(false);
            
            // Only check if user is authenticated, product exists, and is digital
            if (!isAuthenticated || !product || !isDigital) {
                return;
            }

            setCheckingAccess(true);
            try {
                const productId = product.id || product._id;
                if (productId) {
                    // Check if actually purchased
                    const hasPurchased = await checkeBookAccess(productId);
                    setIsActuallyPurchased(hasPurchased === true);
                    
                    // Check if product is in cart (temporary access until payment is implemented)
                    const inCart = isProductInCart();
                    
                    // Grant access if purchased OR in cart
                    setHasEBookAccess(hasPurchased === true || inCart === true);
                } else {
                    setHasEBookAccess(false);
                    setIsActuallyPurchased(false);
                }
            } catch (error) {
                // On any error, check if in cart as fallback
                const inCart = isProductInCart();
                setHasEBookAccess(inCart === true);
                setIsActuallyPurchased(false);
            } finally {
                setCheckingAccess(false);
            }
        };

        checkAccess();
    }, [isAuthenticated, product, isDigital, cartItems]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    // Debug logs
    if (import.meta.env.DEV) {
        console.log('🔍 ProductDetail - Current State:', {
            id,
            isLoading,
            error,
            hasProduct: !!product,
            product: product ? { _id: product._id, name: product.name } : null
        });
    }

    if (error || (!isLoading && !product)) {
        return (
            <div className="flex items-center justify-center py-12" style={{ backgroundColor }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('products.notFound') || 'Product Not Found'}
                    </h2>
                    <p className="text-base opacity-70 mb-4" style={{ color: secondaryTextColor }}>
                        {error || t('products.notFoundDescription') || 'The product you are looking for does not exist.'}
                    </p>
                    {import.meta.env.DEV && (
                        <div className="text-xs opacity-50 mb-4" style={{ color: secondaryTextColor }}>
                            ID: {id} | Error: {error || 'No error message'}
                        </div>
                    )}
                    <Link
                        to="/products"
                        className="btn btn-primary text-white"
                        style={{ backgroundColor: buttonColor }}
                    >
                        {t('products.backToProducts') || 'Back to Products'}
                    </Link>
                </div>
            </div>
        );
    }

    const discountPercentage = product.discountPrice
        ? calculateDiscount(product.price, product.discountPrice)
        : 0;

    const displayPrice = product.discountPrice || product.price;

    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-xs sm:text-sm mb-4 sm:mb-6">
                    <ul>
                        <li>
                            <Link to="/" style={{ color: primaryTextColor }}>
                                {t('nav.home') || 'Home'}
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" style={{ color: primaryTextColor }}>
                                {t('nav.products') || 'Products'}
                            </Link>
                        </li>
                        {product.category && (
                            <li>
                                <Link
                                    to={`/products?category=${product.category._id}`}
                                    style={{ color: primaryTextColor }}
                                >
                                    {product.category.name}
                                </Link>
                            </li>
                        )}
                        <li style={{ color: primaryTextColor }}>{product.name}</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
                    {/* Left Column - Images */}
                    <div className="w-full flex">
                        <ProductGallery images={product.images || []} productName={product.name} />
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full flex flex-col">
                        {/* Category */}
                        {product.category && (
                            <div className="badge badge-outline" style={{ borderColor: buttonColor, color: buttonColor }}>
                                {product.category.name}
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: primaryTextColor }}>
                            {product.name}
                        </h1>

                        {/* Price Section */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                            <span className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                {formatCurrency(displayPrice)}
                            </span>
                            {product.discountPrice && (
                                <>
                                    <span className="text-lg sm:text-xl line-through opacity-50" style={{ color: secondaryTextColor }}>
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className="badge badge-error badge-sm sm:badge-md text-white">
                                        -{discountPercentage}% {t('products.off') || 'OFF'}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Type and Stock Info */}
                        <div className="flex flex-wrap gap-2">
                            {isPhysical && (
                                <div className="badge badge-primary text-white">
                                    {t('products.physical') || 'Physical Book'}
                                </div>
                            )}
                            {isDigital && (
                                <div className="badge badge-secondary text-white">
                                    {t('products.digital') || 'Digital eBook'}
                                </div>
                            )}
                            {product.isFeatured && (
                                <div className="badge badge-warning text-white">
                                    {t('products.featured') || 'Featured'}
                                </div>
                            )}
                            {isPhysical && product.stock !== undefined && (
                                <div
                                    className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'} text-white`}
                                >
                                    {product.stock > 0
                                        ? `${t('products.inStock') || 'In Stock'} (${product.stock})`
                                        : t('products.outOfStock') || 'Out of Stock'}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: primaryTextColor }}>
                                    {t('products.description') || 'Description'}
                                </h2>
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: secondaryTextColor }}>
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="divider"></div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.views > 0 && (
                                <div>
                                    <span className="opacity-70">{t('products.views') || 'Views'}:</span>
                                    <span className="font-semibold ml-2">{product.views}</span>
                                </div>
                            )}
                            {isDigital && product.fileSize && (
                                <div>
                                    <span className="opacity-70">{t('products.fileSize') || 'File Size'}:</span>
                                    <span className="font-semibold ml-2">
                                        {(product.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2" style={{ color: primaryTextColor }}>
                                    {t('products.tags') || 'Tags'}:
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-outline"
                                            style={{ borderColor: buttonColor, color: buttonColor }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isAdmin && product?._id ? (
                            /* Admin Actions */
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <Link
                                    to={`/admin/products/${product._id}/edit`}
                                    className="btn btn-primary btn-md sm:btn-lg flex-grow text-white shadow-lg hover:shadow-xl transition-all"
                                    style={{ backgroundColor: buttonColor }}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    {t('common.edit') || 'Edit Product'}
                                </Link>
                                <button
                                    className="btn btn-error btn-md sm:btn-lg text-white shadow-lg hover:shadow-xl transition-all flex-shrink-0"
                                    style={{ backgroundColor: errorColor, minWidth: '140px' }}
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            <span className="ml-2">{t('common.deleting') || 'Deleting...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            <span className="ml-2">{t('common.delete') || 'Delete Product'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            /* User Actions */
                            <>
                                {/* Digital Product - Read Now or Add to Cart */}
                                {isDigital ? (
                                    <div className="flex flex-col gap-3 sm:gap-4 pt-4">
                                        {/* Read Now Button - NO CONDITIONS - Just show PDF */}
                                        <button
                                            onClick={() => navigate(`/ebooks/viewer/${product.id || product._id}`)}
                                            className="btn btn-success btn-md sm:btn-lg flex-grow text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                                            style={{
                                                backgroundColor: successColor,
                                                fontWeight: '600'
                                            }}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <span className="ml-2">{t('ebooks.readNow') || 'Read Now'}</span>
                                        </button>
                                        
                                        {/* Add to Cart Button - Always show */}
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <button
                                                className="btn btn-primary btn-md sm:btn-lg flex-grow text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                                                style={{ backgroundColor: buttonColor }}
                                                disabled={isAddingToCart || checkingAccess}
                                                onClick={async () => {
                                                    if (!isAuthenticated) {
                                                        navigate('/login');
                                                        return;
                                                    }

                                                    if (!product?._id) {
                                                        setAddToCartError(t('cart.productNotFound') || 'Product not found');
                                                        return;
                                                    }

                                                    setIsAddingToCart(true);
                                                    setAddToCartError(null);
                                                    setAddToCartSuccess(false);
                                                    try {
                                                        await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
                                                        // Refresh cart to update access status (product in cart = can read PDF)
                                                        await dispatch(fetchCart());
                                                        setAddToCartSuccess(true);
                                                        setTimeout(() => setAddToCartSuccess(false), 3000);
                                                    } catch (error) {
                                                        const errorMessage = error?.message || error || t('cart.addToCartError') || 'Failed to add to cart';
                                                        setAddToCartError(errorMessage);
                                                    } finally {
                                                        setIsAddingToCart(false);
                                                    }
                                                }}
                                            >
                                                {isAddingToCart ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-sm"></span>
                                                        <span className="ml-2">{t('cart.adding') || 'Adding...'}</span>
                                                    </>
                                                ) : addToCartSuccess ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="ml-2">{t('cart.addedToCart') || 'Added to Cart!'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span className="ml-2">{t('products.addToCart') || 'Add to Cart'}</span>
                                                    </>
                                                )}
                                            </button>
                                            
                                            {/* Show loading state while checking access */}
                                            {checkingAccess && (
                                                <div className="flex items-center justify-center">
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    <span className="ml-2 text-sm opacity-70">{t('common.checking') || 'Checking...'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Physical Product - Add to Cart */
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                        <button
                                            className="btn btn-primary btn-md sm:btn-lg flex-grow text-white shadow-lg hover:shadow-xl transition-all"
                                            style={{ backgroundColor: buttonColor }}
                                            disabled={isAddingToCart || !isAuthenticated}
                                            onClick={async () => {
                                                if (!isAuthenticated) {
                                                    navigate('/login');
                                                    return;
                                                }

                                                // Check stock before adding
                                                if (product.stock === 0) {
                                                    setAddToCartError(t('products.outOfStockMessage') || 'This product is currently out of stock.');
                                                    return;
                                                }

                                                if (!product?._id) {
                                                    setAddToCartError(t('cart.productNotFound') || 'Product not found');
                                                    return;
                                                }

                                                setIsAddingToCart(true);
                                                setAddToCartError(null);
                                                setAddToCartSuccess(false);
                                                try {
                                                    await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
                                                    // Refresh cart to update access status (product in cart = can read PDF)
                                                    await dispatch(fetchCart());
                                                    setAddToCartSuccess(true);
                                                    setTimeout(() => setAddToCartSuccess(false), 3000);
                                                } catch (error) {
                                                    const errorMessage = error?.message || error || t('cart.addToCartError') || 'Failed to add to cart';
                                                    setAddToCartError(errorMessage);
                                                } finally {
                                                    setIsAddingToCart(false);
                                                }
                                            }}
                                        >
                                            {isAddingToCart ? (
                                                <>
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    <span className="ml-2">{t('cart.adding') || 'Adding...'}</span>
                                                </>
                                            ) : addToCartSuccess ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="ml-2">{t('cart.addedToCart') || 'Added to Cart!'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span className="ml-2">{t('products.addToCart') || 'Add to Cart'}</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="btn btn-outline btn-md sm:btn-lg"
                                            style={{ borderColor: buttonColor, color: buttonColor }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = buttonColor;
                                                e.currentTarget.style.color = '#ffffff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = buttonColor;
                                            }}
                                        >
                                            {t('products.wishlist') || 'Wishlist'}
                                        </button>
                                    </div>
                                )}

                                {/* Success Message */}
                                {addToCartSuccess && (
                                    <div className="alert alert-success">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t('cart.addedToCartSuccess') || 'Product added to cart successfully!'}</span>
                                        <Link to="/cart" className="btn btn-sm btn-success text-white">
                                            {t('cart.viewCart') || 'View Cart'}
                                        </Link>
                                    </div>
                                )}

                                {/* Error Message */}
                                {addToCartError && (
                                    <div className="alert alert-error mt-2">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="text-sm sm:text-base">{addToCartError}</span>
                                    </div>
                                )}

                                {/* Out of Stock Message */}
                                {isPhysical && product.stock === 0 && (
                                    <div className="alert alert-warning mt-2">
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                        <span className="text-sm sm:text-base">{t('products.outOfStockMessage') || 'This product is currently out of stock.'}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Delete Confirmation Modal */}
                        {showDeleteConfirm && (
                            <div className="modal modal-open">
                                <div className="modal-box" style={{ backgroundColor }}>
                                    <h3 className="font-bold text-lg mb-4" style={{ color: primaryTextColor }}>
                                        {t('admin.confirmDelete') || 'Confirm Delete'}
                                    </h3>
                                    <p className="py-4" style={{ color: secondaryTextColor }}>
                                        {t('admin.confirmDeleteMessage') || 'Are you sure you want to delete this product? This action cannot be undone.'}
                                    </p>
                                    <div className="modal-action gap-2">
                                        <button
                                            className="btn"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                            style={{ 
                                                borderColor: secondaryTextColor, 
                                                color: primaryTextColor,
                                                backgroundColor: 'transparent',
                                                borderWidth: '1px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            {t('common.cancel') || 'Cancel'}
                                        </button>
                                        <button
                                            className="btn text-white"
                                            onClick={async () => {
                                                if (!product?._id) {
                                                    showError(t('admin.productNotFound') || 'Product not found');
                                                    return;
                                                }
                                                try {
                                                    setIsDeleting(true);
                                                    await deleteProduct(product._id);
                                                    // Show success message
                                                    showSuccess(t('admin.deleteSuccess') || 'Product deleted successfully');
                                                    // Navigate to products list
                                                    navigate('/admin/products');
                                                } catch (error) {
                                                    console.error('Delete error:', error);
                                                    const errorMessage = error?.response?.data?.message || error?.message || t('admin.deleteError') || 'Failed to delete product';
                                                    showError(errorMessage);
                                                    setIsDeleting(false);
                                                    setShowDeleteConfirm(false);
                                                }
                                            }}
                                            disabled={isDeleting}
                                            style={{ 
                                                backgroundColor: '#EF4444',
                                                borderColor: '#EF4444',
                                                color: '#ffffff'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.backgroundColor = '#DC2626';
                                                    e.currentTarget.style.borderColor = '#DC2626';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.backgroundColor = '#EF4444';
                                                    e.currentTarget.style.borderColor = '#EF4444';
                                                }
                                            }}
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    {t('common.deleting') || 'Deleting...'}
                                                </>
                                            ) : (
                                                t('common.delete') || 'Delete'
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-backdrop" onClick={() => !isDeleting && setShowDeleteConfirm(false)}></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

