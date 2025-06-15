
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair, Navigation } from 'lucide-react';

const TacticalMap = () => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);

  const drones = [
    { id: 'UAV-001', x: 45, y: 30, status: 'active', group: 1, mission: 'patrol' },
    { id: 'UAV-002', x: 65, y: 40, status: 'active', group: 1, mission: 'surveillance' },
    { id: 'UAV-003', x: 25, y: 60, status: 'returning', group: 2, mission: 'reconnaissance' },
    { id: 'UAV-004', x: 80, y: 25, status: 'standby', group: 2, mission: 'standby' },
    { id: 'UAV-005', x: 55, y: 70, status: 'active', group: 1, mission: 'escort' },
  ];

  const waypoints = [
    { id: 'WP-001', x: 30, y: 20, type: 'checkpoint' },
    { id: 'WP-002', x: 70, y: 50, type: 'target' },
    { id: 'WP-003', x: 40, y: 80, type: 'base' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'returning': return 'bg-yellow-500';
      case 'standby': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-slate-800 border-green-500/30 h-96">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Tactical Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-slate-900 border border-green-500/20 rounded-lg h-64 overflow-hidden">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#10b981" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Waypoints */}
          {waypoints.map((wp) => (
            <div
              key={wp.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
            >
              <div className="w-4 h-4 border-2 border-yellow-400 rounded-full bg-yellow-400/20">
                <div className="w-2 h-2 bg-yellow-400 rounded-full m-0.5"></div>
              </div>
            </div>
          ))}

          {/* Drones */}
          {drones.map((drone) => (
            <div
              key={drone.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${drone.x}%`, top: `${drone.y}%` }}
              onClick={() => setSelectedDrone(drone.id)}
            >
              <div className={`w-3 h-3 ${getStatusColor(drone.status)} rounded-full animate-pulse`}>
                {selectedDrone === drone.id && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-700 border border-green-500/50 rounded px-2 py-1 text-xs text-green-400 whitespace-nowrap">
                    {drone.id} - Group {drone.group}
                  </div>
                )}
              </div>
              {/* Direction indicator */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-60"></div>
            </div>
          ))}

          {/* Range circles for selected drone */}
          {selectedDrone && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                left: `${drones.find(d => d.id === selectedDrone)?.x}%`, 
                top: `${drones.find(d => d.id === selectedDrone)?.y}%` 
              }}
            >
              <div className="w-20 h-20 border border-green-500/30 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-green-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
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
            <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
              <Crosshair className="w-4 h-4 mr-1" />
              Center
            </Button>
            <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
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
