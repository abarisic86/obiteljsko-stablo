import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { FamilyLocation } from "../types/family";
import { fetchLocations, saveLocation } from "../utils/locationStorage";

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Component to auto-fit map bounds to show all markers
function MapBounds({ locations }: { locations: FamilyLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.lat, loc.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

export default function LocationMapModal({ isOpen, onClose }: LocationMapModalProps) {
  const [locations, setLocations] = useState<FamilyLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const loadLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLocations = await fetchLocations();
      setLocations(fetchedLocations);
    } catch (err) {
      setError("Greška pri učitavanju lokacija");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      setError("Vaš preglednik ne podržava geolokaciju");
      return;
    }

    setSharing(true);
    setError(null);

    // Request location permission and get current position
    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Allow cached position up to 1 minute old
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Prompt for label
        const label = prompt("Unesite svoje ime ili oznaku:");
        if (!label || label.trim() === "") {
          setSharing(false);
          return;
        }

        // Create location entry
        const location: FamilyLocation = {
          id: label.trim().toLowerCase().replace(/\s+/g, "-"),
          label: label.trim(),
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
        };

        try {
          await saveLocation(location);
          // Reload locations to show the new one
          await loadLocations();
        } catch (err) {
          setError("Greška pri spremanju lokacije");
          console.error(err);
        } finally {
          setSharing(false);
        }
      },
      (err: GeolocationPositionError) => {
        let errorMessage = "Nije moguće dobiti lokaciju.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Lokacija odbijena. Dopustite pristup lokaciji u postavkama preglednika.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Lokacija nije dostupna. Provjerite je li GPS uključen.";
            break;
          case err.TIMEOUT:
            errorMessage = "Isteklo vrijeme za dohvat lokacije. Pokušajte ponovo.";
            break;
        }
        setError(errorMessage);
        console.error("Geolocation error:", err.code, err.message);
        setSharing(false);
      },
      geolocationOptions
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "upravo sada";
    if (diffMins < 60) return `prije ${diffMins} min`;
    if (diffHours < 24) return `prije ${diffHours} ${diffHours === 1 ? "sata" : "sati"}`;
    if (diffDays === 1) return "jučer";
    if (diffDays < 7) return `prije ${diffDays} ${diffDays === 1 ? "dana" : "dana"}`;
    return date.toLocaleDateString("hr-HR");
  };

  if (!isOpen) return null;

  // Default center (Croatia) if no locations
  const defaultCenter: [number, number] = [45.1, 15.2];
  const defaultZoom = 7;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full h-full md:w-11/12 md:h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Lokacije obitelji</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Zatvori"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading && locations.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Učitavanje lokacija...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.length > 0 && <MapBounds locations={locations} />}
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.lat, location.lng]}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-lg">{location.label}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatTimestamp(location.timestamp)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Footer with Share Button */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleShareLocation}
            disabled={sharing}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {sharing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Dohvaćanje lokacije...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Podijeli moju lokaciju</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Kliknite gumb da podijelite svoju trenutnu lokaciju s obitelji
          </p>
        </div>
      </div>
    </div>
  );
}

