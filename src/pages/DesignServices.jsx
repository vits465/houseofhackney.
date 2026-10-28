import { memo } from "react";
import { Link } from "react-router-dom";
import { Monitor, Store, Home as HomeIcon } from "lucide-react";

function DesignServices() {
  return (
    <main className="bg-[#f6f3ec] text-[#171713] min-h-screen px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[3px] text-[#4a5240] mb-3 font-medium">
          Complimentary Consultations
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl mb-6 tracking-tight">
          THREE WAYS TO MEET
        </h1>
        <p className="font-serif text-lg md:text-xl text-[#394132] leading-relaxed max-w-2xl mx-auto">
          Whether you are decorating an entire country estate or a single powder room, our interior design team will guide your journey with bespoke mood boards, scale advice, and complimentary sample packs.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* virtually */}
        <div className="bg-white rounded-[26px] p-8 md:p-10 border border-[#ede9e1] shadow-sm text-center flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div>
            <div className="w-16 h-16 rounded-full bg-[#f1ede4] mx-auto mb-6 flex items-center justify-center text-[#394132]">
              <Monitor size={30} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-2">VIRTUALLY</h2>
            <p className="text-xs uppercase tracking-[1.5px] font-semibold text-[#4a5240] mb-4">
              Online • Complimentary
            </p>
            <p className="text-sm text-[#4e5449] leading-relaxed mb-6">
              Connect 1-on-1 with an expert designer via video call from the comfort of your home. Receive digital mood boards and sample deliveries direct to your doorstep.
            </p>
          </div>
          <Link
            to="/contact?service=virtual"
            className="w-full rounded-xl bg-[#394132] py-3 text-xs tracking-[1.5px] uppercase font-medium text-white hover:opacity-90 transition-opacity"
          >
            Book Virtual Meeting
          </Link>
        </div>

        {/* in store */}
        <div className="bg-white rounded-[26px] p-8 md:p-10 border border-[#ede9e1] shadow-sm text-center flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div>
            <div className="w-16 h-16 rounded-full bg-[#f1ede4] mx-auto mb-6 flex items-center justify-center text-[#394132]">
              <Store size={30} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-2">IN STORE</h2>
            <p className="text-xs uppercase tracking-[1.5px] font-semibold text-[#4a5240] mb-4">
              London / New York • Complimentary
            </p>
            <p className="text-sm text-[#4e5449] leading-relaxed mb-6">
              Visit our flagship church showroom at St Michael&apos;s or the New York Design Center. Explore full wall drops, oversized swatches, and bespoke paint matchings.
            </p>
          </div>
          <Link
            to="/contact?service=store"
            className="w-full rounded-xl bg-[#394132] py-3 text-xs tracking-[1.5px] uppercase font-medium text-white hover:opacity-90 transition-opacity"
          >
            Book In-Store Visit
          </Link>
        </div>

        {/* at home */}
        <div className="bg-white rounded-[26px] p-8 md:p-10 border border-[#ede9e1] shadow-sm text-center flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div>
            <div className="w-16 h-16 rounded-full bg-[#f1ede4] mx-auto mb-6 flex items-center justify-center text-[#394132]">
              <HomeIcon size={30} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-2">AT HOME</h2>
            <p className="text-xs uppercase tracking-[1.5px] font-semibold text-[#4a5240] mb-4">
              In Person At Home • Bespoke
            </p>
            <p className="text-sm text-[#4e5449] leading-relaxed mb-6">
              Our senior decorators visit your residence to take precise measurements, inspect natural lighting, and create an end-to-end transformation scheme.
            </p>
          </div>
          <Link
            to="/contact?service=home"
            className="w-full rounded-xl bg-[#394132] py-3 text-xs tracking-[1.5px] uppercase font-medium text-white hover:opacity-90 transition-opacity"
          >
            Enquire For Home Visit
          </Link>
        </div>
      </div>
    </main>
  );
}

export default memo(DesignServices);
