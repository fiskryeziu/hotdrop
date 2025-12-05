import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../components/CartItem';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatters';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
          <Link to="/products">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-700">
            Clear Cart
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item, index) => (
            <CartItem key={index} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-500">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          
          <Button onClick={() => navigate('/checkout')} size="lg" className="w-full gap-2">
            Proceed to Checkout
            <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
