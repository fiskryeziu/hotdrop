import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package, Menu } from "lucide-react";
import { useSession, signOut } from "../lib/auth-client";
import { useCart } from "../contexts/CartContext";
import { Button } from "./Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Show Menu only for non-delivery and non-admin users */}
            {(!session ||
              ((session.user as any)?.role !== "delivery" &&
                (session.user as any)?.role !== "admin")) && (
              <Link
                to="/products"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                Menu
              </Link>
            )}
            {session && (
              <>
                {/* Show Orders only for customer users (not delivery or admin) */}
                {session.user.role !== "delivery" &&
                  session.user.role !== "admin" && (
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-1"
                    >
                      <Package size={18} />
                      Orders
                    </Link>
                  )}
                {session.user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {session.user.role === "delivery" && (
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
            {session?.user.role !== "delivery" &&
              session?.user.role !== "admin" && (
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
              )}

            {/* User Menu - Desktop */}
            {session ? (
              <div className="hidden md:flex items-center space-x-2">
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
              <Link to="/login" className="hidden md:block">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu - Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">🔥</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        HotDrop
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Show Menu only for non-delivery and non-admin users */}
                  {(!session ||
                    ((session.user as any)?.role !== "delivery" &&
                      (session.user as any)?.role !== "admin")) && (
                    <Link
                      to="/products"
                      className="text-gray-700 hover:text-orange-500 font-medium transition-colors px-2 py-2 rounded-md hover:bg-gray-100"
                      onClick={closeMobileMenu}
                    >
                      Menu
                    </Link>
                  )}
                  {session && (
                    <>
                      {/* Show Orders only for customer users (not delivery or admin) */}
                      {session.user.role !== "delivery" &&
                        session.user.role !== "admin" && (
                          <Link
                            to="/orders"
                            className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100"
                            onClick={closeMobileMenu}
                          >
                            <Package size={18} />
                            Orders
                          </Link>
                        )}
                      {session.user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="text-gray-700 hover:text-orange-500 font-medium transition-colors px-2 py-2 rounded-md hover:bg-gray-100"
                          onClick={closeMobileMenu}
                        >
                          Admin
                        </Link>
                      )}
                      {session.user.role === "delivery" && (
                        <Link
                          to="/delivery"
                          className="text-gray-700 hover:text-orange-500 font-medium transition-colors px-2 py-2 rounded-md hover:bg-gray-100"
                          onClick={closeMobileMenu}
                        >
                          Deliveries
                        </Link>
                      )}
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        to="/profile"
                        className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100"
                        onClick={closeMobileMenu}
                      >
                        <User size={18} />
                        Profile
                      </Link>
                      <button
                        className="text-gray-700 hover:text-orange-500 font-medium transition-colors flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 text-left w-full"
                        onClick={() => {
                          closeMobileMenu();
                          handleSignOut();
                        }}
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </>
                  )}
                  {!session && (
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-orange-500 font-medium transition-colors px-2 py-2 rounded-md hover:bg-gray-100"
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
