import { memo } from "react";
import { Search, UserRound, ShoppingBag } from "lucide-react";
import IconButton from "../common/IconButton";

function HeaderActions() {
  return (
    <div className="flex items-center gap-0.5 md:gap-3">
      <div className="hidden md:block">
        <IconButton
          icon={Search}
          label="Search products"
          onClick={() => console.log("Search clicked")}
        />
      </div>

      <IconButton
        icon={UserRound}
        label="My account"
        onClick={() => console.log("Account clicked")}
      />

      <IconButton
        icon={ShoppingBag}
        label="Shopping bag"
        onClick={() => console.log("Cart clicked")}
      />
    </div>
  );
}

export default memo(HeaderActions);