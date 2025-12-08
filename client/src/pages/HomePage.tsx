import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Clock, MapPin } from "lucide-react";
import { Button } from "../components/Button";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mb-6 animate-bounce">
            <span className="text-5xl">🔥</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Delicious Food,
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Delivered Hot
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Order from your favorite restaurants and get your food delivered
            fresh and hot to your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="gap-2">
                Browse Menu
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="text-orange-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Fast Delivery
            </h3>
            <p className="text-gray-600">
              Get your food delivered in 30 minutes or less with our express
              delivery service.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="text-orange-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Real-time Tracking
            </h3>
            <p className="text-gray-600">
              Track your order in real-time and know exactly when your food will
              arrive.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="text-orange-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Wide Coverage
            </h3>
            <p className="text-gray-600">
              We deliver to all areas in the city. Enter your address to check
              availability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to order?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our menu and get your favorite food delivered now!
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary" className="gap-2">
              Order Now
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
