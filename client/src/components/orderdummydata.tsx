import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../hooks/useOrders";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Button } from "../components/Button";
import { formatCurrency, formatDate } from "../utils/formatters";
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
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

type RecenterMapProps = {
  lat: number;
  lng: number;
};

function RecenterMap({ lat, lng }: RecenterMapProps) {
  const map = useMap();

  useEffect(() => {
    map.panTo([lat, lng], {
      animate: true,
    });
  }, [lat, lng, map]);

  return null;
}

export const OrderDetailPageDummy: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: remoteOrderData, isLoading } = useOrder(Number(orderId));

  const RESTAURANT_LOCATION = {
    lat: 42.231514,
    lng: 20.713701,
  };

  // State Management for simulated parameters
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>({
    orderId: orderId || "demo",
    lat: RESTAURANT_LOCATION.lat,
    lng: RESTAURANT_LOCATION.lng,
  });
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );
  const [eta, setEta] = useState<number | null>(null);

  // Track our progress along the street coordinate nodes array
  const [currentCoordIndex, setCurrentCoordIndex] = useState<number>(0);
  const totalDurationRef = useRef<number>(0);

  // 1. DUMMY DATA OVERRIDE INJECTOR
  const orderData = React.useMemo(() => {
    if (!remoteOrderData) return null;

    return {
      ...remoteOrderData,
      order: {
        ...remoteOrderData.order,
        deliveryLat: remoteOrderData.order.deliveryLat || "42.2212",
        deliveryLng: remoteOrderData.order.deliveryLng || "20.7290",
        status:
          remoteOrderData.order.status === "pending"
            ? "out_for_delivery"
            : remoteOrderData.order.status,
      },
    };
  }, [remoteOrderData]);

  // 2. ONE-TIME INITIAL ROUTE FETCH
  useEffect(() => {
    if (!orderData?.order) return;

    if (
      orderData.order.status === "out_for_delivery" &&
      routeCoordinates.length === 0
    ) {
      fetchRoute(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng);
    }
  }, [orderData, routeCoordinates.length]);

  // 3. ROUTE TRAVERSAL SIMULATION (STREET PATH FOLLOWER)
  useEffect(() => {
    if (
      routeCoordinates.length === 0 ||
      orderData?.order?.status !== "out_for_delivery"
    ) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentCoordIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // If driver has arrived at the destination node
        if (nextIndex >= routeCoordinates.length) {
          clearInterval(interval);
          setEta(0);
          return prevIndex;
        }

        // Set live map marker position to the current route point
        const [nextLat, nextLng] = routeCoordinates[nextIndex];
        setDriverLocation({
          orderId: orderId || "demo",
          lat: nextLat,
          lng: nextLng,
        });

        // Dynamically scale down the ETA proportional to route remaining
        const remainingPercentage =
          (routeCoordinates.length - nextIndex) / routeCoordinates.length;
        setEta(Math.ceil(totalDurationRef.current * remainingPercentage));

        return nextIndex;
      });
    }, 2000); // Step to the next street point every 2 seconds

    return () => clearInterval(interval);
  }, [routeCoordinates, orderData?.order?.status, orderId]);

  // Fetch true paths matching OSRM road topography
  const fetchRoute = async (startLat: number, startLng: number) => {
    if (!orderData?.order) return;

    const destLat = parseFloat(orderData.order.deliveryLat);
    const destLng = parseFloat(orderData.order.deliveryLng);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes?.[0]) return;

      const coords = data.routes[0].geometry.coordinates.map(
        (c: number[]) => [c[1], c[0]] as [number, number]
      );

      setRouteCoordinates(coords);
      totalDurationRef.current = Math.ceil(data.routes[0].duration);
      setEta(totalDurationRef.current);

      // Pin initial location tracking to the first index node of the map track
      if (coords.length > 0) {
        setDriverLocation({
          orderId: orderId || "demo",
          lat: coords[0][0],
          lng: coords[0][1],
        });
        setCurrentCoordIndex(0);
      }
    } catch (err) {
      console.error("OSRM Mock Route error", err);
    }
  };

  const formatTimeToken = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

        {/* Order Info Card */}
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
        </div>

        {/* Verification QR */}
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

        {/* Tracking Map Workspace */}
        {driverLocation && order.status === "out_for_delivery" && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-orange-500" />
              Live Tracking (Simulation Mode)
            </h2>
            <div className="mb-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Simulated Courier</span>
              </div>
              {eta !== null && (
                <div className="font-semibold text-orange-600 flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    ETA:{" "}
                    {eta <= 5 ? "Arriving Soon!" : `~${formatTimeToken(eta)}`}
                  </span>
                </div>
              )}
            </div>

            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-200">
              <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <RecenterMap
                  lat={driverLocation.lat}
                  lng={driverLocation.lng}
                />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Driver Marker */}
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
                      <p className="font-semibold">🚗 Driver (Moving)</p>
                      <p className="text-xs text-gray-600">
                        Following OSRM Coordinates
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Target Dropoff Marker */}
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
                    </div>
                  </Popup>
                </Marker>

                {/* Static Path Trace Underlay */}
                {routeCoordinates.length > 0 && (
                  <Polyline
                    positions={routeCoordinates.slice(currentCoordIndex)}
                    pathOptions={{
                      color: "#3B82F6",
                      weight: 5,
                      opacity: 0.6,
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Order Items Summary */}
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
