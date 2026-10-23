import { getContent } from "@/lib/content";
import { ACTIVATION_FEE, formatRupees } from "@/lib/partnerFee";

const digits = (value) => String(value ?? "").replace(/\D/g, "");

// The joining payment as the admin set it (Admin > Payment Details): how much,
// where to pay, and who to talk to. Empty things stay empty, so the page only
// shows what the admin has filled in.
export async function getPayment() {
  const c = await getContent();

  const amount = Math.round(Number(String(c.pay_amount ?? "").replace(/[^0-9.]/g, ""))) || ACTIVATION_FEE;

  // WhatsApp wants the number with its country code. A plain 10 digit number is Indian.
  const wa = digits(c.pay_contact_whatsapp || c.pay_contact_phone || c.contact_phone);
  const whatsapp = wa.length === 10 ? `91${wa}` : wa;

  const bank = {
    holder: String(c.pay_bank_holder ?? "").trim(),
    name: String(c.pay_bank_name ?? "").trim(),
    account: String(c.pay_bank_account ?? "").trim(),
    ifsc: String(c.pay_bank_ifsc ?? "").trim(),
    branch: String(c.pay_bank_branch ?? "").trim(),
  };

  return {
    amount,
    amountText: formatRupees(amount),
    note: String(c.pay_note ?? "").trim(),
    upi: String(c.pay_upi_id ?? "").trim(),
    bank,
    hasBank: !!(bank.account || bank.ifsc || bank.name || bank.holder),
    contact: {
      name: String(c.pay_contact_name ?? "").trim(),
      phone: String(c.pay_contact_phone || c.contact_phone || "").trim(),
      whatsapp,
      email: String(c.pay_contact_email || c.contact_email || "").trim(),
      hours: String(c.pay_contact_hours ?? "").trim(),
    },
  };
}
