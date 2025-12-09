/**
 * eBook Card Component
 * 
 * Displays a single eBook card in the eBooks list
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/helpers';
import { useThemeColors } from '../../hooks/useThemeColors';

function eBookCard({ eBook }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor } = useThemeColors();

    const product = eBook.product || {};
    const productId = product.id || product._id;
    const thumbnail = product.images?.[0] || product.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';

    if (!productId) {
        return null; // Skip if no product ID
    }

    return (
        <Link
            to={`/ebooks/viewer/${productId}`}
            className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-primary"
            style={{
                borderColor: '#e2e8f0',
                textDecoration: 'none'
            }}
        >
            <figure className="aspect-[3/4] overflow-hidden bg-base-200">
                <img
                    src={thumbnail}
                    alt={product.name || product.title || 'eBook'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';
                    }}
                />
            </figure>
            <div className="card-body p-4">
                <h3 className="card-title text-base sm:text-lg font-bold line-clamp-2" style={{ color: primaryTextColor }}>
                    {product.name || product.title || 'eBook'}
                </h3>
                <div className="flex flex-col gap-1 mt-2">
                    {eBook.lastAccess && (
                        <p className="text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>
                            {t('ebook.lastAccessed') || 'Last accessed'}: {formatDate(eBook.lastAccess)}
                        </p>
                    )}
                    {eBook.accessCount !== undefined && (
                        <p className="text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>
                            {t('ebook.accessCount') || 'Opened'}: {eBook.accessCount} {t('ebook.times') || 'times'}
                        </p>
                    )}
                </div>
                <div className="card-actions justify-end mt-3">
                    <button className="btn btn-primary btn-sm text-white" style={{ backgroundColor: buttonColor }}>
                        {t('ebook.read') || 'Read'}
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default eBookCard;

