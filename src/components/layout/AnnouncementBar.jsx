import { memo } from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="flex min-h-8 flex-wrap font-medium items-center justify-between gap-2 bg-[#3b3d2f] leading-[2] text-xs px-4 py-1 text-[12px] text-white md:px-8">
      <Link
        to="/products?category=wallpaper"
        className="hover:underline hover:text-[#ded9c7] transition-colors"
      >
        Order wallpaper samples straight to your door
      </Link>

      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/trade" className="hidden hover:underline sm:block">
          <span className="mr-2 text-[15px] text-[#ded9c7]">●</span>
          Apply for a TRADE discount
        </Link>
        <Link to="/help" className="hover:underline">
          Help
        </Link>
        <Link to="/faqs" className="hidden hover:underline sm:block">
          FAQs
        </Link>
        <div className="flex items-center gap-2">
          Intl / GBP <Globe size={15} />
        </div>
      </div>
    </div>
  );
}

export default memo(AnnouncementBar);