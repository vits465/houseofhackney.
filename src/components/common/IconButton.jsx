import { memo } from "react";

function IconButton({ icon: Icon, label, onClick, count = 0 }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative grid h-9 w-9 place-items-center transition-opacity hover:opacity-60 md:h-10 md:w-10"
    >
      <Icon size={21} strokeWidth={1.5} />

      {count > 0 && (
        <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export default memo(IconButton);