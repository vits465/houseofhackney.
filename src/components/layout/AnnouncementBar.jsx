import { memo } from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="flex min-h-8 items-center justify-between bg-[#3b3d2f] px-4 py-1 text-xs text-white md:px-8">
      {/* Primary announcement banner */}
      <div className="w-full text-center sm:w-auto sm:text-left truncate font-medium text-[11px] sm:text-xs">
        <Link
          to="/products?category=wallpaper"
          className="hover:underline hover:text-[#ded9c7] transition-colors"
        >
          Order wallpaper samples straight to your door
        </Link>
      </div>

      {/* Auxiliary links on tablet and desktop */}
      <div className="hidden sm:flex items-center gap-4 md:gap-6 shrink-0 text-[11px] sm:text-xs font-medium">
        <Link to="/trade" className="hidden lg:block hover:underline">
          <span className="mr-2 text-[15px] text-[#ded9c7]">●</span>
          Apply for a TRADE discount
        </Link>
        <Link to="/help" className="hover:underline">
          Help
        </Link>
        <Link to="/faqs" className="hidden sm:block hover:underline">
          FAQs
        </Link>
        <div className="flex items-center gap-1.5">
          <span>Intl / GBP</span>
          <Globe size={14} />
        </div>
      </div>
    </div>
  );
}

export default memo(AnnouncementBar);