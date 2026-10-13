// Receiving details confirmed by the shop owner. These are public payment instructions.
export const TRANSFER_METHODS = ['JazzCash', 'Easypaisa', 'Raast'] as const;
export const PAYMENT_METHODS = ['COD', ...TRANSFER_METHODS] as const;
export const RECEIVING_ACCOUNT = {
  title: 'Abid Mahmood',
  number: '03007618236',
} as const;
