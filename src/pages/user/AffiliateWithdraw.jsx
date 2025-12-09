/**
 * Affiliate Withdraw Request Page
 * 
 * Allows affiliates to create withdraw requests and view withdraw history
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
    fetchAffiliateStatistics,
    fetchWithdrawRequests,
    createWithdraw,
    selectAffiliateStatistics,
    selectWithdrawRequests,
    selectAffiliateLoading,
    selectAffiliatePagination
} from '../../store/slices/affiliateSlice';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { useThemeColors } from '../../hooks/useThemeColors';

function AffiliateWithdraw() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor, warningColor, errorColor } = useThemeColors();
    const statistics = useSelector(selectAffiliateStatistics);
    const withdrawRequests = useSelector(selectWithdrawRequests);
    const loading = useSelector(selectAffiliateLoading);
    const pagination = useSelector(selectAffiliatePagination);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const limit = 10;

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const amount = watch('amount');

    useEffect(() => {
        dispatch(fetchAffiliateStatistics());
        dispatch(fetchWithdrawRequests({ page: currentPage, limit }));
    }, [dispatch, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmit = async (data) => {
        setSubmitLoading(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            await dispatch(createWithdraw({
                amount: parseFloat(data.amount),
                paymentDetails: {
                    accountName: data.accountName,
                    accountNumber: data.accountNumber,
                    ...(data.bankName && { bankName: data.bankName }),
                    ...(data.branchName && { branchName: data.branchName }),
                    ...(data.routingNumber && { routingNumber: data.routingNumber }),
                }
            })).unwrap();

            setSubmitSuccess(true);
            reset();
            setShowForm(false);
            dispatch(fetchAffiliateStatistics());
            dispatch(fetchWithdrawRequests({ page: 1, limit }));
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            setSubmitError(error || 'Failed to create withdraw request');
        } finally {
            setSubmitLoading(false);
        }
    };

    const affiliate = statistics?.affiliate;
    const availableBalance = affiliate?.pendingCommission || 0;
    const minWithdraw = 500;

    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('affiliate.withdrawRequests')}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('affiliate.withdrawRequestsDescription')}
                    </p>
                </div>

                {/* Balance Card */}
                <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                            <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                {t('affiliate.availableBalance')}
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: successColor }}>
                                {formatCurrency(availableBalance)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                {t('affiliate.minimumWithdraw')}
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                {formatCurrency(minWithdraw)}
                            </p>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                disabled={availableBalance < minWithdraw}
                                className="btn w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: buttonColor, minHeight: '44px' }}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = buttonColor;
                                    }
                                }}
                            >
                                {showForm ? t('common.cancel') : t('affiliate.requestWithdrawButton')}
                            </button>
                        </div>
                    </div>
                    {availableBalance < minWithdraw && (
                        <p className="text-xs sm:text-sm mt-3" style={{ color: warningColor }}>
                            {t('affiliate.minimumWithdrawMessage', { amount: formatCurrency(minWithdraw), needed: formatCurrency(minWithdraw - availableBalance) })}
                        </p>
                    )}
                </div>

                {/* Withdraw Form */}
                {showForm && (
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: primaryTextColor }}>
                            {t('affiliate.createWithdrawRequest')}
                        </h2>

                        {submitSuccess && (
                            <div className="alert alert-success mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t('affiliate.withdrawRequestSubmitted')}</span>
                            </div>
                        )}

                        {submitError && (
                            <div className="alert alert-error mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>{submitError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.amountLabel')} <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={minWithdraw}
                                    max={availableBalance}
                                    {...register('amount', {
                                        required: t('affiliate.amountRequired'),
                                        min: { value: minWithdraw, message: t('affiliate.minimumAmountError', { amount: formatCurrency(minWithdraw) }) },
                                        max: { value: availableBalance, message: t('affiliate.maximumAmountError', { amount: formatCurrency(availableBalance) }) }
                                    })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.amount ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder={t('affiliate.minPlaceholder', { amount: formatCurrency(minWithdraw) })}
                                />
                                {errors.amount && (
                                    <p className="text-xs text-error mt-1">{errors.amount.message}</p>
                                )}
                                {amount && !errors.amount && (
                                    <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                        {t('affiliate.available')}: {formatCurrency(availableBalance)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.accountName')} <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('accountName', { required: t('affiliate.accountNameRequired') })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.accountName ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder={t('affiliate.enterAccountHolderName')}
                                />
                                {errors.accountName && (
                                    <p className="text-xs text-error mt-1">{errors.accountName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.accountNumber')} <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('accountNumber', { required: t('affiliate.accountNumberRequired') })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.accountNumber ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder={t('affiliate.enterAccountNumber')}
                                />
                                {errors.accountNumber && (
                                    <p className="text-xs text-error mt-1">{errors.accountNumber.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                            {t('affiliate.bankName')}
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('bankName')}
                                        className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                        style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                        placeholder={t('affiliate.enterBankName')}
                                    />
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                            {t('affiliate.branchName')}
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('branchName')}
                                        className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                        style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                        placeholder={t('affiliate.enterBranchName')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.routingNumber')}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('routingNumber')}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder={t('affiliate.enterRoutingNumber')}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitLoading || availableBalance < minWithdraw}
                                    className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                                    onMouseEnter={(e) => {
                                        if (!e.target.disabled) {
                                            e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!e.target.disabled) {
                                            e.target.style.backgroundColor = buttonColor;
                                        }
                                    }}
                                >
                                    {submitLoading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        t('affiliate.submitRequest')
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        reset();
                                        setSubmitError(null);
                                    }}
                                    className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, borderWidth: '1px', minHeight: '48px' }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = secondaryTextColor + '20';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = backgroundColor;
                                    }}
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Withdraw History */}
                <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: primaryTextColor }}>
                        {t('affiliate.withdrawHistory')}
                    </h2>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : withdrawRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-sm sm:text-base" style={{ color: secondaryTextColor }}>
                                {t('affiliate.noWithdrawRequestsYet')}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.amount')}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.paymentMethod')}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.status')}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.requestedDate')}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.reviewedDate')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawRequests.map((request, index) => (
                                            <tr key={request.id} className="border-b transition-colors" style={{ borderColor: secondaryTextColor, backgroundColor: index % 2 === 0 ? backgroundColor : secondaryTextColor + '10' }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? backgroundColor : secondaryTextColor + '10';
                                                }}
                                            >
                                                <td className="py-3 px-2 sm:px-4">
                                                    <span className="text-xs sm:text-sm font-semibold" style={{ color: primaryTextColor }}>
                                                        {formatCurrency(request.amount)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 sm:px-4">
                                                    <span className="text-xs sm:text-sm capitalize" style={{ color: secondaryTextColor }}>
                                                        {request.paymentMethod?.replace('_', ' ') || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 sm:px-4">
                                                    <span className={`badge badge-sm ${request.status === 'paid' ? 'badge-success' :
                                                        request.status === 'approved' ? 'badge-info' :
                                                            request.status === 'rejected' ? 'badge-error' :
                                                                'badge-warning'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                    {request.rejectionReason && (
                                                        <p className="text-xs mt-1" style={{ color: errorColor }}>
                                                            {request.rejectionReason}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 sm:px-4">
                                                    <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                        {formatDate(request.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 sm:px-4">
                                                    <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                        {request.reviewedAt ? formatDate(request.reviewedAt) : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.withdrawRequests.pages > 1 && (
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={pagination.withdrawRequests.pages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AffiliateWithdraw;

