import React from "react";
import type { CartItem as CartItemType } from "../types";
import { formatCurrency } from "../utils/formatters";
import { Button } from "./Button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";

const getCartItemKey = (item: CartItemType): string => {
  const optionsStr = item.selectedOptions
    .map((opt) => `${opt.name}:${opt.choice}`)
    .sort()
    .join("|");
  return `${item.product.id}-${optionsStr}`;
};

export const CartItem: React.FC<{ item: CartItemType }> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const itemKey = getCartItemKey(item);
  const imageUrl =
    item.product.imageUrl ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop";

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <img
        src={imageUrl}
        alt={item.product.name}
        className="w-24 h-24 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>

        {item.selectedOptions.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {item.selectedOptions.map((opt, idx) => (
              <p key={idx} className="text-sm text-gray-600">
                {opt.name}: <span className="font-medium">{opt.choice}</span>
                {opt.price > 0 && ` (+${formatCurrency(opt.price)})`}
              </p>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateQuantity(item.product.id, itemKey, item.quantity - 1)
              }
              className="w-8 h-8 p-0"
            >
              <Minus size={16} />
            </Button>
            <span className="font-medium w-8 text-center">{item.quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateQuantity(item.product.id, itemKey, item.quantity + 1)
              }
              className="w-8 h-8 p-0"
            >
              <Plus size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-orange-500">
              {formatCurrency(item.subtotal)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeItem(item.product.id, itemKey)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
