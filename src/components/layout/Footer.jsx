import { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";
import { showToast } from "../../utils/sweetAlert";

function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      return;
    }
    showToast("Thank you for joining our House!");
    setEmail("");
  };

  return (
    <footer className="bg-[#2d3527] text-[#f6f3ec] pt-16 pb-12 transition-colors">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Newsletter Column (Left - 6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-wider uppercase text-[#f6f3ec]">
                Add Some Colour<br />To Your Inbox
              </h2>
              <p className="mt-4 max-w-md text-xs sm:text-sm leading-6 text-[#d8d3c5]/90">
                Become a House of Hackney insider and get a weekly dose of interior ideas, expert decorating advice and inspiring real homes, from our House, to yours.
              </p>

              <form onSubmit={handleSubscribe} className="mt-8 max-w-md space-y-5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    aria-label="Email address for newsletter"
                    className="w-full border-b border-[#f6f3ec]/40 bg-transparent py-2.5 text-sm text-[#f6f3ec] placeholder-[#d8d3c5]/60 outline-none transition focus:border-[#f6f3ec]"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-block rounded-full border border-[#f6f3ec] px-8 py-2 text-[10px] font-medium tracking-[2px] uppercase text-[#f6f3ec] hover:bg-[#f6f3ec] hover:text-[#2d3527] transition"
                  >
                    SIGN UP
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-10 pt-6 border-t border-[#f6f3ec]/10 text-[11px] text-[#d8d3c5]/70">
              <p>Certified B Corporation meeting the highest standards of verified social and environmental performance.</p>
            </div>
          </div>

          {/* Links Column (Right - 6 cols) */}
          <div className="lg:col-span-6 lg:pl-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BrandLogo className="w-12 h-auto text-[#f6f3ec]" />
              </div>
              <p className="font-serif text-xs tracking-[4px] uppercase text-[#f6f3ec] mb-8">
                HOUSE OF HACKNEY
              </p>

              <nav className="flex flex-col space-y-3.5 text-xs sm:text-sm text-[#d8d3c5]/90">
                <Link to="/products" className="hover:text-white transition w-fit">
                  Shop All Collections
                </Link>
                <Link to="/design-services" className="hover:text-white transition w-fit">
                  Interior Design Services
                </Link>
                <Link to="/products?category=wallpaper" className="hover:text-white transition w-fit">
                  Order Wallpaper Samples
                </Link>
                <Link to="/products?category=fabric" className="hover:text-white transition w-fit">
                  Order Fabric Samples
                </Link>
                <Link to="/gift-voucher" className="hover:text-white transition w-fit">
                  Gift Voucher
                </Link>
                <Link to="/stockists" className="hover:text-white transition w-fit">
                  Our Stockists & Showrooms
                </Link>
                <Link to="/trade" className="hover:text-white transition w-fit">
                  Trade Programme Overview
                </Link>
                <Link to="/trade/register" className="hover:text-white transition w-fit">
                  Apply for a Trade Account
                </Link>
                <Link to="/trade/login" className="hover:text-white transition w-fit">
                  Trade Partner Login
                </Link>
              </nav>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-[11px] text-[#d8d3c5]/70">
              <span>Intl / GBP (£)</span>
              <span>•</span>
              <span>Made in England</span>
              <span>•</span>
              <span>Eco-Conscious Luxury</span>
            </div>
          </div>
        </div>

        {/* Lower Legal Bar */}
        <div className="mt-14 border-t border-[#f6f3ec]/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-wider text-[#d8d3c5]/60">
          <p>© {new Date().getFullYear()} HOUSE OF HACKNEY. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition">
              Terms & Conditions
            </Link>
            <Link to="/cookies" className="hover:text-white transition">
              Cookie Preferences
            </Link>
            <Link to="/accessibility" className="hover:text-white transition">
              Accessibility
            </Link>
            <span className="opacity-30">•</span>
            <Link
              to="/admin"
              className="text-[#b89758] hover:text-[#d6bb82] font-semibold transition"
            >
              Atelier CMS (Admin)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
