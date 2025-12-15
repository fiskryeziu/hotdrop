import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../hooks/useOrders";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Button } from "../components/Button";
import { formatCurrency, formatDate } from "../utils/formatters";
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react";
import { getSocket, joinOrderRoom } from "../lib/socket";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { DriverLocation } from "../types";
import { QRCodeSVG } from "qrcode.react";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: orderData, isLoading, refetch } = useOrder(Number(orderId));
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null
  );
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );
  const [eta, setEta] = useState<number | null>(null);

  const RESTAURANT_LOCATION = { lat: 42.6629, lng: 21.1655 };

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();
    joinOrderRoom(Number(orderId));

    socket.on("driverLocation", (location: DriverLocation) => {
      if (location.orderId === orderId) {
        setDriverLocation(location);
      }
    });

    socket.on("order-status-updated", (newStatus: string) => {
      console.log("Order status updated to:", newStatus);
      refetch();
    });

    return () => {
      socket.off("driverLocation");
      socket.off("order-status-updated");
    };
  }, [orderId, refetch]);

  useEffect(() => {
    if (orderData?.order && !driverLocation && eta === null) {
      if (orderData.order.status === "out_for_delivery") {
        fetchRoute(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng);
      }
    }
  }, [orderData, driverLocation]);

  useEffect(() => {
    if (driverLocation) {
      fetchRoute(driverLocation.lat, driverLocation.lng);
    }
  }, [driverLocation, orderData]);

  useEffect(() => {
    if (
      eta === null ||
      eta <= 0 ||
      orderData?.order?.status !== "out_for_delivery"
    )
      return;

    const interval = setInterval(() => {
      setEta((prevEta) => {
        if (prevEta === null || prevEta <= 0) return 0;
        return prevEta - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [eta, orderData?.order?.status]);

  // Format seconds to MM:SS
  const formatTimeToken = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fetch route from OSRM (Open Source Routing Machine)
  const fetchRoute = async (startLat: number, startLng: number) => {
    if (!orderData?.order) {
      console.log("No order data available yet");
      return;
    }

    // Use actual delivery coordinates if available, otherwise use offset for demo
    const destLat = orderData.order.deliveryLat
      ? parseFloat(orderData.order.deliveryLat)
      : startLat + 0.01;
    const destLng = orderData.order.deliveryLng
      ? parseFloat(orderData.order.deliveryLng)
      : startLng + 0.01;

    console.log("Fetching route from:", { startLat, startLng }, "to:", {
      destLat,
      destLng,
    });

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        // Convert GeoJSON coordinates to Leaflet format [lat, lng]
        const coords = data.routes[0].geometry.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]] as [number, number]
        );
        setRouteCoordinates(coords);

        // precise
        if (data.routes[0].duration) {
          // Store raw seconds directly
          setEta(Math.ceil(data.routes[0].duration));
        }
      } else {
        // Fallback to straight line
        setRouteCoordinates([
          [startLat, startLng],
          [destLat, destLng],
        ]);
        setEta(null);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback to straight line if routing fails
      setRouteCoordinates([
        [startLat, startLng],
        [destLat, destLng],
      ]);
      setEta(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const { order, items } = orderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </Button>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Order #{order.id}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span>
                  {formatDate(new Date(order.createdAt).toISOString())}
                </span>
              </div>
            </div>
            <OrderStatusBadge status={order.status as any} />
          </div>

          {order.deliveryAddress && (
            <div className="flex items-start gap-2 text-gray-700 mb-4">
              <MapPin size={20} className="text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-gray-600">{order.deliveryAddress}</p>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Order Notes
              </p>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Delivery Verification QR Code */}
        {(order.status === "out_for_delivery" || order.status === "ready") && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Delivery Verification
            </h2>
            <p className="text-gray-500 mb-4 text-center text-sm">
              Show this QR code to the driver to receive your order
            </p>
            <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
              <QRCodeSVG
                value={order.id.toString()}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        )}

        {/* Driver Location Map */}
        {driverLocation && order.status === "out_for_delivery" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-orange-500" />
              Live Tracking
            </h2>
            <div className="mb-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Driver Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Delivery Destination</span>
              </div>
              {eta !== null && (
                <div className="font-semibold text-orange-600 flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    ETA:{" "}
                    {eta <= 0 ? "Arriving Soon!" : `~${formatTimeToken(eta)}`}
                  </span>
                </div>
              )}
            </div>
            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-200">
              <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Driver Marker (Blue) */}
                <Marker
                  position={[driverLocation.lat, driverLocation.lng]}
                  icon={L.icon({
                    iconUrl:
                      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                    shadowUrl: iconShadow,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">🚗 Driver</p>
                      <p className="text-xs text-gray-600">
                        On the way to you!
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Marker (Red) - Using actual delivery coordinates */}
                {order.deliveryLat && order.deliveryLng ? (
                  <Marker
                    position={[
                      parseFloat(order.deliveryLat),
                      parseFloat(order.deliveryLng),
                    ]}
                    icon={L.icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                      shadowUrl: iconShadow,
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                    })}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">📍 Destination</p>
                        <p className="text-xs text-gray-600">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ) : (
                  /* Fallback for orders without coordinates */
                  <Marker
                    position={[
                      driverLocation.lat + 0.01,
                      driverLocation.lng + 0.01,
                    ]}
                    icon={L.icon({
                      iconUrl:
                        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                      shadowUrl: iconShadow,
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                    })}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">
                          📍 Destination (Approx.)
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Line (Blue) - Following streets */}
                {routeCoordinates.length > 0 && (
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: "#3B82F6",
                      weight: 5,
                      opacity: 0.8,
                    }}
                  />
                )}
              </MapContainer>
            </div>
            <p className="mt-3 text-sm text-gray-600 text-center">
              🚗 Your driver is on the way! Track their location in real-time.
            </p>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="text-orange-500" />
            Order Items
          </h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start pb-4 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.quantity}x Product #{item.productId}
                  </p>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.selectedOptions.map((opt, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {opt.name}: {opt.choice}
                          {opt.price > 0 && ` (+${formatCurrency(opt.price)})`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-500">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
