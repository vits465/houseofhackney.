import { memo } from "react";
import { Link } from "react-router-dom";
import { Award, Gift, Clock, Sparkles } from "lucide-react";

function Trade() {
  return (
    <main className="bg-[#f6f3ec] text-[#171713] min-h-screen px-6 py-14 md:py-20">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[3px] text-[#4a5240] mb-3 font-medium">
          Exclusive Professional Programme
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl mb-6 tracking-tight">
          HOUSE OF HACKNEY TRADE
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-[#171713] font-medium mb-4">
          FRIENDS WITH BENEFITS
        </p>
        <p className="text-base text-[#4a5042] leading-relaxed max-w-2xl mx-auto mb-8">
          As a Trade Account holder, you will have access to our exclusive Trade site which offers complimentary samples and a range of other exclusive benefits.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register?type=trade"
            className="rounded-xl bg-[#394132] px-7 py-3 text-xs tracking-[1.5px] uppercase font-medium text-white shadow-sm hover:opacity-90"
          >
            Apply For A Trade Account
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-[#394132] px-7 py-3 text-xs tracking-[1.5px] uppercase font-medium text-[#394132] hover:bg-[#394132] hover:text-white transition-colors"
          >
            Already A Member? Log In
          </Link>
        </div>
      </div>

      {/* 3 Tiers matching frames 45-46 */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="font-serif text-2xl sm:text-3xl text-center mb-10">
          THREE TIERS OF MEMBERSHIP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[22px] bg-white p-8 border border-[#ede9e1] text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] uppercase tracking-[2px] text-[#4a5240] font-semibold">Tier 1</span>
            <h3 className="font-serif text-2xl text-[#171713] mt-2 mb-3">TRADE</h3>
            <p className="text-3xl font-serif text-[#394132] mb-4">15% OFF</p>
            <p className="text-xs text-[#52594b] leading-relaxed">
              Standard professional discount across all wallpaper, fabric, and paint collections.
            </p>
          </div>

          <div className="rounded-[22px] bg-[#394132] text-white p-8 shadow-xl text-center relative overflow-hidden">
            <span className="text-[11px] uppercase tracking-[2px] text-[#ded9c7] font-semibold">Tier 2</span>
            <h3 className="font-serif text-2xl mt-2 mb-3">TRADE SILVER</h3>
            <p className="text-3xl font-serif text-[#f6f3ec] mb-4">20% OFF</p>
            <p className="text-xs text-[#d2cec3] leading-relaxed">
              For active interior design studios with annual spend exceeding £5,000. Priority turnaround.
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-8 border border-[#ede9e1] text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] uppercase tracking-[2px] text-[#4a5240] font-semibold">Tier 3</span>
            <h3 className="font-serif text-2xl text-[#171713] mt-2 mb-3">TRADE GOLD</h3>
            <p className="text-3xl font-serif text-[#394132] mb-4">25% OFF</p>
            <p className="text-xs text-[#52594b] leading-relaxed">
              Our highest prestige tier for global commercial and luxury residential firms. Bespoke recolouring included.
            </p>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#ede9e1]">
          <Gift className="text-[#394132] mb-3" size={26} />
          <h4 className="font-serif text-lg mb-1">Free Large Samples</h4>
          <p className="text-xs text-[#52594b] leading-relaxed">Order complimentary memo swatches and full-width wallpaper cuts.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#ede9e1]">
          <Award className="text-[#394132] mb-3" size={26} />
          <h4 className="font-serif text-lg mb-1">Dedicated Concierge</h4>
          <p className="text-xs text-[#52594b] leading-relaxed">Direct line to senior account managers for quotes and lead time reserves.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#ede9e1]">
          <Clock className="text-[#394132] mb-3" size={26} />
          <h4 className="font-serif text-lg mb-1">Priority Sampling</h4>
          <p className="text-xs text-[#52594b] leading-relaxed">Fast-track dispatch on all client sampling packages worldwide.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#ede9e1]">
          <Sparkles className="text-[#394132] mb-3" size={26} />
          <h4 className="font-serif text-lg mb-1">Custom & Bespoke</h4>
          <p className="text-xs text-[#52594b] leading-relaxed">Custom sizing, substrate alterations, and hospitality flame certifications.</p>
        </div>
      </div>
    </main>
  );
}

export default memo(Trade);
