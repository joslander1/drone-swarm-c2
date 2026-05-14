# Drone Fleet Command

A hardware-agnostic autonomous flight control of Group 1 and Group 2 unmanned aerial systems (UAS), with built-in swarm coordination capabilities.

## Overview

Drone Fleet Command is a tactical operations interface designed to plan, monitor, and control autonomous drone missions across mixed fleets. The system is hardware-agnostic — it provides a unified control surface regardless of underlying airframe, autopilot, or communication link — and supports coordinated swarm behavior when missions require it.

## Features

- **Tactical Map** — Live interactive map (Leaflet + OpenStreetMap) showing drone positions, waypoints, and mission overlays
- **Fleet Management** — Real-time status, battery, signal, altitude, and position for every airframe
- **Mission Planner** — Define waypoints, flight paths, and mission parameters
- **Swarm Control** — Coordinate multiple drones in formations and collaborative behaviors
- **Telemetry** — Live telemetry feeds and system diagnostics
- **Emergency Panel** — Return-to-base, hold, emergency land, and lost-comm protocols with manual override
- **Hardware Agnostic** — Designed to integrate with any Group 1 or Group 2 UAS regardless of vendor

## Drone Group Support

- **Group 1**: < 20 lbs, < 1,200 ft AGL, < 100 kts (fixed-wing, rotary-wing, hybrid)
- **Group 2**: 21–55 lbs, < 3,500 ft AGL, < 250 kts (fixed-wing, rotary-wing, hybrid)

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Mapping**: Leaflet + OpenStreetMap
- **Backend**: Lovable Cloud (database, auth, storage, edge functions)
- **State / Data**: TanStack Query
- **Routing**: React Router

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:8080`.

## Project Structure

```text
src/
├── components/
│   ├── TacticalMap.tsx      # Interactive map view
│   ├── DroneFleet.tsx       # Fleet status & control
│   ├── MissionPlanner.tsx   # Mission/waypoint planning
│   ├── SwarmControl.tsx     # Swarm coordination
│   ├── Telemetry.tsx        # Live telemetry
│   └── EmergencyPanel.tsx   # Emergency protocols
├── pages/
│   └── Index.tsx            # Main command dashboard
└── integrations/
    └── supabase/            # Backend client (auto-generated)
```

## Backend

This project runs on Lovable Cloud (Postgres database, authentication, file storage, realtime, and serverless edge functions) — no external account setup required. The Supabase JS client is auto-generated at `src/integrations/supabase/client.ts`.

### Database Schema

| Table | Purpose |
| --- | --- |
| `drones` | Fleet inventory: callsign, type, group class (Group 1 / Group 2), status, battery, signal, altitude, speed, position |
| `missions` | Mission name, description, status, assigned drones, start/end times |
| `waypoints` | Ordered waypoint list per mission (lat/lng, altitude, action) |
| `swarm_formations` | Saved swarm configurations: name, formation type, member drone IDs, parameters (spacing, altitude, heading), active flag |
| `telemetry` | Time-series telemetry samples per drone (position, heading, speed, battery, signal) |
| `alerts` | Drone alerts and emergency events with severity and acknowledgement |
| `audit_log` | Operator action history with entity references and details |

### Enums

- `drone_status` — `active`, `standby`, `returning`, `maintenance`, `offline`, `emergency`
- `drone_group` — `group_1`, `group_2`
- `mission_status` — `planned`, `active`, `paused`, `completed`, `aborted`
- `alert_severity` — `info`, `warning`, `critical`
- `formation_type` — `line`, `wedge`, `diamond`, `circle`, `grid`, `custom`

### Realtime

The following tables stream changes over Supabase Realtime so multiple operator stations stay in sync:

- `drones`
- `telemetry`
- `alerts`

### Authentication & Access

The current build runs without operator authentication — all tables have permissive RLS policies so the command interface works out of the box. Before deploying to a production environment, add operator login (email + Google) and tighten RLS policies to require an authenticated session, with a roles table (`admin` / `operator` / `viewer`) gating write access.

### Usage Example

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch the fleet
const { data: drones } = await supabase
  .from('drones')
  .select('*')
  .order('callsign');

// Subscribe to live telemetry
const channel = supabase
  .channel('telemetry-stream')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'telemetry' },
    (payload) => console.log('new telemetry:', payload.new))
  .subscribe();
```

## Safety Notice

This software is intended as a command-and-control interface. Always operate UAS in compliance with local airspace regulations (e.g., FAA Part 107 in the United States) and within visual line of sight unless properly authorized for BVLOS operations.

## License

Proprietary — all rights reserved.
