
-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Enums
CREATE TYPE public.drone_status AS ENUM ('active', 'standby', 'returning', 'maintenance', 'offline', 'emergency');
CREATE TYPE public.drone_group AS ENUM ('group_1', 'group_2');
CREATE TYPE public.mission_status AS ENUM ('planned', 'active', 'paused', 'completed', 'aborted');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE public.formation_type AS ENUM ('line', 'wedge', 'diamond', 'circle', 'grid', 'custom');

-- Drones
CREATE TABLE public.drones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  callsign TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  group_class public.drone_group NOT NULL,
  status public.drone_status NOT NULL DEFAULT 'standby',
  current_mission_id UUID,
  battery INTEGER NOT NULL DEFAULT 100 CHECK (battery BETWEEN 0 AND 100),
  signal INTEGER NOT NULL DEFAULT 100 CHECK (signal BETWEEN 0 AND 100),
  altitude_ft NUMERIC NOT NULL DEFAULT 0,
  speed_mph NUMERIC NOT NULL DEFAULT 0,
  latitude NUMERIC NOT NULL DEFAULT 0,
  longitude NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status public.mission_status NOT NULL DEFAULT 'planned',
  assigned_drone_ids UUID[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drones
  ADD CONSTRAINT drones_current_mission_fk
  FOREIGN KEY (current_mission_id) REFERENCES public.missions(id) ON DELETE SET NULL;

-- Waypoints
CREATE TABLE public.waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_ft NUMERIC NOT NULL DEFAULT 0,
  action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mission_id, sequence)
);

CREATE INDEX idx_waypoints_mission ON public.waypoints(mission_id);

-- Swarm formations
CREATE TABLE public.swarm_formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  formation_type public.formation_type NOT NULL DEFAULT 'line',
  drone_ids UUID[] NOT NULL DEFAULT '{}',
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telemetry (time-series)
CREATE TABLE public.telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID NOT NULL REFERENCES public.drones(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_ft NUMERIC NOT NULL DEFAULT 0,
  speed_mph NUMERIC NOT NULL DEFAULT 0,
  heading_deg NUMERIC NOT NULL DEFAULT 0,
  battery INTEGER CHECK (battery BETWEEN 0 AND 100),
  signal INTEGER CHECK (signal BETWEEN 0 AND 100),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_drone_time ON public.telemetry(drone_id, recorded_at DESC);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES public.drones(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  severity public.alert_severity NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_occurred ON public.alerts(occurred_at DESC);

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_occurred ON public.audit_log(occurred_at DESC);

-- updated_at triggers
CREATE TRIGGER trg_drones_updated BEFORE UPDATE ON public.drones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_missions_updated BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_swarm_updated BEFORE UPDATE ON public.swarm_formations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Open access policies (no auth required) — lock down later if operator login is added
CREATE POLICY "Public read drones" ON public.drones FOR SELECT USING (true);
CREATE POLICY "Public write drones" ON public.drones FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Public write missions" ON public.missions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read waypoints" ON public.waypoints FOR SELECT USING (true);
CREATE POLICY "Public write waypoints" ON public.waypoints FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read swarms" ON public.swarm_formations FOR SELECT USING (true);
CREATE POLICY "Public write swarms" ON public.swarm_formations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read telemetry" ON public.telemetry FOR SELECT USING (true);
CREATE POLICY "Public write telemetry" ON public.telemetry FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public write alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read audit" ON public.audit_log FOR SELECT USING (true);
CREATE POLICY "Public write audit" ON public.audit_log FOR ALL USING (true) WITH CHECK (true);

-- Realtime streaming for telemetry and alerts
ALTER TABLE public.telemetry REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.drones REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drones;
