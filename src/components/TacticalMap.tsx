
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Crosshair, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TacticalMap = () => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSet, setTokenSet] = useState<boolean>(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const droneMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});

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

  const initializeMap = () => {
    if (!mapContainer.current || !tokenSet) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.0060, 40.7128], // NYC coordinates
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add waypoints
    waypoints.forEach((wp) => {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 border-2 border-yellow-400 rounded-full bg-yellow-400/20 cursor-pointer';
      el.innerHTML = '<div class="w-2 h-2 bg-yellow-400 rounded-full m-0.5"></div>';
      
      new mapboxgl.Marker(el)
        .setLngLat([wp.lng, wp.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="text-sm font-semibold">${wp.id}</div><div class="text-xs">${wp.type}</div>`))
        .addTo(map.current!);
    });

    // Add drones
    drones.forEach((drone) => {
      const el = document.createElement('div');
      el.className = 'w-3 h-3 rounded-full animate-pulse cursor-pointer relative';
      el.style.backgroundColor = getStatusColor(drone.status);
      el.innerHTML = '<div class="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-60"></div>';
      
      el.addEventListener('click', () => {
        setSelectedDrone(drone.id);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([drone.lng, drone.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="text-sm font-semibold text-green-400">${drone.id}</div>
          <div class="text-xs">Group ${drone.group}</div>
          <div class="text-xs">${drone.mission}</div>
          <div class="text-xs capitalize">${drone.status}</div>
        `))
        .addTo(map.current!);

      droneMarkers.current[drone.id] = marker;
    });
  };

  useEffect(() => {
    if (tokenSet && mapboxToken) {
      initializeMap();
    }

    return () => {
      map.current?.remove();
    };
  }, [tokenSet, mapboxToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setTokenSet(true);
    }
  };

  const centerOnDrone = () => {
    if (selectedDrone && map.current) {
      const drone = drones.find(d => d.id === selectedDrone);
      if (drone) {
        map.current.flyTo({
          center: [drone.lng, drone.lat],
          zoom: 14,
          duration: 1500
        });
      }
    }
  };

  const followDrone = () => {
    if (selectedDrone && map.current) {
      const drone = drones.find(d => d.id === selectedDrone);
      if (drone) {
        map.current.flyTo({
          center: [drone.lng, drone.lat],
          zoom: 16,
          duration: 2000
        });
      }
    }
  };

  if (!tokenSet) {
    return (
      <Card className="bg-slate-800 border-green-500/30 h-96">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Tactical Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center text-gray-400">
            <p className="mb-2">Enter your Mapbox public token to view the tactical map</p>
            <p className="text-xs">Get your token at: https://mapbox.com/</p>
          </div>
          <form onSubmit={handleTokenSubmit} className="flex space-x-2 w-full max-w-md">
            <Input
              type="text"
              placeholder="Enter Mapbox token..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="bg-slate-700 border-green-500/30 text-white"
            />
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Load Map
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

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
