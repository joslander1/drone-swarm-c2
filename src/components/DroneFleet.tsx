
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Battery, Signal, Settings } from 'lucide-react';

interface DroneFleetProps {
  expanded?: boolean;
}

const DroneFleet: React.FC<DroneFleetProps> = ({ expanded = false }) => {
  const drones = [
    {
      id: 'UAV-001',
      type: 'Group 1 Fixed-Wing',
      status: 'Active',
      mission: 'Patrol Alpha',
      battery: 87,
      signal: 95,
      altitude: 1200,
      speed: 45,
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 'UAV-002',
      type: 'Group 1 Rotary-Wing',
      status: 'Active',
      mission: 'Surveillance Beta',
      battery: 73,
      signal: 88,
      altitude: 800,
      speed: 32,
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 'UAV-003',
      type: 'Group 2 Fixed-Wing',
      status: 'Returning',
      mission: 'Reconnaissance',
      battery: 34,
      signal: 76,
      altitude: 1500,
      speed: 62,
      coordinates: { lat: 40.6892, lng: -74.0445 }
    },
    {
      id: 'UAV-004',
      type: 'Group 2 Hybrid',
      status: 'Standby',
      mission: 'Standby',
      battery: 100,
      signal: 100,
      altitude: 0,
      speed: 0,
      coordinates: { lat: 40.7282, lng: -73.7949 }
    },
    {
      id: 'UAV-005',
      type: 'Group 1 Rotary-Wing',
      status: 'Active',
      mission: 'Escort Formation',
      battery: 91,
      signal: 92,
      altitude: 900,
      speed: 38,
      coordinates: { lat: 40.7505, lng: -73.9934 }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Returning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Standby': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-400';
    if (level > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-400';
    if (strength > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!expanded) {
    return (
      <Card className="bg-slate-800 border-green-500/30 h-96 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Plane className="w-5 h-5" />
            <span>Fleet Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 overflow-y-auto flex-1 min-h-0">
          {drones.map((drone) => (
            <div key={drone.id} className="bg-slate-900 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-sm text-white">{drone.id}</div>
                <Badge className={getStatusColor(drone.status)}>
                  {drone.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Battery className={`w-3 h-3 ${getBatteryColor(drone.battery)}`} />
                  <span>{drone.battery}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Signal className={`w-3 h-3 ${getSignalColor(drone.signal)}`} />
                  <span>{drone.signal}%</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drones.map((drone) => (
          <Card key={drone.id} className="bg-slate-800 border-green-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400 font-mono text-lg">{drone.id}</CardTitle>
                <Badge className={getStatusColor(drone.status)}>
                  {drone.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">{drone.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Mission</div>
                  <div className="text-sm text-white">{drone.mission}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Altitude</div>
                  <div className="text-sm text-white">{drone.altitude} ft</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Speed</div>
                  <div className="text-sm text-white">{drone.speed} mph</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Position</div>
                  <div className="text-xs text-white font-mono">
                    {drone.coordinates.lat.toFixed(4)}, {drone.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Battery className={`w-4 h-4 ${getBatteryColor(drone.battery)}`} />
                  <span className={`text-sm ${getBatteryColor(drone.battery)}`}>{drone.battery}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Signal className={`w-4 h-4 ${getSignalColor(drone.signal)}`} />
                  <span className={`text-sm ${getSignalColor(drone.signal)}`}>{drone.signal}%</span>
                </div>
                <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DroneFleet;
