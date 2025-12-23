/**
 * Payment Method Selector Component
 * 
 * Component for selecting payment method during checkout
 */

import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';

function PaymentMethodSelector({ selectedMethod, onMethodChange }) {
    const { t } = useTranslation();
    const { cardBackgroundColor, primaryTextColor, secondaryTextColor, borderColor, buttonColor } = useThemeColors();

    const PAYMENT_METHODS = [
        {
            value: 'bkash',
            label: t('checkout.bkashLabel') || 'bKash',
            icon: '📲',
            description: t('checkout.bkashDesc') || 'Mobile Banking',
            accent: '#E3106E',
        },
        {
            value: 'nagad',
            label: t('checkout.nagadLabel') || 'Nagad',
            icon: '📲',
            description: t('checkout.nagadDesc') || 'Mobile Banking',
            accent: '#F5A623',
        },
        {
            value: 'cash_on_delivery',
            label: t('checkout.codLabel') || 'Cash on Delivery',
            icon: '💰',
            description: t('checkout.codDesc') || 'Pay when delivered',
            accent: '#f59e0b',
        },
    ];

    return (
        <div className="card shadow-sm border-2" style={{ borderColor, backgroundColor: cardBackgroundColor }}>
            <div className="card-body p-4">
                <h3 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>
                    {t('checkout.paymentMethod') || 'Payment Method'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                        <label
                            key={method.value}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMethod === method.value
                                ? 'border-primary bg-primary/5'
                                : 'border-base-300 hover:border-primary/50'
                                }`}
                            style={{
                                borderColor: selectedMethod === method.value ? buttonColor : borderColor,
                                backgroundColor: selectedMethod === method.value ? `${buttonColor}15` : cardBackgroundColor,
                            }}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.value}
                                checked={selectedMethod === method.value}
                                onChange={() => onMethodChange && onMethodChange(method.value)}
                                className="radio radio-primary"
                                style={{ accentColor: buttonColor }}
                            />
                            <div className="flex items-center gap-3 flex-grow">
                                <span
                                    className="text-xl flex items-center justify-center rounded-full h-9 w-9"
                                    style={{ backgroundColor: `${method.accent}22`, color: method.accent }}
                                >
                                    {method.icon}
                                </span>
                                <div>
                                    <div className="font-semibold text-base" style={{ color: primaryTextColor }}>
                                        {method.label}
                                    </div>
                                    <div className="text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                        {method.description}
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PaymentMethodSelector;

