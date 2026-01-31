import { message } from 'antd';
// @ts-ignore

// Add this function at the top of your file after the imports
export const formatMoney = (amount: string | number, currency: string) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount.toString()));

  return `${currency} ${formattedAmount}`;
};

export const statusText = (status: string) => {
  switch (status) {
    case 'PAYMENT_PROCESSING':
      return 'AWAITING PAYMENT';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'PAYMENT_COMPLETED':
      return 'PAYMENT COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'DELIVERED':
      return 'DELIVERED';
    default:
      return status;
  }
};

export const status = (status: any) => {
  switch (status) {
    case 'DRAFT':
      return { color: '#F9FAFB', text: '#1D2739', label: 'DRAFT', value: 'DRAFT' };
    case 'REFUNDED':
      return { color: '#FFF1EC', text: '#FF773D', label: 'REFUNDED', value: 'REFUNDED' };
    case 'PAYMENT_PROCESSING':
      return { color: '#FEF6E7', text: '#F3A218', label: 'AWAITING PAYMENT', value: 'PAYMENT_PROCESSING' };
    case 'PAYMENT_COMPLETED':
      return { color: '#E7F6EC', text: '#036B26', label: 'PAYMENT COMPLETED', value: 'PAYMENT_COMPLETED' };
    case 'DELIVERED':
    case 'COMPLETED':
      return { color: '#E7F6EC', text: '#036B26', label: 'DELIVERED', value: 'DELIVERED' };
    case 'PAYMENT_FAILED':
      return { color: '#FBEAE9', text: '#D42620', label: 'PAYMENT FAILED', value: 'PAYMENT_FAILED' };
    case 'CANCELLED':
      return { color: '#FBEDF1', text: '#D34875', label: 'CANCELLED', value: 'CANCELLED' };
    default:
      return status;
  }
};

export const getStatusColor = (status: string) => {
  const colors = {
    pending: '#F3A218', // orange
    success: '#036B26', // green
    failed: '#D42620', // red
  };
  return colors[status as keyof typeof colors] || '#8c8c8c';
};

export const handleCopy = async (value: string) => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    message.success('Copied to clipboard');
  } catch (e) {
    message.error('Failed to copy');
  }
};
