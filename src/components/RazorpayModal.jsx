import { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  X,
  ShieldCheck,
  Smartphone,
  Loader2,
} from "lucide-react";

export default function RazorpayModal({
  isOpen,
  onClose,
  amount,
  currency = "GBP",
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // Card form state
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardName, setCardName] = useState("House of Hackney Patron");

  // UPI state
  const [upiId, setUpiId] = useState("patron@okhdfcbank");

  // Netbanking state
  const [selectedBank, setSelectedBank] = useState("HDFC");

  if (!isOpen) return null;

  // Format currency for display
  const displayAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
  }).format(amount);

  // Simulate payment processing and success
  const handlePay = () => {
    setProcessing(true);

    setTimeout(() => {
      const generatedId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
      setPaymentId(generatedId);
      setProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        onSuccess({
          paymentId: generatedId,
          method: activeTab,
          amount,
          currency,
        });
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0284c7] font-bold text-lg text-white">
              R
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-sky-200">
                Razorpay Checkout
              </p>
              <h3 className="font-serif text-lg font-medium text-white">
                House of Hackney London
              </h3>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-sky-200">
                Amount to Pay
              </p>
              <p className="font-serif text-lg font-semibold text-white">
                {displayAmount}
              </p>
            </div>
            {!processing && !success && (
              <button
                type="button"
                onClick={onClose}
                className="ml-2 rounded-full p-1 text-sky-200 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-serif text-2xl text-stone-900">
              Payment Successful!
            </h4>
            <p className="text-xs text-stone-600">
              Transaction ID: <span className="font-mono font-semibold">{paymentId}</span>
            </p>
            <p className="text-xs text-stone-500">
              Confirming your House of Hackney commission...
            </p>
          </div>
        ) : processing ? (
          <div className="p-12 text-center space-y-4">
            <Loader2 size={40} className="mx-auto animate-spin text-[#0284c7]" />
            <h4 className="font-serif text-xl text-stone-900">
              Authorizing Payment...
            </h4>
            <p className="text-xs text-stone-500">
              Connecting securely to your bank. Please do not refresh.
            </p>
          </div>
        ) : (
          <div>
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 text-xs font-medium text-stone-600">
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`flex items-center justify-center gap-1.5 py-3 border-b-2 transition ${
                  activeTab === "card"
                    ? "border-[#0284c7] bg-white text-[#0c2340] font-semibold"
                    : "border-transparent hover:text-stone-900"
                }`}
              >
                <CreditCard size={15} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`flex items-center justify-center gap-1.5 py-3 border-b-2 transition ${
                  activeTab === "upi"
                    ? "border-[#0284c7] bg-white text-[#0c2340] font-semibold"
                    : "border-transparent hover:text-stone-900"
                }`}
              >
                <Smartphone size={15} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`flex items-center justify-center gap-1.5 py-3 border-b-2 transition ${
                  activeTab === "netbanking"
                    ? "border-[#0284c7] bg-white text-[#0c2340] font-semibold"
                    : "border-transparent hover:text-stone-900"
                }`}
              >
                <Building2 size={15} />
                <span>Netbanking</span>
              </button>
            </div>

            {/* Tab 1: Cards */}
            {activeTab === "card" && (
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 font-mono text-stone-900 focus:border-[#0284c7] focus:outline-hidden"
                    />
                    <CreditCard
                      size={18}
                      className="absolute right-3 top-2.5 text-stone-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 font-mono text-stone-900 focus:border-[#0284c7] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      CVV / CVC
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 font-mono text-stone-900 focus:border-[#0284c7] focus:outline-hidden"
                      />
                      <Lock
                        size={14}
                        className="absolute right-3 top-3 text-stone-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-stone-900 focus:border-[#0284c7] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: UPI */}
            {activeTab === "upi" && (
              <div className="p-6 space-y-4 text-xs">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white p-2 border border-stone-200 shadow-2xs">
                    <QrCode size={70} className="text-[#0c2340]" />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-stone-700">
                    Scan with any UPI app (GPay, PhonePe, Paytm)
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Or enter UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-stone-900 focus:border-[#0284c7] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Netbanking */}
            {activeTab === "netbanking" && (
              <div className="p-6 space-y-3 text-xs">
                <p className="font-medium text-stone-700 mb-2">
                  Select Popular Bank
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "HSBC"].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                        selectedBank === bank
                          ? "border-[#0284c7] bg-sky-50 font-semibold text-[#0c2340]"
                          : "border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <Building2 size={16} />
                      <span>{bank} Bank</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Pay Button */}
            <div className="border-t border-stone-200 bg-stone-50 px-6 py-4">
              <button
                type="button"
                onClick={handlePay}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#0369a1] transition cursor-pointer"
              >
                <Lock size={14} />
                <span>Pay {displayAmount}</span>
              </button>

              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-stone-500">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Simulated Razorpay Sandbox &bull; 256-bit Encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
