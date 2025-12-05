import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCreateOrder } from '../hooks/useOrders';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { formatCurrency } from '../utils/formatters';
import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function LocationMarker({ position, setPosition }: { 
  position: [number, number] | null; 
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.6629, 21.1655]); // Pristina default

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setSelectedLocation(coords);
          setMapCenter(coords);
          setShowMap(true);
          // Reverse geocode to get address
          reverseGeocode(coords[0], coords[1]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter address manually or select on map.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  // Reverse geocode coordinates to address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setDeliveryAddress(data.display_name);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleLocationSelect = () => {
    if (selectedLocation) {
      reverseGeocode(selectedLocation[0], selectedLocation[1]);
      setShowMap(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          subtotal: item.subtotal,
        })),
        total: totalPrice,
        deliveryAddress,
        deliveryLat: selectedLocation ? selectedLocation[0].toString() : null,
        deliveryLng: selectedLocation ? selectedLocation[1].toString() : null,
        notes: notes || undefined,
      };

      const result = await createOrderMutation.mutateAsync(orderData);
      clearCart();
      navigate(`/orders/${result.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-gray-700">
                <span>
                  {item.quantity}x {item.product.name}
                  {item.selectedOptions.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {' '}({item.selectedOptions.map(opt => opt.choice).join(', ')})
                    </span>
                  )}
                </span>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-orange-500">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={24} className="text-orange-500" />
            Delivery Details
          </h2>

          <div className="space-y-4">
            <Input
              label="Delivery Address"
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
              required
            />

            {/* Location Picker Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="flex-1 gap-2"
              >
                <Navigation size={18} />
                Use Current Location
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMap(true)}
                className="flex-1 gap-2"
              >
                <MapPin size={18} />
                Select on Map
              </Button>
            </div>

            {/* Map Modal */}
            {showMap && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full p-6">
                  <h3 className="text-xl font-semibold mb-4">Select Delivery Location</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click on the map to select your delivery location
                  </p>
                  <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-200 mb-4">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationMarker position={selectedLocation} setPosition={setSelectedLocation} />
                    </MapContainer>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMap(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleLocationSelect}
                      className="flex-1"
                      disabled={!selectedLocation}
                    >
                      Confirm Location
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
