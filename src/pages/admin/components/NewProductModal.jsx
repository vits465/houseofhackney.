import { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast } from "../../../utils/sweetAlert";

const PRESET_IMAGES = [
  {
    label: "Babylon Wallpaper",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
  },
  {
    label: "Artemis Velvet Sofa",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
  },
  {
    label: "Alice Jacquard Cushion",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
  },
  {
    label: "Woad Mineral Paint",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
  },
];

export default function NewProductModal() {
  const { newProductOpen, setNewProductOpen, theme } = useAdmin();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "Phantasia Botanical Velvet Cushion",
    category: "Home Decor",
    price: "225.00",
    stock: "35",
    description:
      "Handcrafted in England from 100% British cotton velvet, edged with opulent bullion fringe.",
    image: PRESET_IMAGES[2].url,
  });

  if (!newProductOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Luxury creation registered into Atelier catalog!");
    setNewProductOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => setNewProductOpen(false)}
      />

      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isDark
            ? "bg-[#18201a] border-[#293a2c] text-[#f2f7f3]"
            : "bg-white border-[#e2ece4] text-[#1e2a21]"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "border-[#293a2c]" : "border-[#e5ede6]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-2xl ${
                isDark ? "bg-[#212c23] text-[#74b886]" : "bg-[#eaf5ed] text-[#347847]"
              }`}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-sans text-base font-bold">
                Add Luxury Creation
              </h3>
              <p
                className={`text-xs ${
                  isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
                }`}
              >
                Register bespoke piece into House of Hackney catalog
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewProductOpen(false)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? "bg-[#141a15] border-[#253327]"
                : "bg-[#f5f9f6] border-[#d8e6dc]"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content: Form + Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form
            id="new-product-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-1.5 font-semibold">
                  Creation Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm font-sans focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#141a15] border-[#253327] focus:border-[#4a8b5e]"
                      : "bg-[#f5f9f6] border-[#d8e6dc] focus:border-[#1e2a21]"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-1.5 font-semibold">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-sans focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#141a15] border-[#253327] focus:border-[#4a8b5e]"
                        : "bg-[#f5f9f6] border-[#d8e6dc] focus:border-[#1e2a21]"
                    }`}
                  >
                    <option value="Wallpaper">Wallpaper & Murals</option>
                    <option value="Fabric">British Fabric & Velvet</option>
                    <option value="Home Decor">Home Decor & Cushions</option>
                    <option value="Paint">Architectural Paint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-1.5 font-semibold">
                    Price (£ GBP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-mono focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#141a15] border-[#253327] focus:border-[#4a8b5e]"
                        : "bg-[#f5f9f6] border-[#d8e6dc] focus:border-[#1e2a21]"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-1.5 font-semibold">
                    Atelier Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-mono focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#141a15] border-[#253327] focus:border-[#4a8b5e]"
                        : "bg-[#f5f9f6] border-[#d8e6dc] focus:border-[#1e2a21]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-1.5 font-semibold">
                    Origin / Atelier
                  </label>
                  <input
                    type="text"
                    defaultValue="Made in England"
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-sans focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#141a15] border-[#253327] focus:border-[#4a8b5e]"
                        : "bg-[#f5f9f6] border-[#d8e6dc] focus:border-[#1e2a21]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-1.5 font-semibold">
                  Craftsmanship Description
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-sans focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#141a15] border-[#253327] focus:border-[#4a8b5e]"
                      : "bg-[#f5f9f6] border-[#d8e6dc] focus:border-[#1e2a21]"
                  }`}
                />
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-2 font-semibold">
                  Select Visual Asset:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setForm({ ...form, image: img.url })}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                        form.image === img.url
                          ? "border-[#4a8b5e] ring-2 ring-[#4a8b5e]/40"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                      {form.image === img.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#4a8b5e] text-white flex items-center justify-center">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Card (5 cols) */}
            <div className="lg:col-span-5">
              <span className="block text-xs font-mono uppercase tracking-wider text-[#3e7b52] dark:text-[#74b886] mb-2 font-semibold">
                Live Storefront Preview
              </span>
              <div
                className={`p-4 rounded-3xl border transition-all ${
                  isDark
                    ? "bg-[#141a15] border-[#253327]"
                    : "bg-[#fcfdfc] border-[#e7f0e9]"
                }`}
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative mb-3">
                  <img
                    src={form.image}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-[#1e2a21]/80 text-white backdrop-blur-md">
                    {form.category}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-base line-clamp-1 text-[#1e2a21] dark:text-[#f2f7f3]">
                  {form.name || "Untitled Creation"}
                </h4>

                <div className="flex items-center justify-between mt-1.5 font-mono">
                  <span className="text-sm font-bold text-[#3e7b52] dark:text-[#74b886]">
                    £{Number(form.price || 0).toFixed(2)}
                  </span>
                  <span className="text-xs opacity-70">
                    {form.stock} units ready
                  </span>
                </div>

                <p
                  className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                    isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                  }`}
                >
                  {form.description}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between text-xs ${
            isDark
              ? "bg-[#141a15] border-[#293a2c] text-[#7f9183]"
              : "bg-[#f5f9f6] border-[#e5ede6] text-[#788c7e]"
          }`}
        >
          <span>Saved to Central Inventory</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNewProductOpen(false)}
              className="px-4 py-2 rounded-full border font-sans hover:bg-current/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-product-form"
              className="px-5 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white font-sans font-bold uppercase tracking-wider shadow-sm shadow-[#3e7b52]/20 transition-colors"
            >
              Publish Creation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
