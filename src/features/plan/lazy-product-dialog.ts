import dynamic from "next/dynamic";

/** The product dialog loads on first open; hovering or focusing a product starts the download early. */
export const ProductDialog = dynamic(() => import("@/features/plan/product-dialog").then((m) => m.ProductDialog));

export function preloadProductDialog() {
  void import("@/features/plan/product-dialog");
}
