import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItemData {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product_name: string;
  product_slug: string;
  product_sku: string;
  product_image: string | null;
  unit_price: number;
  total_price: number;
  stock_available: number;
  variant_name: string | null;
}

interface CartState {
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  isOpen: boolean;

  // Actions
  setCart: (data: {
    items: CartItemData[];
    item_count: number;
    subtotal: number;
    tax_amount: number;
    total: number;
  }) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearLocal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      isOpen: false,

      setCart: (data) =>
        set({
          items: data.items,
          itemCount: data.item_count,
          subtotal: data.subtotal,
          taxAmount: data.tax_amount,
          total: data.total,
        }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearLocal: () =>
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          taxAmount: 0,
          total: 0,
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
