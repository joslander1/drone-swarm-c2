import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Battery, Signal, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import DroneSetupSheet from './DroneSetupSheet';

interface DroneFleetProps {
  expanded?: boolean;
}

type Drone = Tables<'drones'>;

const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatGroup = (g: string) =>
  g === 'group_1' ? 'Group 1' : g === 'group_2' ? 'Group 2' : g;

const DroneFleet: React.FC<DroneFleetProps> = ({ expanded = false }) => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [setupDroneId, setSetupDroneId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('drones')
        .select('*')
        .order('callsign', { ascending: true });
      setDrones(data ?? []);
    };
    load();

    const channel = supabase
      .channel('drone-fleet')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drones' },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openSetup = (id: string) => {
    setSetupDroneId(id);
    setSheetOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'returning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'standby':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'maintenance':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'emergency':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
      <>
        <Card className="bg-slate-800 border-green-500/30 h-96 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <Plane className="w-5 h-5" />
              <span>Fleet Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto flex-1 min-h-0">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className="bg-slate-900 border border-green-500/20 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-sm text-white">{drone.callsign}</div>
                  <Badge className={getStatusColor(drone.status)}>
                    {formatStatus(drone.status)}
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
        <DroneSetupSheet
          droneId={setupDroneId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drones.map((drone) => (
            <Card key={drone.id} className="bg-slate-800 border-green-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-400 font-mono text-lg">
                    {drone.callsign}
                  </CardTitle>
                  <Badge className={getStatusColor(drone.status)}>
                    {formatStatus(drone.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  {formatGroup(drone.group_class)} {drone.type}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Altitude</div>
                    <div className="text-sm text-white">{drone.altitude_ft} ft</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Speed</div>
                    <div className="text-sm text-white">{drone.speed_mph} mph</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Position</div>
                  <div className="text-xs text-white font-mono">
                    {Number(drone.latitude).toFixed(4)},{' '}
                    {Number(drone.longitude).toFixed(4)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Battery className={`w-4 h-4 ${getBatteryColor(drone.battery)}`} />
                    <span className={`text-sm ${getBatteryColor(drone.battery)}`}>
                      {drone.battery}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Signal className={`w-4 h-4 ${getSignalColor(drone.signal)}`} />
                    <span className={`text-sm ${getSignalColor(drone.signal)}`}>
                      {drone.signal}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={() => openSetup(drone.id)}
                    title="View details"
                    aria-label="View drone details"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <DroneSetupSheet
        droneId={setupDroneId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
};

export default DroneFleet;
