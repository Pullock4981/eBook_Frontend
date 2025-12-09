/**
 * PDF Management Page
 * 
 * Admin page to view and manage all uploaded PDFs
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Loading from '../../../components/common/Loading';
import { useThemeColors } from '../../../hooks/useThemeColors';

function PDFList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20
    });

    useEffect(() => {
        fetchPDFs();
    }, []);

    const fetchPDFs = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            // API interceptor returns response.data directly
            const response = await api.get(`/products/admin/digital?page=${page}&limit=20`);

            console.log('PDF API Response:', response); // Debug log

            if (response?.success) {
                setPdfs(response.data || []);
                setPagination(response.pagination || pagination);
            } else {
                setError(response?.message || 'Failed to fetch PDFs');
            }
        } catch (err) {
            console.error('Error fetching PDFs:', err);
            // API interceptor already extracts error message
            setError(err?.message || err?.response?.data?.message || 'Failed to fetch PDFs');
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return t('pdfManagement.unknown') || 'Unknown';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('pdfManagement.title') || 'PDF Management'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('pdfManagement.description') || 'View and manage all uploaded PDF files'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="card-body p-4">
                            <h3 className="text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                {t('pdfManagement.totalPDFs') || 'Total PDFs'}
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: primaryTextColor }}>{pagination.totalItems}</p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="card-body p-4">
                            <h3 className="text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                {t('pdfManagement.activeProducts') || 'Active Products'}
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: primaryTextColor }}>
                                {pdfs.filter(p => p.isActive).length}
                            </p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="card-body p-4">
                            <h3 className="text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                {t('pdfManagement.totalDownloads') || 'Total Downloads'}
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: primaryTextColor }}>
                                {pdfs.reduce((sum, p) => sum + (p.downloadCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PDFs Table */}
                {pdfs.length === 0 ? (
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="card-body text-center py-12">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-semibold mb-2" style={{ color: primaryTextColor }}>
                                {t('pdfManagement.noPDFsFound') || 'No PDFs Found'}
                            </p>
                            <p className="text-sm opacity-70 mb-4" style={{ color: secondaryTextColor }}>
                                {t('pdfManagement.noPDFsDescription') || 'Upload PDFs by creating digital products'}
                            </p>
                            <button
                                onClick={() => navigate('/admin/products/create')}
                                className="btn text-white"
                                style={{ backgroundColor: buttonColor }}
                            >
                                {t('pdfManagement.createDigitalProduct') || 'Create Digital Product'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.productName') || 'Product Name'}</th>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.pdfURL') || 'PDF URL'}</th>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.fileSize') || 'File Size'}</th>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.downloads') || 'Downloads'}</th>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.status') || 'Status'}</th>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.uploaded') || 'Uploaded'}</th>
                                            <th style={{ color: '#ffffff' }}>{t('pdfManagement.actions') || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pdfs.map((pdf) => (
                                            <tr key={pdf._id || pdf.id} className="transition-colors"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <td>
                                                    <div className="font-semibold" style={{ color: primaryTextColor }}>
                                                        {pdf.name}
                                                    </div>
                                                    <div className="text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                                        {pdf.slug}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="max-w-xs truncate">
                                                        <a
                                                            href={pdf.digitalFile}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm link link-primary"
                                                            style={{ color: buttonColor }}
                                                        >
                                                            {pdf.digitalFile?.substring(0, 40)}...
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-sm" style={{ color: secondaryTextColor }}>
                                                        {formatFileSize(pdf.fileSize)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-ghost" style={{ color: primaryTextColor }}>
                                                        {pdf.downloadCount || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${pdf.isActive ? 'badge-success' : 'badge-error'}`}>
                                                        {pdf.isActive ? (t('pdfManagement.active') || 'Active') : (t('pdfManagement.inactive') || 'Inactive')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm" style={{ color: secondaryTextColor }}>
                                                        {formatDate(pdf.createdAt)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/products/${pdf._id || pdf.id}/edit`)}
                                                            className="btn btn-sm btn-ghost"
                                                            title="Edit Product"
                                                            style={{ color: primaryTextColor }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <a
                                                            href={pdf.digitalFile}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-ghost"
                                                            title="View PDF"
                                                            style={{ color: primaryTextColor }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 p-4 border-t" style={{ borderColor: secondaryTextColor }}>
                                    <button
                                        onClick={() => fetchPDFs(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="btn btn-sm btn-ghost"
                                        style={{ color: primaryTextColor }}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm" style={{ color: secondaryTextColor }}>
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => fetchPDFs(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="btn btn-sm btn-ghost"
                                        style={{ color: primaryTextColor }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PDFList;

