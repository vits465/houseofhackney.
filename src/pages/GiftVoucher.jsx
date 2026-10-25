import { useState } from "react";
import { useDispatch } from "react-redux";
import { ShoppingBag, ShieldCheck, Mail, Clock } from "lucide-react";
import { addToCart } from "../features/carts/cartSlice";
import { showToast } from "../utils/sweetAlert";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export default function GiftVoucher() {
  const dispatch = useDispatch();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  // Form fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");

  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  // Add voucher to cart
  const handleAddToBag = (e) => {
    e.preventDefault();

    if (currentAmount < 10) {
      showToast("Minimum voucher value is £10", "error");
      return;
    }

    const voucherId = `voucher_${Date.now()}`;
    dispatch(
      addToCart({
        _id: voucherId,
        productId: voucherId,
        title: `House of Hackney Digital Gift Voucher (£${currentAmount})`,
        name: `Digital Gift Voucher (£${currentAmount})`,
        price: currentAmount,
        currency: "GBP",
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        recipientName: recipientName || "Someone special",
        recipientEmail,
        senderName: senderName || "A thoughtful friend",
        message,
        isGiftVoucher: true,
      })
    );

    showToast("Gift voucher added to your bag");
  };

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#171713] pb-24">
      {/* Editorial Header */}
      <section className="border-b border-[#d8d1c5] bg-[#faf8f4] py-14 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#394132] mb-3">
            A GIFT OF TIMELESS BEAUTY
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#171713] tracking-tight">
            DIGITAL GIFT VOUCHER
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-[#555249] max-w-xl mx-auto leading-relaxed">
            Allow them to choose their own sanctuary from our iconic British wallpapers, sumptuous velvets, and luxury furnishings.
          </p>
        </div>
      </section>

      {/* Main Voucher Builder */}
      <section className="mx-auto max-w-6xl px-5 pt-12 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Live Voucher Card Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#2d3527] p-8 text-[#f6f3ec] shadow-xl border border-[#3e4835] flex flex-col justify-between">
              {/* Top brand row */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-serif text-xs tracking-[4px] uppercase text-[#d8c4a5]">
                    HOUSE OF HACKNEY
                  </span>
                  <p className="text-[9px] uppercase tracking-wider text-[#d8d3c5]/70 mt-0.5">
                    London Sanctuary
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-medium text-white">
                    £{currentAmount || 0}
                  </span>
                  <p className="text-[8px] uppercase tracking-widest text-[#d8c4a5]">GBP</p>
                </div>
              </div>

              {/* Message preview */}
              <div className="my-auto py-2">
                <p className="text-[10px] uppercase tracking-wider text-[#d8d3c5]/80">
                  Presented to:
                </p>
                <p className="font-serif text-lg text-white">
                  {recipientName || "Recipient Name"}
                </p>
                {message && (
                  <p className="mt-2 text-[11px] italic text-[#d8d3c5] line-clamp-2">
                    &ldquo;{message}&rdquo;
                  </p>
                )}
              </div>

              {/* Bottom Voucher Code preview */}
              <div className="border-t border-[#f6f3ec]/15 pt-3 flex items-center justify-between text-[9px] tracking-wider text-[#d8d3c5]/70">
                <span>REDEEMABLE ONLINE & IN STORE</span>
                <span className="font-mono">HOH-VCHR-XXXX</span>
              </div>
            </div>

            {/* Perks list */}
            <div className="mt-8 space-y-3 rounded-xl border border-[#dedbd4] bg-white p-5 text-xs text-[#555]">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#394132]" />
                <span>Instant digital dispatch straight to the recipient&apos;s inbox</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[#394132]" />
                <span>Valid for 24 months from the moment of purchase</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-[#394132]" />
                <span>Redeemable across all wallpapers, fabrics, and design services</span>
              </div>
            </div>
          </div>

          {/* Right Column: Voucher Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleAddToBag}
              className="rounded-2xl border border-[#dedbd4] bg-white p-6 sm:p-10 shadow-xs space-y-8"
            >
              {/* 1. Select Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#171713] mb-3">
                  1. Choose Voucher Value
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = !isCustom && selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setIsCustom(false);
                        }}
                        className={`rounded-xl py-3 text-center text-sm font-semibold transition cursor-pointer border ${
                          isSelected
                            ? "border-[#394132] bg-[#394132] text-white shadow-sm"
                            : "border-[#dedbd4] bg-[#faf8f4] text-[#171713] hover:border-[#394132]"
                        }`}
                      >
                        £{amt}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount option */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition border ${
                      isCustom
                        ? "border-[#394132] bg-[#394132] text-white"
                        : "border-[#dedbd4] bg-[#faf8f4] text-[#555] hover:border-[#394132]"
                    }`}
                  >
                    Custom Amount
                  </button>
                  {isCustom && (
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs text-[#777]">£</span>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        placeholder="e.g. 150"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full rounded-xl border border-[#dedbd4] pl-7 pr-3 py-2 text-xs text-[#171713] outline-hidden focus:border-[#394132]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Recipient Information */}
              <div className="space-y-4 border-t border-[#dedbd4] pt-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#171713]">
                  2. Recipient Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-[#555] mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] outline-hidden focus:border-[#394132]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#555] mb-1">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="eleanor@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] outline-hidden focus:border-[#394132]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Personal Message */}
              <div className="space-y-4 border-t border-[#dedbd4] pt-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#171713]">
                  3. From & Personal Message
                </label>

                <div className="text-xs space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#555] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thomas Cole"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] outline-hidden focus:border-[#394132]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#555] mb-1">
                      Gift Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Wishing you inspiration and joy for your beautiful new home..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] outline-hidden focus:border-[#394132]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="border-t border-[#dedbd4] pt-6">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#394132] px-6 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white hover:bg-[#26251f] transition cursor-pointer shadow-sm"
                >
                  <ShoppingBag size={16} />
                  <span>Add Gift Voucher to Bag (£{currentAmount})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
