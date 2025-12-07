/**
 * Payment Method Selector Component
 * 
 * Component for selecting payment method during checkout
 */

import { useTranslation } from 'react-i18next';

const PAYMENT_METHODS = [
    { value: 'sslcommerz', label: 'SSLCommerz', icon: '💳', description: 'Credit/Debit Card' },
    { value: 'bkash', label: 'bKash', icon: '📱', description: 'Mobile Banking' },
    { value: 'nagad', label: 'Nagad', icon: '📱', description: 'Mobile Banking' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💰', description: 'Pay when delivered' }
];

function PaymentMethodSelector({ selectedMethod, onMethodChange }) {
    const { t } = useTranslation();

    return (
        <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
            <div className="card-body p-4">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E293B' }}>
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
                                borderColor: selectedMethod === method.value ? '#1E293B' : '#cbd5e1',
                                backgroundColor: selectedMethod === method.value ? '#f1f5f9' : 'transparent'
                            }}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.value}
                                checked={selectedMethod === method.value}
                                onChange={() => onMethodChange && onMethodChange(method.value)}
                                className="radio radio-primary"
                                style={{ accentColor: '#1E293B' }}
                            />
                            <div className="flex items-center gap-3 flex-grow">
                                <span className="text-2xl">{method.icon}</span>
                                <div>
                                    <div className="font-semibold text-base" style={{ color: '#1E293B' }}>
                                        {method.label}
                                    </div>
                                    <div className="text-xs opacity-70" style={{ color: '#2d3748' }}>
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

