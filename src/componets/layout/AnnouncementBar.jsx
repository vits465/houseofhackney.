import { memo } from "react";
import { Globe } from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="flex min-h-8 flex-wrap font-medium items-center justify-between  gap-2 bg-[#3b3d2f] leading-[2] text-xs px-4 py-1 text-[12px] text-white md:px-8">
      <p>Order wallpaper samples straight to your door</p>

      <div className="flex items-center gap-4 md:gap-6">
        <a href="/trade" className="hidden hover:underline sm:block">
          <span className="mr-2 text-[15px] text-[#ded9c7]">●</span>
          Apply for a TRADE discount
        </a>
        <a href="/help" className="hover:underline">Help</a>
        <a href="/faqs" className="hidden hover:underline sm:block">FAQs</a>
        <button type="button" className="flex items-center gap-2">
          Intl / GBP <Globe size={15} />
        </button>
      </div>
    </div>
  );
}

export default memo(AnnouncementBar);