import { memo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, HeartHandshake, Leaf, Sparkles } from "lucide-react";

function OurHouse({ defaultTab = "about" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || defaultTab || "about";

  const switchTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <main className="bg-[#f6f3ec] text-[#171713] min-h-screen">
      {/* Hero Header */}
      <section className="px-6 py-14 md:py-20 text-center max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[3px] text-[#4a5240] mb-3 font-medium">
          Our Story & Regenerative Journey
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl mb-6 tracking-tight">
          OUR HOUSE
        </h1>
        <p className="font-serif text-lg md:text-xl text-[#394132] leading-relaxed max-w-2xl mx-auto">
          Founded in London, rooted in nature. Discover our iconic sanctuaries, our devotion to British craftsmanship, and our regenerative manifesto.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {[
            { id: "about", label: "ABOUT US" },
            { id: "showrooms", label: "OUR SHOWROOMS" },
            { id: "regenerative", label: "OUR IMPACT" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`rounded-xl px-6 py-2.5 text-xs tracking-[1.5px] uppercase font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#394132] text-white shadow-sm"
                  : "bg-white/80 text-[#171713] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 1. ABOUT US */}
      {activeTab === "about" && (
        <section className="px-6 pb-24 max-w-6xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white rounded-[26px] p-8 md:p-12 border border-[#ede9e1] shadow-sm">
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80"
                alt="In the Company of Nature"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[2px] text-[#4a5240] font-semibold">
                The Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#171713] mt-2 mb-5">
                In The Company of Nature
              </h2>
              <p className="text-base text-[#4a5042] leading-relaxed mb-6">
                House of Hackney was created as an antidote to bland, disposable interiors. We believe the home should be a temple of creativity, filled with vibrant prints that celebrate the natural world while protecting it.
              </p>
              <Link
                to="/products?search=book"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[1.5px] font-semibold text-[#394132] underline underline-offset-4 hover:opacity-75"
              >
                Discover Our Book <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-[22px] p-8 border border-[#ede9e1] text-center">
              <Leaf className="mx-auto mb-4 text-[#394132]" size={36} />
              <h3 className="font-serif text-xl mb-3">100% Eco-Materials</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                From organic velvets to British regenerative wool and low-VOC paints made from natural minerals.
              </p>
            </div>
            <div className="bg-white rounded-[22px] p-8 border border-[#ede9e1] text-center">
              <ShieldCheck className="mx-auto mb-4 text-[#394132]" size={36} />
              <h3 className="font-serif text-xl mb-3">Certified B Corp</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                Holding the highest verified standards of social and environmental performance, transparency, and accountability.
              </p>
            </div>
            <div className="bg-white rounded-[22px] p-8 border border-[#ede9e1] text-center">
              <HeartHandshake className="mx-auto mb-4 text-[#394132]" size={36} />
              <h3 className="font-serif text-xl mb-3">Nature on the Board</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                The first luxury brand to appoint Mother Nature and Future Generations as legal directors of our company.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2. SHOWROOMS */}
      {activeTab === "showrooms" && (
        <section className="px-6 pb-24 max-w-6xl mx-auto space-y-12">
          <div className="bg-white rounded-[26px] p-8 md:p-12 border border-[#ede9e1] shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="St Michael's Clerkenwell"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[2px] text-[#4a5240] font-semibold">
                London Flagship
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#171713] mt-2 mb-4">
                St Michael&apos;s Clerkenwell
              </h2>
              <p className="text-base text-[#4a5042] leading-relaxed mb-6">
                Set within a Grade II listed gothic church in London, St Michael&apos;s is a cathedral of pattern, colour, and divine interiors. Experience our complete wallpaper and fabric archives in person.
              </p>
              <Link
                to="/design-services"
                className="inline-block rounded-xl bg-[#394132] px-6 py-3 text-xs tracking-[1.5px] uppercase font-medium text-white shadow-sm hover:opacity-90"
              >
                Book a London Consultation
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-[26px] p-8 md:p-12 border border-[#ede9e1] shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80"
                alt="Castle of Trematon"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[2px] text-[#4a5240] font-semibold">
                Cornwall Sanctuary
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#171713] mt-2 mb-4">
                Castle of Trematon
              </h2>
              <p className="text-base text-[#4a5042] leading-relaxed mb-6">
                Our 9-acre botanical haven in Cornwall. An ancient Norman keep where we restore biodiversity, cultivate rare flora, and inspire our seasonal collections.
              </p>
              <Link
                to="/products?category=wallpaper"
                className="inline-block rounded-xl bg-[#394132] px-6 py-3 text-xs tracking-[1.5px] uppercase font-medium text-white shadow-sm hover:opacity-90"
              >
                Explore Castle Collections
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. OUR IMPACT */}
      {activeTab === "regenerative" && (
        <section className="px-6 pb-24 max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl sm:text-5xl text-[#171713] mb-4">
              Our Regenerative Journey
            </h2>
            <p className="text-base text-[#4a5042] leading-relaxed">
              We don&apos;t just aim to reduce harm — our mission is active planetary regeneration. Every purchase pays an Earth Tax directly into biodiversity and rewilding trusts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[22px] p-7 border border-[#ede9e1]">
              <Sparkles className="mb-3 text-[#394132]" size={30} />
              <h3 className="font-serif text-xl mb-2">Investing in Nature</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                Voluntary Earth Tax and Nature Licensing fees supporting the preservation of wild habitats across the UK.
              </p>
            </div>
            <div className="bg-white rounded-[22px] p-7 border border-[#ede9e1]">
              <Leaf className="mb-3 text-[#394132]" size={30} />
              <h3 className="font-serif text-xl mb-2">Materials & Makers</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                100% British regenerative wool, non-toxic mineral paints, and traceable European flax linen.
              </p>
            </div>
            <div className="bg-white rounded-[22px] p-7 border border-[#ede9e1]">
              <HeartHandshake className="mb-3 text-[#394132]" size={30} />
              <h3 className="font-serif text-xl mb-2">Activism & Influence</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                #WeAreNature campaigns, William Morris Art Futures Bursary, and championing climate justice.
              </p>
            </div>
            <div className="bg-white rounded-[22px] p-7 border border-[#ede9e1]">
              <ShieldCheck className="mb-3 text-[#394132]" size={30} />
              <h3 className="font-serif text-xl mb-2">Governance & Culture</h3>
              <p className="text-sm text-[#4e5449] leading-relaxed">
                Nature Fridays, transparent greenhouse gas accounting, and audited annual impact reports.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default memo(OurHouse);
