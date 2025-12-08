import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package } from "lucide-react";
import { useSession, signOut } from "../lib/auth-client";
import { useCart } from "../contexts/CartContext";
import { Button } from "./Button";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const { totalItems } = useCart();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🔥</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              HotDrop
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Menu
            </Link>
            {session && (
              <>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-1"
                >
                  <Package size={18} />
                  Orders
                </Link>
                {(session.user as any)?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {(session.user as any)?.role === "delivery" && (
                  <Link
                    to="/delivery"
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    Deliveries
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User size={20} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
