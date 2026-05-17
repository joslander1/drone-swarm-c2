import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Battery, Signal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useDroneLive } from '@/hooks/useDroneLive';
import ReadOnlyBanner from './ReadOnlyBanner';

type Mission = Tables<'missions'>;
type Alert = Tables<'alerts'>;
type Formation = Tables<'swarm_formations'>;

type DroneConfig = {
  rtbBatteryPct: number;
  minSignalPct: number;
  maxAltitudeFt: number;
  maxSpeedMph: number;
};

const DEFAULT_CONFIG: DroneConfig = {
  rtbBatteryPct: 20,
  minSignalPct: 30,
  maxAltitudeFt: 2000,
  maxSpeedMph: 80,
};

interface DroneSetupSheetProps {
  droneId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadgeClass = (s: string) => {
  switch (s) {
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

const severityBadgeClass = (s: string) => {
  switch (s) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="rounded-md bg-slate-800 border border-green-500/20 px-3 py-2 text-sm text-white">
      {children}
    </div>
  </div>
);

const DroneSetupSheet: React.FC<DroneSetupSheetProps> = ({ droneId, open, onOpenChange }) => {
  const { drone, telemetry } = useDroneLive(open ? droneId : null);

  const [mission, setMission] = useState<Mission | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [formation, setFormation] = useState<Formation | null>(null);

  useEffect(() => {
    if (!open || !droneId) return;
    (async () => {
      const [a, f] = await Promise.all([
        supabase
          .from('alerts')
          .select('*')
          .eq('drone_id', droneId)
          .order('occurred_at', { ascending: false })
          .limit(10),
        supabase
          .from('swarm_formations')
          .select('*')
          .contains('drone_ids', [droneId])
          .maybeSingle(),
      ]);
      setAlerts(a.data ?? []);
      setFormation(f.data ?? null);
    })();
  }, [open, droneId]);

  useEffect(() => {
    if (!drone?.current_mission_id) {
      setMission(null);
      return;
    }
    supabase
      .from('missions')
      .select('*')
      .eq('id', drone.current_mission_id)
      .maybeSingle()
      .then(({ data }) => setMission(data ?? null));
  }, [drone?.current_mission_id]);

  const config: DroneConfig = {
    ...DEFAULT_CONFIG,
    ...(((drone as any)?.config as Partial<DroneConfig>) ?? {}),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-slate-900 border-l border-green-500/30 text-white overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-green-400 font-mono">
            {drone?.callsign ?? 'Loading…'} · Details
          </SheetTitle>
        </SheetHeader>

        {drone && (
          <>
            <ReadOnlyBanner className="mt-3" />

            {/* Live header */}
            <div className="mt-4 p-3 rounded-lg bg-slate-800 border border-green-500/20 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge className={statusBadgeClass(drone.status)}>{drone.status}</Badge>
                <span className="text-xs text-gray-400">{drone.type}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Battery className="w-3 h-3 text-green-400" />
                  {telemetry?.battery ?? drone.battery}%
                </span>
                <span className="flex items-center gap-1">
                  <Signal className="w-3 h-3 text-green-400" />
                  {telemetry?.signal ?? drone.signal}%
                </span>
                <span className="text-gray-400">
                  {telemetry
                    ? new Date(telemetry.recorded_at).toLocaleTimeString()
                    : 'no telemetry'}
                </span>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="bg-slate-800 border border-green-500/20">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="mission">Status & Mission</TabsTrigger>
                <TabsTrigger value="safety">Safety & Alerts</TabsTrigger>
              </TabsList>

              {/* TAB 1: Overview / Identity */}
              <TabsContent value="overview" className="space-y-3 mt-4">
                <Field label="Callsign">{drone.callsign}</Field>
                <Field label="Type">{drone.type}</Field>
                <Field label="Group Class">{drone.group_class.replace('_', ' ')}</Field>
                <Separator className="bg-green-500/10" />
                <div className="text-xs text-gray-400 space-y-1 font-mono">
                  <div>ID: {drone.id}</div>
                  <div>Created: {new Date(drone.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(drone.updated_at).toLocaleString()}</div>
                </div>
              </TabsContent>

              {/* TAB 2: Status & Mission */}
              <TabsContent value="mission" className="space-y-3 mt-4">
                <Field label="Status">{drone.status}</Field>
                <Field label="Current Mission">
                  {mission ? `${mission.name} · ${mission.status}` : 'Unassigned'}
                </Field>

                <Separator className="bg-green-500/10" />

                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Swarm Formation</div>
                  {formation ? (
                    <div className="rounded-md bg-slate-800 border border-green-500/20 px-3 py-2 text-sm">
                      {formation.name}{' '}
                      <span className="text-xs text-gray-400">
                        ({formation.formation_type})
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Not in any formation</div>
                  )}
                </div>

                <Separator className="bg-green-500/10" />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Altitude">{drone.altitude_ft} ft</Field>
                  <Field label="Speed">{drone.speed_mph} mph</Field>
                  <Field label="Latitude">{Number(drone.latitude).toFixed(4)}</Field>
                  <Field label="Longitude">{Number(drone.longitude).toFixed(4)}</Field>
                </div>
              </TabsContent>

              {/* TAB 3: Safety & Alerts */}
              <TabsContent value="safety" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="RTB Battery Threshold">{config.rtbBatteryPct}%</Field>
                  <Field label="Min Signal Threshold">{config.minSignalPct}%</Field>
                  <Field label="Max Altitude">{config.maxAltitudeFt} ft</Field>
                  <Field label="Max Speed">{config.maxSpeedMph} mph</Field>
                </div>

                <Separator className="bg-green-500/10" />

                <div>
                  <div className="text-xs text-gray-400 mb-2">Recent Alerts</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {alerts.length === 0 && (
                      <div className="text-xs text-gray-500">No alerts</div>
                    )}
                    {alerts.map((a) => (
                      <div
                        key={a.id}
                        className="bg-slate-800 border border-green-500/20 rounded p-2 text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <Badge className={severityBadgeClass(a.severity)}>
                            {a.severity}
                          </Badge>
                          <span className="text-gray-500">
                            {new Date(a.occurred_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-white">{a.message}</div>
                        {a.acknowledged && (
                          <div className="mt-1 text-[10px] text-green-400">Acknowledged</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 mt-6 pt-4 bg-slate-900 border-t border-green-500/20 flex justify-end">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DroneSetupSheet;
