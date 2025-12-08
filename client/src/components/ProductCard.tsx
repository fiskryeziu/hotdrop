import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatCurrency } from "../utils/formatters";
import { Button } from "./Button";
import { Plus } from "lucide-react";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl =
    product.imageUrl ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-500">
            {formatCurrency(product.price)}
          </span>

          <Link to={`/products/${product.id}`}>
            <Button size="sm" className="gap-1">
              <Plus size={16} />
              Add
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
