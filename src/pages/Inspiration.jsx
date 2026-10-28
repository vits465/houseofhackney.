import { memo } from "react";
import { Link, useSearchParams } from "react-router-dom";

const rooms = [
  {
    id: "bedroom",
    name: "Bedroom",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    desc: "Intimate sanctuaries layered with botanical velvets and nostalgic wallpapers.",
    to: "/products?search=bedroom",
  },
  {
    id: "living-room",
    name: "Living Room",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    desc: "Sumptuous conversation spaces with bold statement florals and rich textures.",
    to: "/products?search=living+room",
  },
  {
    id: "kitchen-dining",
    name: "Kitchen & Dining",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
    desc: "Gathering rooms enveloped in dramatic foliage and artisanal ceramics.",
    to: "/products?search=dining",
  },
  {
    id: "bathroom",
    name: "Bathroom",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    desc: "Serene private spa havens with brass accents and moisture-resistant prints.",
    to: "/products?search=bathroom",
  },
  {
    id: "hallway",
    name: "Hallway",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    desc: "The grand entrance: stair runners and dramatic pattern introductions.",
    to: "/products?search=hallway",
  },
];

const stories = [
  {
    title: "House Of Hackney X Axminster Carpets",
    subtitle: "A union of English textile heritage and regenerative British wool.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    tag: "Heritage Collaboration",
    to: "/products?search=carpet",
  },
  {
    title: "Wool Is Cool",
    subtitle: "Why 100% British regenerative wool is the future of sustainable interiors.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    tag: "Sustainability",
    to: "/products?search=wool",
  },
  {
    title: "WONDER GARDEN",
    subtitle: "Stepping inside our untamed botanical dreamscape at Castle Trematon.",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
    tag: "Botanical Design",
    to: "/products?search=garden",
  },
  {
    title: "The Greenprint",
    subtitle: "Our manifesto for business as a force for planetary regeneration.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    tag: "Impact Report",
    to: "/our-house?tab=greenprint",
  },
  {
    title: "The Auras: Dressing Your Home for Your Soul",
    subtitle: "Colour and pattern therapy curated to harmonise emotion and space.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    tag: "Interior Alchemy",
    to: "/inspiration?tab=auras",
  },
  {
    title: "A Wild Idea: Castle of Trematon",
    subtitle: "Transforming a Norman keep in Cornwall into an ode to biodiversity.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    tag: "Sanctuary",
    to: "/our-house?tab=trematon",
  },
];

const auras = [
  {
    id: "01",
    name: "Aura 01: To Dream",
    desc: "Soft whispers of sky, cloud reflection, and serenity for calm rest.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    palette: ["#e3ecf5", "#ccd8e8", "#92a6c2"],
    to: "/products?colour=neutrals&mood=dream",
  },
  {
    id: "02",
    name: "Aura 02: To Renew",
    desc: "Ancient forest moss and deep botanical chlorophyll reviving vitality.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    palette: ["#2d4a34", "#4a7051", "#8ba88f"],
    to: "/products?colour=greens&mood=renew",
  },
  {
    id: "03",
    name: "Aura 03: To Flourish",
    desc: "Blushing rose petals and intoxicating blooms sparking romantic creativity.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    palette: ["#c46d84", "#e8a7b8", "#f7dce2"],
    to: "/products?colour=pinks&mood=flourish",
  },
  {
    id: "04",
    name: "Aura 04: To Nurture",
    desc: "Earthy ochres, warm linen, and warm nest tones fostering unconditional comfort.",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
    palette: ["#d9b46e", "#ebd8a7", "#f5ecd7"],
    to: "/products?colour=yellows&mood=nurture",
  },
  {
    id: "05",
    name: "Aura 05: To Root",
    desc: "Rich cedar bark, deep loam, and anchored soil grounding the spirit.",
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
    palette: ["#4a3728", "#785b44", "#a88b72"],
    to: "/products?colour=neutrals&mood=root",
  },
  {
    id: "06",
    name: "Aura 06: To Nourish",
    desc: "Golden barley fields waving in the sun, filling spaces with abundance.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    palette: ["#c99a3e", "#e2be6c", "#f3dd9f"],
    to: "/products?colour=yellows&mood=nourish",
  },
];

function Inspiration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "gallery";

  const switchTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <main className="bg-[#f6f3ec] text-[#171713] min-h-screen">
      {/* Editorial Hero Header */}
      <section className="px-6 py-14 md:py-20 text-center max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[3px] text-[#4a5240] mb-3 font-medium">
          Editorial & Sanctuary
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl mb-6 tracking-tight">
          INSPIRATION
        </h1>
        <p className="font-serif text-lg md:text-xl text-[#394132] leading-relaxed max-w-2xl mx-auto">
          Immerse yourself in our rooms of wonder, stories of craftsmanship, and colour therapy tailored to elevate your living spaces.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {[
            { id: "gallery", label: "ROOM GALLERY" },
            { id: "stories", label: "STORIES" },
            { id: "auras", label: "THE AURAS" },
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

      {/* room gallery */}
      {activeTab === "gallery" && (
        <section className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={room.to}
                className="group block overflow-hidden rounded-[22px] bg-white shadow-sm border border-[#ede9e1] hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#f1ede4]">
                  <img
                    src={room.image}
                    alt={room.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <h2 className="font-serif text-2xl text-[#171713] mb-2 group-hover:underline">
                    {room.name}
                  </h2>
                  <p className="text-sm text-[#4e5449] mb-5 leading-relaxed">
                    {room.desc}
                  </p>
                  <span className="inline-block text-xs uppercase tracking-[1.5px] font-medium text-[#394132] underline underline-offset-4">
                    Explore This Room →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* stories */}
      {activeTab === "stories" && (
        <section className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Link
                key={story.title}
                to={story.to}
                className="group block overflow-hidden rounded-[22px] bg-white shadow-sm border border-[#ede9e1] hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#f1ede4]">
                  <img
                    src={story.image}
                    alt={story.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <span className="inline-block text-[11px] uppercase tracking-[1.5px] text-[#4a5240] font-semibold mb-2">
                    {story.tag}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#171713] mb-2 leading-snug group-hover:underline">
                    {story.title}
                  </h2>
                  <p className="text-sm text-[#4e5449] mb-4 leading-relaxed">
                    {story.subtitle}
                  </p>
                  <span className="text-xs uppercase tracking-[1.2px] font-medium text-[#394132] underline underline-offset-4">
                    Read Story →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* the auras */}
      {activeTab === "auras" && (
        <section className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auras.map((aura) => (
              <Link
                key={aura.id}
                to={aura.to}
                className="group block overflow-hidden rounded-[22px] bg-white shadow-sm border border-[#ede9e1] hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#f1ede4]">
                  <img
                    src={aura.image}
                    alt={aura.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-1.5 mb-3">
                    {aura.palette.map((color) => (
                      <span
                        key={color}
                        style={{ backgroundColor: color }}
                        className="h-4 w-4 rounded-full border border-black/10"
                      />
                    ))}
                  </div>
                  <h2 className="font-serif text-2xl text-[#171713] mb-2 group-hover:underline">
                    {aura.name}
                  </h2>
                  <p className="text-sm text-[#4e5449] mb-5 leading-relaxed">
                    {aura.desc}
                  </p>
                  <span className="inline-block text-xs uppercase tracking-[1.5px] font-medium text-[#394132] underline underline-offset-4">
                    Shop The Mood →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default memo(Inspiration);
