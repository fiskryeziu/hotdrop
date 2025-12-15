import React, { useState, useEffect } from "react";
import { useOrders, useUpdateOrderStatus } from "../hooks/useOrders";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import type { Order, OrderStatus } from "../types";
import { MapPin, Navigation, Package, CheckCircle, QrCode } from "lucide-react";
import { QRScanner } from "../components/QRScanner";

export const DeliveryDashboardPage: React.FC = () => {
  const { data: orders, isLoading, refetch } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    setIsScanning(false);
    if (!activeOrderId) return; // Note: activeOrderId is the state, activeOrder depends on it

    if (decodedText === activeOrderId.toString()) {
      setShowVerificationModal(true);
    } else {
      alert("Invalid QR Code! Please scan the code from the customer's order page.");
    }
  };

  const hasRestoredState = React.useRef(false);

  const activeOrder = activeOrderId
    ? orders?.find((o) => o.id === activeOrderId) || null
    : null;

  const deliveryOrders = orders?.filter(
    (order) => order.status === "ready" || order.status === "out_for_delivery"
  );

  useEffect(() => {
    if (hasRestoredState.current) return;

    if (deliveryOrders && deliveryOrders.length > 0) {
      const existingActive = deliveryOrders.find(
        (order) => order.status === "out_for_delivery"
      );
      if (existingActive) {
        setActiveOrderId(existingActive.id);
      }
      hasRestoredState.current = true;
    }
  }, [deliveryOrders]);

  useEffect(() => {
    // Track location in real-time
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on("order-status-updated", () => {
      console.log("Order status updated, refreshing admin dashboard");
      refetch();
    });

    return () => {
      socket.off("order-status-updated");
    };
  }, [refetch]);

  // Send location update whenever location changes and we have an active order
  useEffect(() => {
    if (!activeOrder || !location) return;

    const socket = getSocket();
    socket.emit("driverLocation", {
      orderId: activeOrder.id.toString(),
      lat: location.lat,
      lng: location.lng,
    });
  }, [activeOrder, location]);

  const endDelivery = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
      setActiveOrderId(null);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

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
        {activeOrder && (
          <Card className="mb-6 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="text-orange-500" />
                Active Delivery - Order #{activeOrder.id}
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
                    {activeOrder.deliveryAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(activeOrder.total)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsScanning(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <QrCode size={18} className="mr-2" />
                    Scan to Verify
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => endDelivery(activeOrder.id, "delivered")}
                    className="flex-1"
                  >
                    Manual Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isScanning && (
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setIsScanning(false)}
          />
        )}

        <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle size={24} />
                Verification Successful!
              </DialogTitle>
              <DialogDescription>
                Order #{activeOrderId} has been verified via QR scan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowVerificationModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (activeOrderId) endDelivery(activeOrderId, "delivered");
                  setShowVerificationModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Complete Delivery
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    className={`${activeOrder?.id === order.id ? "border-orange-500 bg-orange-50" : ""}`}
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

                      {order.phoneNumber && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Phone Number
                          </p>
                          <a
                            href={`tel:${order.phoneNumber}`}
                            className="font-medium flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {order.phoneNumber}
                          </a>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {activeOrder?.id === order.id ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle size={16} className="mr-2" />
                          Currently Delivering
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: "out_for_delivery",
                            });
                            setActiveOrderId(order.id);
                          }}
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
