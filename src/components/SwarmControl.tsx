import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Zap, Save, Power, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type FormationType = Database['public']['Enums']['formation_type'];
type SwarmRow = Database['public']['Tables']['swarm_formations']['Row'];
type DroneRow = Database['public']['Tables']['drones']['Row'];

const FORMATIONS: { id: FormationType; name: string; description: string }[] = [
  { id: 'line', name: 'Line Abreast', description: 'Linear formation for wide surveillance' },
  { id: 'wedge', name: 'Wedge', description: 'V-shaped formation for penetration' },
  { id: 'diamond', name: 'Diamond', description: 'Diamond formation for protection' },
  { id: 'circle', name: 'Circle', description: 'Circular formation for target observation' },
  { id: 'grid', name: 'Grid', description: 'Grid formation for area coverage' },
  { id: 'custom', name: 'Custom', description: 'User-defined formation pattern' },
];

const SwarmControl = () => {
  const [swarms, setSwarms] = useState<SwarmRow[]>([]);
  const [drones, setDrones] = useState<DroneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [formationType, setFormationType] = useState<FormationType>('line');
  const [selectedDroneIds, setSelectedDroneIds] = useState<string[]>([]);
  const [spacing, setSpacing] = useState([50]);
  const [altitude, setAltitude] = useState([1000]);
  const [heading, setHeading] = useState([0]);

  const loadAll = async () => {
    const [swarmRes, droneRes] = await Promise.all([
      supabase.from('swarm_formations').select('*').order('created_at', { ascending: false }),
      supabase.from('drones').select('*').order('callsign'),
    ]);
    if (swarmRes.error) toast.error('Failed to load swarms');
    else setSwarms(swarmRes.data ?? []);
    if (droneRes.error) toast.error('Failed to load drones');
    else setDrones(droneRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel('swarm-formations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swarm_formations' }, () => {
        loadAll();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const droneById = useMemo(() => {
    const map = new Map<string, DroneRow>();
    drones.forEach((d) => map.set(d.id, d));
    return map;
  }, [drones]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setFormationType('line');
    setSelectedDroneIds([]);
    setSpacing([50]);
    setAltitude([1000]);
    setHeading([0]);
  };

  const loadIntoForm = (swarm: SwarmRow) => {
    setEditingId(swarm.id);
    setName(swarm.name);
    setFormationType(swarm.formation_type);
    setSelectedDroneIds(swarm.drone_ids ?? []);
    const params = (swarm.parameters as Record<string, number> | null) ?? {};
    setSpacing([params.spacing_m ?? 50]);
    setAltitude([params.altitude_ft ?? 1000]);
    setHeading([params.heading_deg ?? 0]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Formation name is required');
      return;
    }
    if (selectedDroneIds.length === 0) {
      toast.error('Select at least one drone');
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      formation_type: formationType,
      drone_ids: selectedDroneIds,
      parameters: {
        spacing_m: spacing[0],
        altitude_ft: altitude[0],
        heading_deg: heading[0],
      },
    };
    const { error } = editingId
      ? await supabase.from('swarm_formations').update(payload).eq('id', editingId)
      : await supabase.from('swarm_formations').insert(payload);
    setSaving(false);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    toast.success(editingId ? 'Formation updated' : 'Formation created');
    resetForm();
  };

  const handleActivate = async (swarm: SwarmRow) => {
    const { error } = await supabase
      .from('swarm_formations')
      .update({ active: !swarm.active })
      .eq('id', swarm.id);
    if (error) {
      toast.error(`Failed: ${error.message}`);
      return;
    }
    toast.success(swarm.active ? 'Formation deactivated' : 'Formation activated');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('swarm_formations').delete().eq('id', id);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    toast.success('Formation deleted');
    if (editingId === id) resetForm();
  };

  const toggleDrone = (id: string) => {
    setSelectedDroneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Saved Swarms */}
      <Card className="bg-slate-800 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Configured Swarms</span>
            </span>
            <Button
              size="sm"
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-3 h-3 mr-1" /> New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : swarms.length === 0 ? (
            <p className="text-gray-400 text-sm">No swarms configured yet. Use the form below to create one.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {swarms.map((swarm) => {
                const params = (swarm.parameters as Record<string, number> | null) ?? {};
                return (
                  <div
                    key={swarm.id}
                    className={`bg-slate-900 border rounded-lg p-4 space-y-3 ${
                      swarm.active ? 'border-green-500/60' : 'border-green-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium">{swarm.name}</div>
                      <Badge
                        className={
                          swarm.active
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }
                      >
                        {swarm.active ? 'Active' : 'Standby'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400">Formation</div>
                        <div className="text-white capitalize">{swarm.formation_type}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Drones</div>
                        <div className="text-white">{swarm.drone_ids?.length ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Spacing</div>
                        <div className="text-white">{params.spacing_m ?? '—'} m</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Altitude</div>
                        <div className="text-white">{params.altitude_ft ?? '—'} ft</div>
                      </div>
                    </div>
                    {swarm.drone_ids && swarm.drone_ids.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {swarm.drone_ids.map((id) => (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-slate-800 border border-green-500/20 rounded text-xs font-mono text-green-400"
                          >
                            {droneById.get(id)?.callsign ?? id.slice(0, 6)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => loadIntoForm(swarm)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`flex-1 ${
                          swarm.active
                            ? 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        }`}
                        onClick={() => handleActivate(swarm)}
                      >
                        <Power className="w-3 h-3 mr-1" />
                        {swarm.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(swarm.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formation Editor */}
      <Card className="bg-slate-800 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>{editingId ? 'Edit Formation' : 'New Formation'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SWARM-ALPHA"
                  className="bg-slate-900 border-green-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Formation Type</label>
                <Select value={formationType} onValueChange={(v) => setFormationType(v as FormationType)}>
                  <SelectTrigger className="bg-slate-900 border-green-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-green-500/30">
                    {FORMATIONS.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="text-white hover:bg-green-500/10">
                        <div>
                          <div className="font-medium">{f.name}</div>
                          <div className="text-xs text-gray-400">{f.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Spacing: {spacing[0]} m</label>
                <Slider value={spacing} onValueChange={setSpacing} min={10} max={200} step={5} />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Altitude: {altitude[0]} ft</label>
                <Slider value={altitude} onValueChange={setAltitude} min={500} max={3000} step={50} />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Heading: {heading[0]}°</label>
                <Slider value={heading} onValueChange={setHeading} min={0} max={359} step={1} />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Member Drones ({selectedDroneIds.length} selected)
              </label>
              <div className="bg-slate-900 border border-green-500/20 rounded-lg p-3 max-h-80 overflow-y-auto space-y-2">
                {drones.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No drones in fleet yet. Add drones to assign them to a swarm.
                  </p>
                ) : (
                  drones.map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 rounded px-2 py-1"
                    >
                      <Checkbox
                        checked={selectedDroneIds.includes(d.id)}
                        onCheckedChange={() => toggleDrone(d.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-white font-mono">{d.callsign}</div>
                        <div className="text-xs text-gray-400">{d.type}</div>
                      </div>
                      <Badge className="bg-slate-800 border-green-500/30 text-green-400 text-xs">
                        {d.status}
                      </Badge>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-green-500/20">
            {editingId && (
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving…' : editingId ? 'Update Formation' : 'Save Formation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwarmControl;
