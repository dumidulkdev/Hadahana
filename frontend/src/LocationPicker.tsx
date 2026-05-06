import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

// Fix Leaflet's default icon path issues with bundlers like Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

// Component that syncs map view when position changes
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 14, { duration: 1.5 });
  }, [position, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onChange(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, onChange]);
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 3 || query === selectedName) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search`, {
            params: {
              format: 'json',
              q: query,
              limit: 5,
              addressdetails: 1,
            },
            headers: { 'Accept-Language': 'en' },
          }
        );
        setResults(res.data);
        setShowDropdown(res.data.length > 0);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query, selectedName]);

  const handleSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange(lat, lng);
    setSelectedName(result.display_name);
    setQuery(result.display_name);
    setShowDropdown(false);
  };

  // Bold the matching query text in the suggestion
  const highlightMatch = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Search Input with Custom Dropdown */}
      <Box ref={wrapperRef} sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          label="Search Birth Location"
          placeholder="e.g. Ratnapura Hospital, Sri Lanka"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedName('');
          }}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          slotProps={{
            input: {
              endAdornment: loading ? <CircularProgress size={20} /> : null,
            },
          }}
        />

        {/* Dropdown Suggestions */}
        {showDropdown && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 0.5,
              borderRadius: 2,
              overflow: 'hidden',
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {results.map((result) => (
              <Box
                key={result.place_id}
                onClick={() => handleSelect(result)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&:last-child': { borderBottom: 'none' },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <LocationOnOutlinedIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 22, flexShrink: 0 }} />
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'text.primary',
                  }}
                >
                  {highlightMatch(result.display_name)}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* Interactive Map */}
      <Box sx={{ height: 280, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[latitude, longitude]}
            draggable={true}
            eventHandlers={{
              dragend(e) {
                const marker = e.target;
                const pos = marker.getLatLng();
                onChange(pos.lat, pos.lng);
              },
            }}
          />
          <MapUpdater position={[latitude, longitude]} />
          <MapClickHandler onChange={onChange} />
        </MapContainer>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        Search for a location, click on the map, or drag the marker to set your exact birth place.
        <br />
        Selected: <strong>{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong>
      </Typography>
    </Box>
  );
}
