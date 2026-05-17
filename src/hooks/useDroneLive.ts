import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type DroneRow = Tables<'drones'>;
export type TelemetryRow = Tables<'telemetry'>;

export function useDroneLive(droneId: string | null) {
  const [drone, setDrone] = useState<DroneRow | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!droneId) {
      setDrone(null);
      setTelemetry(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: d } = await supabase
        .from('drones')
        .select('*')
        .eq('id', droneId)
        .maybeSingle();
      if (!cancelled) setDrone(d ?? null);

      const { data: t } = await supabase
        .from('telemetry')
        .select('*')
        .eq('drone_id', droneId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) setTelemetry(t ?? null);
      if (!cancelled) setLoading(false);
    })();

    const channel = supabase
      .channel(`drone-live-${droneId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'drones', filter: `id=eq.${droneId}` },
        (payload) => setDrone(payload.new as DroneRow),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry', filter: `drone_id=eq.${droneId}` },
        (payload) => setTelemetry(payload.new as TelemetryRow),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [droneId]);

  return { drone, telemetry, loading };
}
