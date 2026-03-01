import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in webpack/vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapSelectorProps {
  onSelect: (lat: number, lon: number, zoom: number) => void;
  disabled?: boolean;
  height?: string;
}

function MapClickHandler({
  onSelect,
  disabled,
}: {
  onSelect: (lat: number, lon: number, zoom: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      const { lat, lng } = e.latlng;
      const zoom = e.target.getZoom();
      onSelect(lat, lng, zoom);
    },
  });
  return null;
}

export function MapSelector({ onSelect, disabled = false, height = '400px' }: MapSelectorProps) {
  return (
    <div style={{ height, minHeight: 250, width: '100%', overflow: 'hidden' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={onSelect} disabled={disabled} />
      </MapContainer>
    </div>
  );
}
