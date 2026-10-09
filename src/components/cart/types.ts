export type CartItem = {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  priceType: "ECER" | "GROSIR";
};

export type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
};
