import React, { useState, useEffect } from "react";
import { useOrders } from "../hooks/useOrders";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getSocket } from "../lib/socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/Button";
import type { Order } from "../types";
import { MapPin, Navigation, Package, CheckCircle } from "lucide-react";

export const DeliveryDashboardPage: React.FC = () => {
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Get delivery orders (ready or out for delivery)
  const deliveryOrders = orders?.filter(
    (order) => order.status === "ready" || order.status === "out_for_delivery"
  );

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const sendLocationUpdate = () => {
    if (!selectedOrder || !location) return;

    const socket = getSocket();
    socket.emit("driverLocation", {
      orderId: selectedOrder.id.toString(),
      lat: location.lat,
      lng: location.lng,
    });
  };

  // Auto-send location every 10 seconds when order is selected
  useEffect(() => {
    if (!selectedOrder || !location) return;

    sendLocationUpdate();
    const interval = setInterval(sendLocationUpdate, 10000);

    return () => clearInterval(interval);
  }, [selectedOrder, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delivery Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your deliveries and track routes
          </p>
        </div>

        {/* Current Location */}
        {location && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Navigation className="text-green-600" size={24} />
                Location Tracking Active
              </CardTitle>
              <CardDescription className="text-green-700">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Active Delivery */}
        {selectedOrder && (
          <Card className="mb-6 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="text-orange-500" />
                Active Delivery - Order #{selectedOrder.id}
              </CardTitle>
              <CardDescription>
                Location updates are being sent every 10 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin size={16} className="text-orange-500" />
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full"
                >
                  End Delivery
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Available Deliveries</CardTitle>
            <CardDescription>
              Orders ready for pickup and delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveryOrders && deliveryOrders.length > 0 ? (
              <div className="space-y-4">
                {deliveryOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`${selectedOrder?.id === order.id ? "border-orange-500 bg-orange-50" : ""}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Order #{order.id}
                          </h3>
                          <Badge
                            className={
                              order.status === "ready"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-indigo-100 text-indigo-800"
                            }
                          >
                            {order.status === "ready"
                              ? "Ready for Pickup"
                              : "Out for Delivery"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-orange-500">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                          Delivery Address
                        </p>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin size={16} className="text-orange-500" />
                          {order.deliveryAddress || "No address provided"}
                        </p>
                      </div>

                      {order.notes && (
                        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {selectedOrder?.id === order.id ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle size={16} className="mr-2" />
                          Currently Delivering
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSelectedOrder(order)}
                          className="w-full"
                          disabled={!location}
                        >
                          Start Delivery
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No deliveries available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
