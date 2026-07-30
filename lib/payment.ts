'use client';

/**
 * Demo payment utilities.
 *
 * This module is the single integration point for payments. Today it generates
 * fake transaction/payment IDs and simulates processing. To integrate a real
 * gateway (Razorpay/Stripe) later, replace `processPayment` with a call to the
 * gateway SDK — the rest of the UI and workflow stays unchanged.
 */

export type PaymentMethod = 'upi' | 'card-credit' | 'card-debit' | 'netbanking' | 'wallet' | 'qr';

export type PriceBreakdown = {
  pages: number;
  copies: number;
  paperSize: string;
  colorMode: 'color' | 'bw';
  duplex: boolean;
  priority: boolean;
  baseAmount: number;     // printing cost
  priorityCharge: number; // priority surcharge
  gst: number;            // 18% GST on base + priority
  platformFee: number;    // flat ₹2 platform fee
  finalAmount: number;    // total payable
};

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; description: string }[] = [
  { id: 'upi', label: 'UPI', icon: 'smartphone', description: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card-credit', label: 'Credit Card', icon: 'credit-card', description: 'Visa, Mastercard, Amex' },
  { id: 'card-debit', label: 'Debit Card', icon: 'credit-card', description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: 'building', description: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet', description: 'SmartPrint Wallet' },
  { id: 'qr', label: 'QR Code', icon: 'qr-code', description: 'Scan & pay with any UPI app' },
];

export function computeBreakdown(opts: {
  pages: number; copies: number; colorMode: 'color' | 'bw'; duplex: boolean; priority: boolean; paperSize: string;
}): PriceBreakdown {
  const perPageBw = 1.0;
  const perPageColor = 3.5;
  const per = opts.colorMode === 'color' ? perPageColor : perPageBw;
  const sheets = opts.duplex ? Math.ceil(opts.pages / 2) : opts.pages;
  const baseAmount = Math.round(sheets * opts.copies * per * 100) / 100;
  const priorityCharge = opts.priority ? 10 : 0;
  const gst = Math.round((baseAmount + priorityCharge) * 0.18 * 100) / 100;
  const platformFee = 2;
  const finalAmount = Math.round((baseAmount + priorityCharge + gst + platformFee) * 100) / 100;
  return {
    pages: opts.pages, copies: opts.copies, paperSize: opts.paperSize,
    colorMode: opts.colorMode, duplex: opts.duplex, priority: opts.priority,
    baseAmount, priorityCharge, gst, platformFee, finalAmount,
  };
}

let txnCounter = 1;
export function generateTransactionId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const id = `TXN${ymd}${String(txnCounter++).padStart(4, '0')}`;
  return id;
}

export function generatePaymentId(): string {
  return `PAY${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export type PaymentResult = {
  success: boolean;
  transactionId: string;
  paymentId: string;
  method: PaymentMethod;
  amount: number;
  timestamp: string;
};

/**
 * Simulates a payment. Returns a successful result after a delay.
 * `simulateFailure` forces a failure for demo purposes.
 *
 * To integrate a real gateway: replace this body with the gateway SDK call
 * and return a PaymentResult built from the gateway's response. The calling
 * page and downstream workflow require no changes.
 */
export async function processPayment(
  amount: number,
  method: PaymentMethod,
  simulateFailure = false,
): Promise<PaymentResult> {
  await new Promise(r => setTimeout(r, 2500));
  if (simulateFailure) {
    return {
      success: false,
      transactionId: generateTransactionId(),
      paymentId: generatePaymentId(),
      method, amount, timestamp: new Date().toISOString(),
    };
  }
  return {
    success: true,
    transactionId: generateTransactionId(),
    paymentId: generatePaymentId(),
    method, amount, timestamp: new Date().toISOString(),
  };
}

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  'card-credit': 'Credit Card',
  'card-debit': 'Debit Card',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  qr: 'QR Code',
};
