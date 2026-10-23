// The joining fee is set by the admin (Admin > Payment Details). This is the
// amount used until the admin saves one, and when the saved value is not a number.
export const ACTIVATION_FEE = 10000;

// 10000 -> "₹10,000"
export const formatRupees = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const ACTIVATION_FEE_TEXT = formatRupees(ACTIVATION_FEE);
