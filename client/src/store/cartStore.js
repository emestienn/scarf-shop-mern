import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, { color, colorHex, size, quantity = 1 } = {}) => {
        const { items } = get();
        const key = `${product._id}-${color || ''}-${size || ''}`;
        const existing = items.find((i) => i.key === key);

        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                key,
                product: product._id,
                name: product.name?.ru || product.name,
                image: product.images?.[0],
                slug: product.slug,
                retailPrice: product.retailPrice,
                wholesaleTiers: product.wholesaleTiers,
                color,
                colorHex,
                size,
                quantity,
                unitPrice: product.retailPrice,
              },
            ],
          });
        }
        set({ isOpen: true });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return get().removeItem(key);
        set({ items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)) });
      },

      clearCart: () => set({ items: [] }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      },

      get shippingCost() {
        const sub = get().subtotal;
        return sub >= 500000 ? 0 : 30000;
      },

      get total() {
        return get().subtotal + get().shippingCost;
      },

      applyWholesalePricing: (isWholesale) => {
        if (!isWholesale) return;
        set({
          items: get().items.map((item) => {
            if (!item.wholesaleTiers?.length) return item;
            const tiers = [...item.wholesaleTiers].sort((a, b) => b.minQuantity - a.minQuantity);
            let price = item.retailPrice;
            for (const tier of tiers) {
              if (item.quantity >= tier.minQuantity) { price = tier.pricePerUnit; break; }
            }
            return { ...item, unitPrice: price };
          }),
        });
      },
    }),
    {
      name: 'lp-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
