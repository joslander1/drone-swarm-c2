import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import ReadOnlyBanner from './ReadOnlyBanner';

type SwarmRow = Database['public']['Tables']['swarm_formations']['Row'];
type DroneRow = Database['public']['Tables']['drones']['Row'];

const SwarmControl = () => {
  const [swarms, setSwarms] = useState<SwarmRow[]>([]);
  const [drones, setDrones] = useState<DroneRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <ReadOnlyBanner />

      <Card className="bg-slate-800 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Configured Swarms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : swarms.length === 0 ? (
            <p className="text-gray-400 text-sm">No swarms configured.</p>
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SwarmControl;
