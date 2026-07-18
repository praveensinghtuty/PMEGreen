import { Heart } from "lucide-react";

import {
  addProductToWishlistAction,
  removeProductFromWishlistAction,
} from "@/features/wishlist/actions/wishlist";
import { cn } from "@/lib/utils/cn";

export function WishlistToggleForm({
  isWishlisted,
  productId,
  returnPath,
}: {
  isWishlisted: boolean;
  productId: string;
  returnPath: string;
}) {
  return (
    <form
      action={
        isWishlisted
          ? removeProductFromWishlistAction
          : addProductToWishlistAction
      }
    >
      <input name="productId" type="hidden" value={productId} />
      <input name="returnPath" type="hidden" value={returnPath} />
      <button
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isWishlisted && "border-primary text-primary",
        )}
        type="submit"
      >
        <Heart
          aria-hidden="true"
          className={cn("size-5", isWishlisted && "fill-current")}
        />
      </button>
    </form>
  );
}
