# Drone Fleet Command

A hardware-agnostic front-end for autonomous flight control of Group 1 and Group 2 unmanned aerial systems (UAS), with built-in swarm coordination capabilities.

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

This project uses Lovable Cloud for persistence, authentication, file storage, and serverless functions. No external account setup is required.

## Safety Notice

This software is intended as a command-and-control interface. Always operate UAS in compliance with local airspace regulations (e.g., FAA Part 107 in the United States) and within visual line of sight unless properly authorized for BVLOS operations.

## License

Proprietary — all rights reserved.
