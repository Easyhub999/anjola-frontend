// Displayed before checkout; the backend independently calculates and stores this fee.
export const GIFT_PACKAGING_FEE = 2000;

// Read historical charges from the order, never from today's fee configuration.
export const recordedGiftFee = customerInfo => {
  const fee = customerInfo?.giftPackagingFee;
  return typeof fee === 'number' && Number.isFinite(fee) && fee >= 0 ? fee : null;
};
