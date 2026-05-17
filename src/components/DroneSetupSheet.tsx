import React, { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Battery, Signal, AlertTriangle, Home, PauseOctagon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useDroneLive } from '@/hooks/useDroneLive';
import { logAudit, diffObjects } from '@/lib/audit';
import { useToast } from '@/hooks/use-toast';

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

const STATUS_OPTIONS: Tables<'drones'>['status'][] = [
  'active',
  'standby',
  'returning',
  'maintenance',
  'offline',
  'emergency',
];

const GROUP_OPTIONS: Tables<'drones'>['group_class'][] = ['group_1', 'group_2'];

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

const DroneSetupSheet: React.FC<DroneSetupSheetProps> = ({ droneId, open, onOpenChange }) => {
  const { drone, telemetry } = useDroneLive(open ? droneId : null);
  const { toast } = useToast();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [formation, setFormation] = useState<Formation | null>(null);

  // editable form state
  const [callsign, setCallsign] = useState('');
  const [type, setType] = useState('');
  const [groupClass, setGroupClass] =
    useState<Tables<'drones'>['group_class']>('group_1');
  const [status, setStatus] = useState<Tables<'drones'>['status']>('standby');
  const [missionId, setMissionId] = useState<string | null>(null);
  const [config, setConfig] = useState<DroneConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  // hydrate form when drone arrives
  useEffect(() => {
    if (!drone) return;
    setCallsign(drone.callsign);
    setType(drone.type);
    setGroupClass(drone.group_class);
    setStatus(drone.status);
    setMissionId(drone.current_mission_id);
    setConfig({ ...DEFAULT_CONFIG, ...((drone as any).config ?? {}) });
  }, [drone]);

  // load missions, alerts, formation when sheet opens
  useEffect(() => {
    if (!open || !droneId) return;
    (async () => {
      const [m, a, f] = await Promise.all([
        supabase
          .from('missions')
          .select('*')
          .in('status', ['planned', 'active'])
          .order('created_at', { ascending: false }),
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
      setMissions(m.data ?? []);
      setAlerts(a.data ?? []);
      setFormation(f.data ?? null);
    })();
  }, [open, droneId]);

  const dirty = useMemo(() => {
    if (!drone) return false;
    return (
      callsign !== drone.callsign ||
      type !== drone.type ||
      groupClass !== drone.group_class ||
      status !== drone.status ||
      missionId !== drone.current_mission_id ||
      JSON.stringify(config) !==
        JSON.stringify({ ...DEFAULT_CONFIG, ...((drone as any).config ?? {}) })
    );
  }, [drone, callsign, type, groupClass, status, missionId, config]);

  const syncMissionAssignment = async (
    oldMissionId: string | null,
    newMissionId: string | null,
    droneRowId: string,
  ) => {
    if (oldMissionId === newMissionId) return;
    if (oldMissionId) {
      const { data } = await supabase
        .from('missions')
        .select('assigned_drone_ids')
        .eq('id', oldMissionId)
        .maybeSingle();
      if (data) {
        await supabase
          .from('missions')
          .update({
            assigned_drone_ids: (data.assigned_drone_ids ?? []).filter(
              (d: string) => d !== droneRowId,
            ),
          })
          .eq('id', oldMissionId);
      }
    }
    if (newMissionId) {
      const { data } = await supabase
        .from('missions')
        .select('assigned_drone_ids')
        .eq('id', newMissionId)
        .maybeSingle();
      if (data) {
        const ids = new Set([...(data.assigned_drone_ids ?? []), droneRowId]);
        await supabase
          .from('missions')
          .update({ assigned_drone_ids: Array.from(ids) })
          .eq('id', newMissionId);
      }
    }
  };

  const handleSave = async () => {
    if (!drone) return;
    setSaving(true);
    const before = {
      callsign: drone.callsign,
      type: drone.type,
      group_class: drone.group_class,
      status: drone.status,
      current_mission_id: drone.current_mission_id,
      config: (drone as any).config ?? DEFAULT_CONFIG,
    };
    const after = {
      callsign,
      type,
      group_class: groupClass,
      status,
      current_mission_id: missionId,
      config,
    };
    const changes = diffObjects(before, after);

    const { error } = await supabase
      .from('drones')
      .update(after as any)
      .eq('id', drone.id);

    if (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    await syncMissionAssignment(drone.current_mission_id, missionId, drone.id);

    // alert side-effects on status change
    if (before.status !== status) {
      if (status === 'emergency') {
        await supabase.from('alerts').insert({
          drone_id: drone.id,
          type: 'status_change',
          severity: 'critical',
          message: `${drone.callsign} emergency stop activated`,
        });
      } else if (status === 'maintenance' || status === 'offline' || status === 'returning') {
        await supabase.from('alerts').insert({
          drone_id: drone.id,
          type: 'status_change',
          severity: 'warning',
          message: `${drone.callsign} status changed to ${status}`,
        });
      }
    }

    await logAudit('drone.updated', 'drone', drone.id, { changes });
    toast({ title: 'Saved', description: `${callsign} updated.` });
    setSaving(false);
  };

  const quickAction = async (
    action: 'rtb' | 'standby' | 'emergency',
  ) => {
    if (!drone) return;
    const map = {
      rtb: { status: 'returning' as const, severity: 'warning' as const, label: 'Return to Base' },
      standby: { status: 'standby' as const, severity: null, label: 'Set Standby' },
      emergency: {
        status: 'emergency' as const,
        severity: 'critical' as const,
        label: 'Emergency Stop',
      },
    };
    const cfg = map[action];
    const { error } = await supabase
      .from('drones')
      .update({ status: cfg.status })
      .eq('id', drone.id);
    if (error) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
      return;
    }
    if (cfg.severity) {
      await supabase.from('alerts').insert({
        drone_id: drone.id,
        type: action,
        severity: cfg.severity,
        message: `${drone.callsign}: ${cfg.label} triggered`,
      });
    }
    await logAudit(`drone.${action}`, 'drone', drone.id, {
      from: drone.status,
      to: cfg.status,
    });
    setStatus(cfg.status);
    toast({ title: cfg.label, description: drone.callsign });
  };

  const removeFromFormation = async () => {
    if (!formation || !drone) return;
    const newIds = (formation.drone_ids ?? []).filter((d) => d !== drone.id);
    await supabase
      .from('swarm_formations')
      .update({ drone_ids: newIds })
      .eq('id', formation.id);
    await logAudit('formation.member_removed', 'swarm_formation', formation.id, {
      drone_id: drone.id,
    });
    setFormation(null);
    toast({ title: 'Removed from formation', description: formation.name });
  };

  const acknowledgeAlert = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, acknowledged: true, acknowledged_at: new Date().toISOString() }
          : a,
      ),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-slate-900 border-l border-green-500/30 text-white overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-green-400 font-mono">
            {drone?.callsign ?? 'Loading…'} · Setup
          </SheetTitle>
        </SheetHeader>

        {drone && (
          <>
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
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Callsign</Label>
                  <Input
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="bg-slate-800 border-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-slate-800 border-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Group Class</Label>
                  <Select
                    value={groupClass}
                    onValueChange={(v) =>
                      setGroupClass(v as Tables<'drones'>['group_class'])
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-green-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-green-500/10" />
                <div className="text-xs text-gray-400 space-y-1 font-mono">
                  <div>ID: {drone.id}</div>
                  <div>Created: {new Date(drone.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(drone.updated_at).toLocaleString()}</div>
                </div>
              </TabsContent>

              {/* TAB 2: Status & Mission */}
              <TabsContent value="mission" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as Tables<'drones'>['status'])}
                  >
                    <SelectTrigger className="bg-slate-800 border-green-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Mission</Label>
                  <Select
                    value={missionId ?? 'none'}
                    onValueChange={(v) => setMissionId(v === 'none' ? null : v)}
                  >
                    <SelectTrigger className="bg-slate-800 border-green-500/20">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {missions.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} · {m.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-green-500/10" />

                <div>
                  <Label className="text-xs text-gray-400">Swarm Formation</Label>
                  {formation ? (
                    <div className="mt-2 flex items-center justify-between bg-slate-800 border border-green-500/20 rounded p-2">
                      <div className="text-sm">
                        {formation.name}{' '}
                        <span className="text-xs text-gray-400">
                          ({formation.formation_type})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={removeFromFormation}
                      >
                        <X className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">Not in any formation</div>
                  )}
                </div>

                <Separator className="bg-green-500/10" />

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Quick Actions</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={() => quickAction('rtb')}
                    >
                      <Home className="w-3 h-3 mr-1" /> RTB
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => quickAction('standby')}
                    >
                      <PauseOctagon className="w-3 h-3 mr-1" /> Standby
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm(`Emergency stop ${drone.callsign}?`)) {
                          quickAction('emergency');
                        }
                      }}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" /> E-Stop
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: Safety & Alerts */}
              <TabsContent value="safety" className="space-y-5 mt-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <Label>RTB Battery Threshold</Label>
                      <span className="text-green-400">{config.rtbBatteryPct}%</span>
                    </div>
                    <Slider
                      min={5}
                      max={50}
                      step={1}
                      value={[config.rtbBatteryPct]}
                      onValueChange={(v) =>
                        setConfig({ ...config, rtbBatteryPct: v[0] })
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <Label>Min Signal Threshold</Label>
                      <span className="text-green-400">{config.minSignalPct}%</span>
                    </div>
                    <Slider
                      min={10}
                      max={80}
                      step={1}
                      value={[config.minSignalPct]}
                      onValueChange={(v) =>
                        setConfig({ ...config, minSignalPct: v[0] })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Max Altitude (ft)</Label>
                      <Input
                        type="number"
                        value={config.maxAltitudeFt}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            maxAltitudeFt: Number(e.target.value),
                          })
                        }
                        className="bg-slate-800 border-green-500/20"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Speed (mph)</Label>
                      <Input
                        type="number"
                        value={config.maxSpeedMph}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            maxSpeedMph: Number(e.target.value),
                          })
                        }
                        className="bg-slate-800 border-green-500/20"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-green-500/10" />

                <div>
                  <Label className="text-xs text-gray-400">Recent Alerts</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
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
                        {!a.acknowledged && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 h-6 text-green-400 hover:bg-green-500/10"
                            onClick={() => acknowledgeAlert(a.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save bar */}
            <div className="sticky bottom-0 mt-6 pt-4 bg-slate-900 border-t border-green-500/20 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                disabled={!dirty || saving}
                onClick={handleSave}
                className="bg-green-500 text-slate-900 hover:bg-green-400"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DroneSetupSheet;
