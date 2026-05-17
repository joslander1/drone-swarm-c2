
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Home, Pause, StopCircle, Radio } from 'lucide-react';
import ReadOnlyBanner from './ReadOnlyBanner';

const EmergencyPanel = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  const activeAlerts = [
    {
      id: 'ALT-001',
      type: 'warning',
      message: 'UAV-003 low battery - 34% remaining',
      time: '14:23:15',
      drone: 'UAV-003'
    },
    {
      id: 'ALT-002',
      type: 'info',
      message: 'Weather advisory: Wind speed increasing to 25 mph',
      time: '14:20:03',
      drone: 'ALL'
    }
  ];

  const emergencyProtocols = [
    {
      id: 'RTB',
      name: 'Return to Base',
      description: 'All drones return to designated landing zones',
      icon: Home,
      color: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      id: 'HOLD',
      name: 'Hold Position',
      description: 'All drones maintain current position and altitude',
      icon: Pause,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'LAND',
      name: 'Emergency Land',
      description: 'Immediate emergency landing at current location',
      icon: StopCircle,
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      id: 'COMM',
      name: 'Lost Comm Protocol',
      description: 'Activate autonomous return for communication loss',
      icon: Radio,
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="space-y-6">
      <ReadOnlyBanner />
      <fieldset disabled className="space-y-6 opacity-90 [&_button]:cursor-not-allowed">
      {/* Emergency Status */}
      <Alert className={`border-2 ${emergencyMode ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
        <AlertTriangle className={`h-4 w-4 ${emergencyMode ? 'text-red-400' : 'text-green-400'}`} />
        <AlertDescription className={emergencyMode ? 'text-red-400' : 'text-green-400'}>
          {emergencyMode ? 'EMERGENCY MODE ACTIVE - All systems under emergency protocol' : 'NORMAL OPERATIONS - All systems operating within parameters'}
        </AlertDescription>
      </Alert>

      {/* Active Alerts */}
      <Card className="bg-slate-800 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Active Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeAlerts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No active alerts</p>
          ) : (
            activeAlerts.map((alert) => (
              <div key={alert.id} className="bg-slate-900 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                    {alert.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-400 font-mono">{alert.time}</span>
                </div>
                <p className="text-white text-sm mb-1">{alert.message}</p>
                <p className="text-xs text-gray-400">Affected: {alert.drone}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card className="bg-slate-800 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Emergency Protocols</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyProtocols.map((protocol) => (
              <Button
                key={protocol.id}
                className={`${protocol.color} text-white h-auto p-4 flex-col items-start space-y-2`}
                onClick={() => {
                  setEmergencyMode(true);
                  // Here would be the actual emergency protocol activation
                }}
              >
                <div className="flex items-center space-x-2 w-full">
                  <protocol.icon className="w-5 h-5" />
                  <span className="font-medium">{protocol.name}</span>
                </div>
                <p className="text-xs opacity-90 text-left">{protocol.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Override Controls */}
      <Card className="bg-slate-800 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Manual Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Individual Drone Control</h4>
              <div className="space-y-2">
                {['UAV-001', 'UAV-002', 'UAV-003', 'UAV-004', 'UAV-005'].map((drone) => (
                  <div key={drone} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-mono">{drone}</span>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Override
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">System Controls</h4>
              <div className="space-y-2">
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Emergency Stop All
                </Button>
                <Button size="sm" variant="outline" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  Pause All Missions
                </Button>
                <Button size="sm" variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                  Activate Safe Mode
                </Button>
              </div>
            </div>

            <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Communication</h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10">
                  Emergency Frequency
                </Button>
                <Button size="sm" variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10">
                  Backup Comms
                </Button>
                <Button size="sm" variant="outline" className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                  Signal Flare
                </Button>
              </div>
            </div>
          </div>

          {emergencyMode && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-red-400 font-medium">Emergency Mode Active</h4>
                  <p className="text-sm text-red-300">All drones are under emergency protocol</p>
                </div>
                <Button
                  onClick={() => setEmergencyMode(false)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Reset to Normal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </fieldset>
    </div>
  );
};

export default EmergencyPanel;
