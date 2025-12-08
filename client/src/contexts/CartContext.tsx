import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, Product, SelectedOption } from "../types";

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOption[]
  ) => void;
  removeItem: (productId: number, selectedOptionsKey: string) => void;
  updateQuantity: (
    productId: number,
    selectedOptionsKey: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "hotdrop_cart";

// Generate unique key for cart item based on product and selected options
const getCartItemKey = (
  productId: number,
  selectedOptions: SelectedOption[]
): string => {
  const optionsStr = selectedOptions
    .map((opt) => `${opt.name}:${opt.choice}`)
    .sort()
    .join("|");
  return `${productId}-${optionsStr}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOption[]
  ) => {
    const itemKey = getCartItemKey(product.id, selectedOptions);

    // Calculate subtotal
    const basePrice = parseFloat(product.price);
    const optionsPrice = selectedOptions.reduce(
      (sum, opt) => sum + opt.price,
      0
    );
    const subtotal = (basePrice + optionsPrice) * quantity;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          getCartItemKey(item.product.id, item.selectedOptions) === itemKey
      );

      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          subtotal: newItems[existingIndex].subtotal + subtotal,
        };
        return newItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, selectedOptions, subtotal }];
      }
    });
  };

  const removeItem = (productId: number, selectedOptionsKey: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          getCartItemKey(item.product.id, item.selectedOptions) !==
          selectedOptionsKey
      )
    );
  };

  const updateQuantity = (
    productId: number,
    selectedOptionsKey: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, selectedOptionsKey);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (
          getCartItemKey(item.product.id, item.selectedOptions) ===
          selectedOptionsKey
        ) {
          const basePrice = parseFloat(item.product.price);
          const optionsPrice = item.selectedOptions.reduce(
            (sum, opt) => sum + opt.price,
            0
          );
          const subtotal = (basePrice + optionsPrice) * quantity;
          return { ...item, quantity, subtotal };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
