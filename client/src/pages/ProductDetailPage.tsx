import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { useCart } from "../contexts/CartContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { formatCurrency } from "../utils/formatters";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import type { SelectedOption } from "../types";

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(Number(productId));
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <Button onClick={() => navigate("/products")}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  const imageUrl =
    product.imageUrl ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop";

  const handleOptionChange = (optionName: string, choice: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: choice }));
  };

  const handleAddToCart = () => {
    setError("");

    // Validate required options
    const requiredOptions = product.options.filter((opt) => opt.required);
    for (const opt of requiredOptions) {
      if (!selectedOptions[opt.name]) {
        setError(`Please select ${opt.name}`);
        return;
      }
    }

    // Build selected options array
    const optionsArray: SelectedOption[] = Object.entries(selectedOptions).map(
      ([name, choice]) => {
        const option = product.options.find((opt) => opt.name === name);
        const choiceObj = option?.choices.find((c) => c.label === choice);
        return {
          name,
          choice,
          price: choiceObj?.price || 0,
        };
      }
    );

    addItem(product, quantity, optionsArray);
    navigate("/cart");
  };

  const basePrice = parseFloat(product.price);
  const optionsPrice = Object.entries(selectedOptions).reduce(
    (sum, [name, choice]) => {
      const option = product.options.find((opt) => opt.name === name);
      const choiceObj = option?.choices.find((c) => c.label === choice);
      return sum + (choiceObj?.price || 0);
    },
    0
  );
  const totalPrice = (basePrice + optionsPrice) * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Back to Menu
        </Button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="h-96 md:h-full">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-orange-500 mb-4">
                {formatCurrency(product.price)}
              </p>

              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              {/* Options */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-6 mb-8">
                  {product.options.map((option) => (
                    <div key={option.name}>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {option.name}{" "}
                        {option.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <div className="space-y-2">
                        {option.choices.map((choice) => (
                          <label
                            key={choice.label}
                            className="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
                            style={{
                              borderColor:
                                selectedOptions[option.name] === choice.label
                                  ? "#f97316"
                                  : "#e5e7eb",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type={
                                  option.type === "single"
                                    ? "radio"
                                    : "checkbox"
                                }
                                name={option.name}
                                checked={
                                  selectedOptions[option.name] === choice.label
                                }
                                onChange={() =>
                                  handleOptionChange(option.name, choice.label)
                                }
                                className="text-orange-500 focus:ring-orange-500"
                              />
                              <span className="font-medium">
                                {choice.label}
                              </span>
                            </div>
                            {choice.price > 0 && (
                              <span className="text-gray-600">
                                +{formatCurrency(choice.price)}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 p-0"
                  >
                    <Minus size={20} />
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 p-0"
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart - {formatCurrency(totalPrice)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
