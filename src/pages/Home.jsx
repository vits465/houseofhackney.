import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Wallpaper",
    subtitle: "Transform your walls",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    link: "/shop/wallpaper",
  },
  {
    title: "Fabric",
    subtitle: "Patterns to live with",
    image:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1000&q=85",
    link: "/shop/fabric",
  },
  {
    title: "Home Decor",
    subtitle: "Details that make a home",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    link: "/shop/home-decor",
  },
  {
    title: "Furnishings",
    subtitle: "Make a statement",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    link: "/shop/furnishings",
  },
];

function Home() {
  return (
    <main className="overflow-hidden bg-[#f6f3ec] text-[#26251f]">

      {/* HERO CAMPAIGN */}
      <section
        id="home-hero"
        className="grid grid-cols-1 md:min-h-[560px] md:grid-cols-2 lg:min-h-[620px]"
      >
        {/* Campaign photograph */}
        <div className="relative h-[58svh] min-h-[350px] overflow-hidden sm:h-[65svh] md:h-auto md:min-h-[560px] lg:min-h-[620px]">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90"
            alt="Pattern-rich interior inspiration"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>

        {/* Campaign text */}
        <div className="flex items-center justify-center bg-[#632b28] px-6 py-16 text-center text-[#fffaf3] sm:px-12 sm:py-20 md:px-8 md:py-12 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[540px]">
            <p className="mb-6 text-[10px] tracking-[3px] sm:text-[11px]">
              HOUSE OF HACKNEY
            </p>

            <h1 className="font-serif text-[clamp(38px,5.1vw,76px)] uppercase leading-[1.04] tracking-[-1.5px]">
              Favourites
              <br />
              to Fall For
            </h1>

            <div className="mx-auto my-7 h-px w-12 bg-[#d8c4a5]" />

            <p className="mx-auto max-w-[390px] text-[13px] leading-7 text-[#fffaf3]/90 sm:text-sm sm:leading-7">
              From wildflower meadows and William Morris classics to
              fantasy foliage prints, bring nature home this Autumn
              with our House Favourites.
            </p>

            <Link
              to="/shop/wallpaper"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 border border-[#fffaf3]/80 px-7 py-4 text-[10px] tracking-[1.7px] transition-colors duration-300 hover:bg-[#fffaf3] hover:text-[#632b28] sm:text-[11px]"
            >
              SHOP WALLPAPER
              <ArrowRight size={15} strokeWidth={1.4} />
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="px-6 py-16 text-center sm:px-10 sm:py-20 md:py-24">
        <p className="mb-4 text-[10px] tracking-[2.5px]">
          A WORLD OF PATTERN
        </p>

        <h2 className="mx-auto max-w-3xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          Interiors for the love of Nature.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#666257]">
          Discover expressive prints, considered craftsmanship and
          characterful designs inspired by the natural world.
        </p>

        <Link
          to="/our-house"
          className="mt-7 inline-flex items-center gap-2 border-b border-[#26251f] pb-1 text-[10px] tracking-[1.5px] transition-opacity hover:opacity-60"
        >
          DISCOVER OUR HOUSE
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="px-5 pb-16 sm:px-8 md:px-12 md:pb-24">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="mb-3 text-[10px] tracking-[2px]">
              FIND YOUR NEXT FAVOURITE
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl">
              Shop by category
            </h2>
          </div>

          <Link
            to="/shop"
            className="mb-1 hidden items-center gap-2 text-[10px] tracking-[1.2px] underline underline-offset-4 sm:inline-flex"
          >
            SHOP ALL
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              to={category.link}
              className="group min-w-0"
            >
              <div className="overflow-hidden bg-[#e8e2d7]">
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>

              <div className="flex items-start justify-between gap-2 pt-4">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl">
                    {category.title}
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-[#777267] sm:text-xs">
                    {category.subtitle}
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  strokeWidth={1.3}
                  className="mt-1 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL FEATURE */}
      <section className="grid grid-cols-1 bg-[#e8e3d8] md:grid-cols-2">
        <div className="relative min-h-[330px] overflow-hidden sm:min-h-[430px] md:min-h-[560px]">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
            alt="Layered textures and expressive interior styling"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center px-7 py-16 sm:px-12 md:px-10 lg:px-16 xl:px-20">
          <div className="max-w-md">
            <p className="mb-5 text-[10px] tracking-[2.5px]">
              THE ART OF LIVING
            </p>

            <h2 className="font-serif text-4xl leading-[1.1] sm:text-5xl">
              A home with a story to tell.
            </h2>

            <p className="mt-6 text-sm leading-7 text-[#666257]">
              Discover ideas, considered details and unexpected
              combinations to help make your space your own.
            </p>

            <Link
              to="/inspiration"
              className="mt-8 inline-flex items-center gap-3 border-b border-[#26251f] pb-2 text-[10px] tracking-[1.5px] transition-opacity hover:opacity-60"
            >
              EXPLORE INSPIRATION
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* DESIGN SERVICES */}
      <section className="px-6 py-16 text-center sm:py-20 md:py-24">
        <p className="mb-4 text-[10px] tracking-[2.5px]">
          A LITTLE HELP FROM OUR HOUSE
        </p>

        <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
          Have a vision for your space?
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#666257]">
          Explore our interior design services and discover how to
          bring your ideas to life with pattern, colour and texture.
        </p>

        <Link
          to="/design-services"
          className="mt-7 inline-flex items-center gap-3 bg-[#394132] px-7 py-4 text-[10px] tracking-[1.5px] text-white transition-colors hover:bg-[#282e23]"
        >
          DISCOVER DESIGN SERVICES
          <ArrowRight size={15} />
        </Link>
      </section>

    </main>
  );
}

export default memo(Home);
