
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TacticalMap = () => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const droneMarkers = useRef<{ [key: string]: L.Marker }>({});

  const drones = [
    { id: 'UAV-001', lat: 40.7128, lng: -74.0060, status: 'active', group: 1, mission: 'patrol' },
    { id: 'UAV-002', lat: 40.7580, lng: -73.9855, status: 'active', group: 1, mission: 'surveillance' },
    { id: 'UAV-003', lat: 40.6892, lng: -74.0445, status: 'returning', group: 2, mission: 'reconnaissance' },
    { id: 'UAV-004', lat: 40.7831, lng: -73.9712, status: 'standby', group: 2, mission: 'standby' },
    { id: 'UAV-005', lat: 40.7300, lng: -73.9950, status: 'active', group: 1, mission: 'escort' },
  ];

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

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current, {
      center: [40.7128, -74.0060], // NYC coordinates
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Add waypoints
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

    // Add drones
    drones.forEach((drone) => {
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

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const centerOnDrone = () => {
    if (selectedDrone && map.current) {
      const drone = drones.find(d => d.id === selectedDrone);
      if (drone) {
        map.current.setView([drone.lat, drone.lng], 14);
      }
    }
  };

  const followDrone = () => {
    if (selectedDrone && map.current) {
      const drone = drones.find(d => d.id === selectedDrone);
      if (drone) {
        map.current.setView([drone.lat, drone.lng], 16);
      }
    }
  };

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
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={followDrone}
              disabled={!selectedDrone}
            >
              <Navigation className="w-4 h-4 mr-1" />
              Follow
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TacticalMap;
