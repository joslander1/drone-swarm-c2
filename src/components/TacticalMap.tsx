
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type DronePos = {
  id: string;
  lat: number;
  lng: number;
  status: string;
  group: number;
  mission: string;
};

const TacticalMap = () => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const droneMarkers = useRef<{ [key: string]: L.Marker }>({});
  const dronesRef = useRef<DronePos[]>([
    { id: 'UAV-001', lat: 40.7128, lng: -74.0060, status: 'active', group: 1, mission: 'patrol' },
    { id: 'UAV-002', lat: 40.7580, lng: -73.9855, status: 'active', group: 1, mission: 'surveillance' },
    { id: 'UAV-003', lat: 40.6892, lng: -74.0445, status: 'returning', group: 2, mission: 'reconnaissance' },
    { id: 'UAV-004', lat: 40.7831, lng: -73.9712, status: 'standby', group: 2, mission: 'standby' },
    { id: 'UAV-005', lat: 40.7300, lng: -73.9950, status: 'active', group: 1, mission: 'escort' },
  ]);
  const selectedRef = useRef<string | null>(null);
  const followingRef = useRef(false);

  useEffect(() => { selectedRef.current = selectedDrone; }, [selectedDrone]);
  useEffect(() => { followingRef.current = following; }, [following]);

  const waypoints = [
    { id: 'WP-001', lat: 40.7589, lng: -73.9851, type: 'checkpoint' },
    { id: 'WP-002', lat: 40.7505, lng: -73.9934, type: 'target' },
    { id: 'WP-003', lat: 40.7282, lng: -74.0776, type: 'base' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'returning': return '#f59e0b';
      case 'standby': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const createDroneIcon = (status: string) => {
    return L.divIcon({
      html: `<div style="background-color: ${getStatusColor(status)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
      className: 'drone-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  const createWaypointIcon = () => {
    return L.divIcon({
      html: `<div style="background-color: #fbbf24; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #f59e0b; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
      className: 'waypoint-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  const initializeMap = () => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      center: [40.7128, -74.0060],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    waypoints.forEach((wp) => {
      const marker = L.marker([wp.lat, wp.lng], {
        icon: createWaypointIcon()
      }).addTo(map.current!);

      marker.bindPopup(`
        <div style="color: #000; font-size: 14px;">
          <div style="font-weight: bold; color: #f59e0b;">${wp.id}</div>
          <div style="font-size: 12px;">${wp.type}</div>
        </div>
      `);
    });

    dronesRef.current.forEach((drone) => {
      const marker = L.marker([drone.lat, drone.lng], {
        icon: createDroneIcon(drone.status)
      }).addTo(map.current!);

      marker.bindPopup(`
        <div style="color: #000; font-size: 14px;">
          <div style="font-weight: bold; color: #10b981;">${drone.id}</div>
          <div style="font-size: 12px;">Group ${drone.group}</div>
          <div style="font-size: 12px;">${drone.mission}</div>
          <div style="font-size: 12px; text-transform: capitalize;">${drone.status}</div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedDrone(drone.id);
      });

      droneMarkers.current[drone.id] = marker;
    });
  };

  useEffect(() => {
    initializeMap();

    // Simulate drone movement so "Follow" is visibly meaningful
    const interval = setInterval(() => {
      dronesRef.current = dronesRef.current.map((d) => {
        if (d.status === 'standby') return d;
        const dLat = (Math.random() - 0.5) * 0.002;
        const dLng = (Math.random() - 0.5) * 0.002;
        const next = { ...d, lat: d.lat + dLat, lng: d.lng + dLng };
        const marker = droneMarkers.current[d.id];
        if (marker) marker.setLatLng([next.lat, next.lng]);
        return next;
      });

      if (followingRef.current && selectedRef.current && map.current) {
        const drone = dronesRef.current.find((d) => d.id === selectedRef.current);
        if (drone) {
          map.current.panTo([drone.lat, drone.lng], { animate: true });
        }
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const centerOnDrone = () => {
    if (selectedDrone && map.current) {
      const drone = dronesRef.current.find(d => d.id === selectedDrone);
      if (drone) {
        map.current.setView([drone.lat, drone.lng], 14);
      }
    }
  };

  const toggleFollow = () => {
    if (!selectedDrone || !map.current) return;
    if (following) {
      setFollowing(false);
      return;
    }
    const drone = dronesRef.current.find((d) => d.id === selectedDrone);
    if (drone) {
      map.current.setView([drone.lat, drone.lng], 16, { animate: true });
    }
    setFollowing(true);
  };

  // Stop following if selection changes to null
  useEffect(() => {
    if (!selectedDrone && following) setFollowing(false);
  }, [selectedDrone, following]);

  return (
    <Card className="bg-slate-800 border-green-500/30 h-96">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Tactical Map - New York City</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-slate-900 border border-green-500/20 rounded-lg h-64 overflow-hidden">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />

          {selectedDrone && (
            <div className="absolute top-2 left-2 bg-slate-700/90 border border-green-500/50 rounded px-3 py-2 text-sm text-green-400">
              Selected: {selectedDrone}
              {following && <span className="ml-2 text-yellow-400">• Following</span>}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-400">Returning</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">Standby</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={centerOnDrone}
              disabled={!selectedDrone}
            >
              <Crosshair className="w-4 h-4 mr-1" />
              Center
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-pressed={following}
              className={
                following
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
                  : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
              }
              onClick={toggleFollow}
              disabled={!selectedDrone}
            >
              <Navigation className="w-4 h-4 mr-1" />
              {following ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TacticalMap;
