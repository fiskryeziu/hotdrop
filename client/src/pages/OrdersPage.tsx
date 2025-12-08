import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { formatCurrency, formatRelativeTime } from "../utils/formatters";
import { Package, ChevronRight } from "lucide-react";
import { getSocket } from "../lib/socket";

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, refetch } = useOrders();

  // Listen for order status updates
  useEffect(() => {
    const socket = getSocket();

    socket.on("order-status-updated", () => {
      console.log("Order status updated, refreshing list");
      refetch();
    });

    return () => {
      socket.off("order-status-updated");
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="text-orange-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={24} />
                </div>

                <div className="flex items-center justify-between">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                {order.deliveryAddress && (
                  <p className="mt-3 text-sm text-gray-600">
                    📍 {order.deliveryAddress}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start ordering to see your order history!
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Browse Menu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
