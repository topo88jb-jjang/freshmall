"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartItem } from "@/lib/types";

const STORAGE_KEY = "freshmall_cart_v1";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      console.error("장바구니를 불러오지 못했습니다", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (existing) {
        const nextQty = Math.min(
          existing.quantity + item.quantity,
          item.stock
        );
        return prev.map((p) =>
          p.productId === item.productId ? { ...p, quantity: nextQty } : p
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId
            ? { ...p, quantity: Math.max(1, Math.min(quantity, p.stock)) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  };

  const clear = () => setItems([]);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart는 CartProvider 내부에서 사용하세요");
  return ctx;
}
