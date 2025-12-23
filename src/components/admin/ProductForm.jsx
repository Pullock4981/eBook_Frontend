/**
 * Product Form Component
 * 
 * Reusable form for creating/editing products
 * Professional design with responsive layout
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories, selectMainCategories } from '../../store/slices/categorySlice';
import ImageUpload from './ImageUpload';
import PDFUpload from '../common/PDFUpload';
import { PRODUCT_TYPES } from '../../utils/constants';
import { useThemeColors } from '../../hooks/useThemeColors';
import { showError } from '../../utils/toast';

function ProductForm({ product = null, onSubmit, onCancel, isLoading = false }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const categories = useSelector(selectMainCategories);
    const { primaryTextColor, secondaryTextColor, buttonColor, backgroundColor, errorColor } = useThemeColors();

    const [formData, setFormData] = useState({
        name: '',
        type: PRODUCT_TYPES.PHYSICAL,
        category: '',
        subcategory: '',
        description: '',
        shortDescription: '',
        price: '',
        discountPrice: '',
        stock: '',
        sku: '',
        tags: '',
        images: [],
        isFeatured: false,
        isActive: true,
        // Digital product fields
        digitalFile: '',
        fileSize: '',
    });

    const [errors, setErrors] = useState({});

    // Load categories on mount
    useEffect(() => {
        dispatch(fetchMainCategories());
    }, [dispatch]);

    // Populate form if editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: String(product.name || ''),
                type: product.type || PRODUCT_TYPES.PHYSICAL,
                category: product.category?._id || product.category || '',
                subcategory: product.subcategory?._id || product.subcategory || '',
                description: String(product.description || ''),
                shortDescription: String(product.shortDescription || ''),
                price: product.price !== undefined && product.price !== null ? String(product.price) : '',
                discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? String(product.discountPrice) : '',
                stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '',
                sku: String(product.sku || ''),
                tags: product.tags?.join(', ') || '',
                images: product.images || [],
                isFeatured: product.isFeatured || false,
                isActive: product.isActive !== undefined ? product.isActive : true,
                digitalFile: String(product.digitalFile || ''),
                fileSize: product.fileSize !== undefined && product.fileSize !== null ? String(product.fileSize) : '',
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            // Ensure all values are strings (or boolean for checkboxes) - never undefined or null
            [name]: type === 'checkbox' ? checked : (value || ''),
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImagesChange = (newImages) => {
        setFormData((prev) => ({ ...prev, images: newImages }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = t('admin.errors.nameRequired') || 'Product name is required';
        }

        if (!formData.category) {
            newErrors.category = t('admin.errors.categoryRequired') || 'Category is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = t('admin.errors.descriptionRequired') || 'Description is required';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = t('admin.errors.priceRequired') || 'Valid price is required';
        }

        if (formData.discountPrice && formData.discountPrice >= formData.price) {
            newErrors.discountPrice = t('admin.errors.discountInvalid') || 'Discount price must be less than regular price';
        }

        if (formData.type === PRODUCT_TYPES.PHYSICAL && (formData.stock === '' || formData.stock === null || formData.stock === undefined)) {
            newErrors.stock = t('admin.errors.stockRequired') || 'Stock is required for physical products';
        }

        // For digital products, check if digitalFile is provided (either uploaded or manual URL)
        if (formData.type === PRODUCT_TYPES.DIGITAL && !formData.digitalFile?.trim()) {
            newErrors.digitalFile = t('admin.errors.digitalFileRequired') || 'PDF file upload or URL is required for digital products';
        }

        if (formData.images.length === 0) {
            newErrors.images = t('admin.errors.imagesRequired') || 'At least one image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const scrollToFirstError = () => {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
            // Try to find the input/select/textarea element
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            } else {
                // If not found, try to find by error message
                const errorElement = document.querySelector(`[data-error-field="${firstErrorField}"]`);
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Submit - Form Data:', formData);

        // Validate form
        const isValid = validate();
        console.log('Form Validation - Valid:', isValid, 'Errors:', errors);

        if (!isValid) {
            // Scroll to first error after a short delay to ensure errors are rendered
            setTimeout(() => {
                scrollToFirstError();
            }, 100);

            // Show toast for better visibility
            const firstError = Object.values(errors)[0];
            if (firstError) {
                showError(firstError);
            } else {
                showError('Please fill in all required fields correctly.');
            }
            return;
        }

        // Prepare submit data with proper type conversions
        // CRITICAL: Always include price field when updating (needed for discount validation)
        let priceValue = formData.price && formData.price.toString().trim()
            ? (isNaN(parseFloat(formData.price)) ? undefined : parseFloat(formData.price))
            : (product && product.price !== undefined ? (typeof product.price === 'number' ? product.price : parseFloat(product.price)) : undefined);

        let discountPriceValue = formData.discountPrice && formData.discountPrice.trim()
            ? (isNaN(parseFloat(formData.discountPrice)) ? undefined : parseFloat(formData.discountPrice))
            : undefined;

        // If discountPrice is set, ensure price is also set (use existing if not provided)
        if (discountPriceValue !== undefined && discountPriceValue !== null) {
            if (priceValue === undefined || priceValue === null || isNaN(priceValue)) {
                if (product && product.price !== undefined && product.price !== null) {
                    priceValue = typeof product.price === 'number' ? product.price : parseFloat(product.price);
                    console.log('ProductForm - Using existing price for discount validation:', priceValue);
                }
            }
        }

        const submitData = {
            name: formData.name.trim(),
            type: formData.type,
            description: formData.description.trim(),
            shortDescription: formData.shortDescription.trim(),
            images: formData.images || [],
            isFeatured: formData.isFeatured,
            isActive: formData.isActive,
            // Convert empty strings to undefined for ObjectId fields (MongoDB doesn't accept empty strings)
            category: formData.category && formData.category.trim() ? formData.category.trim() : undefined,
            subcategory: formData.subcategory && formData.subcategory.trim() ? formData.subcategory.trim() : undefined,
            // Always include price (needed for discount validation)
            price: priceValue,
            discountPrice: discountPriceValue,
            // Convert stock (only for physical products) - ensure it's a valid number
            stock: formData.type === PRODUCT_TYPES.PHYSICAL && formData.stock
                ? (isNaN(parseInt(formData.stock)) ? undefined : parseInt(formData.stock))
                : undefined,
            // Convert tags
            tags: formData.tags && formData.tags.trim()
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [],
            // Convert fileSize - ensure it's a valid number
            fileSize: formData.fileSize && formData.fileSize.trim()
                ? (isNaN(parseInt(formData.fileSize)) ? undefined : parseInt(formData.fileSize))
                : undefined,
            // Ensure digitalFile is not empty string
            digitalFile: formData.digitalFile && formData.digitalFile.trim() ? formData.digitalFile.trim() : undefined,
            // SKU if provided
            sku: formData.sku && formData.sku.trim() ? formData.sku.trim() : undefined,
        };

        // Remove undefined, null, empty string, and NaN values
        // BUT: Always keep price and discountPrice if they're valid numbers
        Object.keys(submitData).forEach(key => {
            const value = submitData[key];
            // Always keep price and discountPrice if they're valid numbers
            if ((key === 'price' || key === 'discountPrice') && typeof value === 'number' && !isNaN(value)) {
                return; // Keep this field
            }
            if (value === undefined || value === null || value === '' ||
                (typeof value === 'number' && isNaN(value)) ||
                (Array.isArray(value) && value.length === 0)) {
                delete submitData[key];
            }
        });

        // Final check: If discountPrice is set, ensure price is also set
        if (submitData.discountPrice !== undefined && submitData.discountPrice !== null) {
            if (submitData.price === undefined || submitData.price === null || isNaN(submitData.price)) {
                // Last resort: use existing product price
                if (product && product.price !== undefined && product.price !== null) {
                    submitData.price = typeof product.price === 'number' ? product.price : parseFloat(product.price);
                    console.log('ProductForm - Final fallback: Using existing price:', submitData.price);
                }
            }
        }

        // For digital products, ensure digitalFile is present (validation will catch if missing)
        if (submitData.type === PRODUCT_TYPES.DIGITAL && !submitData.digitalFile) {
            // Keep it undefined so validation can catch it
            // Don't set to null as that might cause issues
        }

        console.log('Form Submit - Submitting Data:', submitData);
        console.log('Form Submit - Price Details:', {
            price: submitData.price,
            priceType: typeof submitData.price,
            discountPrice: submitData.discountPrice,
            discountPriceType: typeof submitData.discountPrice,
            comparison: submitData.discountPrice && submitData.price
                ? `${submitData.discountPrice} < ${submitData.price} = ${submitData.discountPrice < submitData.price}`
                : 'N/A'
        });
        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4 md:space-y-4 lg:space-y-5">
            {/* Basic Information Section */}
            <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="card-body p-3 sm:p-4 md:p-4 lg:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-3 md:mb-3 lg:mb-4">
                        <div className="w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: buttonColor }}></div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: primaryTextColor }}>
                            {t('admin.basicInformation') || 'Basic Information'}
                        </h2>
                    </div>

                    <div className="space-y-4 sm:space-y-4 md:space-y-4 lg:space-y-4">
                        {/* Product Name - Full Width */}
                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                    {t('admin.productName') || 'Product Name'}
                                    <span className="text-error ml-1">*</span>
                                </span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                className={`input input-bordered w-full h-12 text-base sm:text-base px-4 ${errors.name ? 'input-error border-error border-2' : 'border-2'}`}
                                style={{
                                    backgroundColor: backgroundColor,
                                    color: primaryTextColor,
                                    borderColor: errors.name ? errorColor : secondaryTextColor,
                                    paddingLeft: '1rem',
                                    paddingRight: '1rem',
                                }}
                                placeholder={t('admin.enterProductName') || 'Enter product name'}
                            />
                            {errors.name && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-sm">{errors.name}</span>
                                </label>
                            )}
                        </div>

                        {/* Product Type & Category - Side by Side on Large */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 md:gap-4 lg:gap-4">
                            {/* Product Type */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.productType') || 'Product Type'}
                                        <span className="text-error ml-1">*</span>
                                    </span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type || PRODUCT_TYPES.PHYSICAL}
                                    onChange={handleChange}
                                    className="select select-bordered w-full h-12 text-base sm:text-base border-2 px-4"
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: secondaryTextColor,
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                    }}
                                >
                                    <option value={PRODUCT_TYPES.PHYSICAL}>
                                        {t('products.physical') || 'Physical'}
                                    </option>
                                    <option value={PRODUCT_TYPES.DIGITAL}>
                                        {t('products.digital') || 'Digital'}
                                    </option>
                                </select>
                            </div>

                            {/* Category */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.category') || 'Category'}
                                        <span className="text-error ml-1">*</span>
                                    </span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={handleChange}
                                    className={`select select-bordered w-full h-12 text-base sm:text-base px-4 ${errors.category ? 'select-error border-error border-2' : 'border-2'}`}
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: errors.category ? errorColor : secondaryTextColor,
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                    }}
                                >
                                    <option value="">{t('admin.selectCategory') || 'Select Category'}</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-error text-sm">{errors.category}</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Short Description - Full Width */}
                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                    {t('admin.shortDescription') || 'Short Description'}
                                </span>
                                <span className="label-text-alt text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                    {formData.shortDescription?.length || 0}/300
                                </span>
                            </label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription || ''}
                                onChange={handleChange}
                                className="textarea textarea-bordered w-full min-h-24 text-base sm:text-base border-2 resize-y px-4 py-3"
                                style={{
                                    backgroundColor: backgroundColor,
                                    color: primaryTextColor,
                                    borderColor: secondaryTextColor,
                                    paddingLeft: '1rem',
                                    paddingRight: '1rem',
                                    paddingTop: '0.75rem',
                                    paddingBottom: '0.75rem',
                                }}
                                rows="3"
                                placeholder={t('admin.enterShortDescription') || 'Brief description (max 300 characters)'}
                                maxLength={300}
                            />
                        </div>

                        {/* Description - Full Width */}
                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                    {t('admin.description') || 'Description'}
                                    <span className="text-error ml-1">*</span>
                                </span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                className={`textarea textarea-bordered w-full min-h-32 text-base sm:text-base resize-y px-4 py-3 ${errors.description ? 'textarea-error border-error border-2' : 'border-2'}`}
                                style={{
                                    backgroundColor: backgroundColor,
                                    color: primaryTextColor,
                                    borderColor: errors.description ? errorColor : secondaryTextColor,
                                    paddingLeft: '1rem',
                                    paddingRight: '1rem',
                                    paddingTop: '0.75rem',
                                    paddingBottom: '0.75rem',
                                }}
                                rows="6"
                                placeholder={t('admin.enterDescription') || 'Enter detailed product description'}
                            />
                            {errors.description && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-sm">{errors.description}</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="card-body p-3 sm:p-4 md:p-4 lg:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-3 md:mb-3 lg:mb-4">
                        <div className="w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: buttonColor }}></div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: primaryTextColor }}>
                            {t('admin.pricing') || 'Pricing'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 md:gap-4 lg:gap-4">
                        {/* Price */}
                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                    {t('admin.price') || 'Price (BDT)'}
                                    <span className="text-error ml-1">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base font-medium" style={{ color: secondaryTextColor }}>
                                    ৳
                                </span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={handleChange}
                                    className={`input input-bordered w-full h-12 text-base sm:text-base pl-10 pr-4 ${errors.price ? 'input-error border-error border-2' : 'border-2'}`}
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: errors.price ? errorColor : secondaryTextColor,
                                        paddingLeft: '2.5rem',
                                        paddingRight: '1rem',
                                    }}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {errors.price && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-sm">{errors.price}</span>
                                </label>
                            )}
                        </div>

                        {/* Discount Price */}
                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                    {t('admin.discountPrice') || 'Discount Price (BDT)'}
                                    <span className="label-text-alt text-xs sm:text-sm opacity-70 ml-2" style={{ color: secondaryTextColor }}>
                                        {t('common.optional') || 'Optional'}
                                    </span>
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base font-medium" style={{ color: secondaryTextColor }}>
                                    ৳
                                </span>
                                <input
                                    type="number"
                                    name="discountPrice"
                                    value={formData.discountPrice || ''}
                                    onChange={handleChange}
                                    className={`input input-bordered w-full h-12 text-base sm:text-base pl-10 pr-4 ${errors.discountPrice ? 'input-error border-error border-2' : 'border-2'}`}
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: errors.discountPrice ? errorColor : secondaryTextColor,
                                        paddingLeft: '2.5rem',
                                        paddingRight: '1rem',
                                    }}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {errors.discountPrice && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-sm">{errors.discountPrice}</span>
                                </label>
                            )}
                            {formData.discountPrice && formData.price && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-success text-sm">
                                        {Math.round(((formData.price - formData.discountPrice) / formData.price) * 100)}% {t('products.off') || 'OFF'}
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Physical Product Fields */}
            {formData.type === PRODUCT_TYPES.PHYSICAL && (
                <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="card-body p-3 sm:p-4 md:p-4 lg:p-5">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-3 md:mb-3 lg:mb-4">
                            <div className="w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: buttonColor }}></div>
                            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: primaryTextColor }}>
                                {t('admin.stockInformation') || 'Stock Information'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 md:gap-4 lg:gap-4">
                            {/* Stock */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.stock') || 'Stock Quantity'}
                                        <span className="text-error ml-1">*</span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock || ''}
                                    onChange={handleChange}
                                    className={`input input-bordered w-full h-12 text-base sm:text-base px-4 ${errors.stock ? 'input-error border-error border-2' : 'border-2'}`}
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: errors.stock ? errorColor : secondaryTextColor,
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                    }}
                                    placeholder="0"
                                    min="0"
                                />
                                {errors.stock && (
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-error text-sm">{errors.stock}</span>
                                    </label>
                                )}
                            </div>

                            {/* SKU */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.sku') || 'SKU (Stock Keeping Unit)'}
                                        <span className="label-text-alt text-xs sm:text-sm opacity-70 ml-2" style={{ color: secondaryTextColor }}>
                                            {t('common.optional') || 'Optional'}
                                        </span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku || ''}
                                    onChange={handleChange}
                                    className="input input-bordered w-full h-12 text-base sm:text-base border-2 px-4"
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: secondaryTextColor,
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                    }}
                                    placeholder="SKU-001"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Digital Product Fields */}
            {formData.type === PRODUCT_TYPES.DIGITAL && (
                <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="card-body p-3 sm:p-4 md:p-4 lg:p-5">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-3 md:mb-3 lg:mb-4">
                            <div className="w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: buttonColor }}></div>
                            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: primaryTextColor }}>
                                {t('admin.digitalFile') || 'Digital File Information'}
                            </h2>
                        </div>

                        <div className="space-y-4 sm:space-y-4 md:space-y-4 lg:space-y-4">
                            {/* PDF Upload */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.uploadPDF') || 'Upload PDF File'}
                                        <span className="text-error ml-1">*</span>
                                    </span>
                                    <span className="label-text-alt text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                        {t('admin.orEnterURL') || 'or enter URL below'}
                                    </span>
                                </label>
                                <PDFUpload
                                    onUploadSuccess={(url, fileData) => {
                                        const pdfUrl = url ? String(url) : '';
                                        setFormData(prev => ({
                                            ...prev,
                                            digitalFile: pdfUrl,
                                            fileSize: fileData?.bytes ? String(fileData.bytes) : (prev.fileSize || '')
                                        }));
                                        // Clear error if upload successful
                                        if (errors.digitalFile) {
                                            setErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.digitalFile;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    onUploadError={(error) => {
                                        const errorMsg = error.response?.data?.message || t('admin.errors.uploadFailed') || 'Failed to upload PDF';
                                        setErrors(prev => ({
                                            ...prev,
                                            digitalFile: `${errorMsg}. You can enter the PDF URL manually below.`
                                        }));
                                    }}
                                    maxSizeMB={50}
                                    existingUrl={formData.digitalFile || ''}
                                />
                                {errors.digitalFile && (
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-error text-sm">{errors.digitalFile}</span>
                                    </label>
                                )}
                            </div>

                            {/* Digital File URL (Alternative/Manual Entry) */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.digitalFileUrl') || 'Manual PDF Link (If Upload Fails)'}
                                        <span className="label-text-alt text-xs sm:text-sm opacity-70 ml-2" style={{ color: secondaryTextColor }}>
                                            {t('common.optional') || 'Optional'}
                                        </span>
                                    </span>
                                    <span className="label-text-alt text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                        {t('admin.manualURLHint') || 'Paste direct link to PDF here (Google Drive, Dropbox, etc.)'}
                                    </span>
                                </label>
                                <input
                                    type="url"
                                    name="digitalFile"
                                    value={formData.digitalFile || ''}
                                    onChange={handleChange}
                                    className="input input-bordered w-full h-12 text-base sm:text-base px-4 border-2"
                                    style={{
                                        backgroundColor: backgroundColor,
                                        color: primaryTextColor,
                                        borderColor: secondaryTextColor,
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                    }}
                                    placeholder="https://example.com/book.pdf"
                                />
                            </div>

                            {/* File Size */}
                            <div className="form-control w-full">
                                <label className="label pb-2">
                                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                        {t('admin.fileSize') || 'File Size (bytes)'}
                                        <span className="label-text-alt text-xs sm:text-sm opacity-70 ml-2" style={{ color: secondaryTextColor }}>
                                            {t('common.optional') || 'Optional'}
                                        </span>
                                    </span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        name="fileSize"
                                        value={formData.fileSize || ''}
                                        onChange={handleChange}
                                        className="input input-bordered flex-grow h-12 text-base sm:text-base border-2 px-4"
                                        style={{
                                            backgroundColor: backgroundColor,
                                            color: primaryTextColor,
                                            borderColor: secondaryTextColor,
                                            paddingLeft: '1rem',
                                            paddingRight: '1rem',
                                        }}
                                        placeholder="5242880"
                                        min="0"
                                    />
                                    {formData.fileSize && (
                                        <span className="text-sm opacity-70 whitespace-nowrap" style={{ color: secondaryTextColor }}>
                                            ({(formData.fileSize / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Images Section */}
            <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="card-body p-3 sm:p-4 md:p-4 lg:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-3 md:mb-3 lg:mb-4">
                        <div className="w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: buttonColor }}></div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: primaryTextColor }}>
                            {t('admin.images') || 'Product Images'}
                            <span className="text-error ml-1">*</span>
                        </h2>
                    </div>
                    <ImageUpload
                        images={formData.images}
                        onImagesChange={handleImagesChange}
                        multiple={true}
                        maxImages={10}
                    />
                    {errors.images && (
                        <label className="label pt-2">
                            <span className="label-text-alt text-error text-sm">{errors.images}</span>
                        </label>
                    )}
                </div>
            </div>

            {/* Additional Information */}
            <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="card-body p-3 sm:p-4 md:p-4 lg:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-3 md:mb-3 lg:mb-4">
                        <div className="w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0" style={{ backgroundColor: buttonColor }}></div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: primaryTextColor }}>
                            {t('admin.additionalInformation') || 'Additional Information'}
                        </h2>
                    </div>

                    <div className="space-y-4 sm:space-y-4 md:space-y-4 lg:space-y-4">
                        {/* Tags */}
                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                                    {t('admin.tags') || 'Tags'}
                                    <span className="label-text-alt text-xs sm:text-sm opacity-70 ml-1 sm:ml-2" style={{ color: secondaryTextColor }}>
                                        {t('common.optional') || 'Optional'}
                                    </span>
                                </span>
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags || ''}
                                onChange={handleChange}
                                className="input input-bordered w-full h-12 text-base sm:text-base border-2 px-4"
                                style={{
                                    backgroundColor: backgroundColor,
                                    color: primaryTextColor,
                                    borderColor: secondaryTextColor,
                                    paddingLeft: '1rem',
                                    paddingRight: '1rem',
                                }}
                                placeholder="book, fiction, novel (comma separated)"
                            />
                            <label className="label pt-1">
                                <span className="label-text-alt opacity-70 text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                    {t('admin.tagsHint') || 'Separate tags with commas'}
                                </span>
                            </label>
                        </div>

                        {/* Featured & Active - Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3 md:gap-3 lg:gap-4">
                            <div className="form-control w-full">
                                <label className="label cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-colors justify-between w-full" style={{ borderColor: secondaryTextColor, backgroundColor }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = backgroundColor;
                                    }}
                                >
                                    <div className="flex flex-col flex-1 min-w-0 pr-2 sm:pr-3">
                                        <span className="label-text text-sm sm:text-base font-semibold mb-0.5 sm:mb-1" style={{ color: primaryTextColor }}>
                                            {t('admin.featured') || 'Featured Product'}
                                        </span>
                                        <span className="label-text-alt text-xs sm:text-sm opacity-70 leading-relaxed break-words" style={{ color: secondaryTextColor, lineHeight: '1.4' }}>
                                            {t('admin.featuredHint') || 'Show in featured section'}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="toggle toggle-primary flex-shrink-0"
                                    />
                                </label>
                            </div>

                            <div className="form-control w-full">
                                <label className="label cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-colors justify-between w-full" style={{ borderColor: secondaryTextColor, backgroundColor }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = backgroundColor;
                                    }}
                                >
                                    <div className="flex flex-col flex-1 min-w-0 pr-2 sm:pr-3">
                                        <span className="label-text text-sm sm:text-base font-semibold mb-0.5 sm:mb-1" style={{ color: primaryTextColor }}>
                                            {t('admin.active') || 'Active Status'}
                                        </span>
                                        <span className="label-text-alt text-xs sm:text-sm opacity-70 leading-relaxed break-words" style={{ color: secondaryTextColor, lineHeight: '1.4' }}>
                                            {t('admin.activeHint') || 'Product will be visible to customers'}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="toggle toggle-primary flex-shrink-0"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Actions - Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t-2 shadow-2xl p-2 sm:p-3 md:p-4 z-50" style={{ backgroundColor, borderColor: secondaryTextColor }}>
                <div className="container mx-auto max-w-5xl px-2 sm:px-3 md:px-4 lg:px-5">
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-outline w-full sm:w-auto sm:min-w-[90px] md:min-w-[110px] lg:min-w-[130px] h-9 sm:h-10 md:h-11 lg:h-12 text-xs sm:text-sm md:text-base font-semibold flex items-center justify-center order-2 sm:order-1"
                            style={{ borderColor: buttonColor, borderWidth: '2px', color: buttonColor }}
                            disabled={isLoading}
                        >
                            <span className="whitespace-nowrap">{t('common.cancel') || 'Cancel'}</span>
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary w-full sm:w-auto sm:min-w-[100px] md:min-w-[130px] lg:min-w-[150px] h-9 sm:h-10 md:h-11 lg:h-12 text-xs sm:text-sm md:text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1 sm:gap-2 order-1 sm:order-2"
                            style={{ backgroundColor: buttonColor }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="whitespace-nowrap">{t('common.saving') || 'Saving...'}</span>
                                </>
                            ) : (
                                <>
                                    {product ? (
                                        <>
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="hidden md:inline whitespace-nowrap">{t('admin.updateProduct') || 'Update Product'}</span>
                                            <span className="md:hidden whitespace-nowrap">{t('common.update') || 'Update'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="hidden md:inline whitespace-nowrap">{t('admin.addProduct') || 'Add Product'}</span>
                                            <span className="md:hidden whitespace-nowrap">{t('common.add') || 'Add'}</span>
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Spacer for fixed footer - responsive height */}
            <div className="h-14 sm:h-16 md:h-20 lg:h-24"></div>
        </form>
    );
}

export default ProductForm;
