## Goal

Make the entire app strictly **read-only for the public**. Public visitors can view drones, missions, telemetry, alerts, swarm formations, waypoints, and audit log — but no one (signed in or not) can insert, update, or delete anything through the website.

This resolves all 7 "Anyone can modify…" security findings and the "RLS Policy Always True" warning by removing every write policy.

## Changes

### 1. Database (migration)

For each of these tables, drop the existing `Public write` policy so only the `Public read` SELECT policy remains:

- `drones`
- `missions`
- `waypoints`
- `swarm_formations`
- `telemetry`
- `alerts`
- `audit_log`

RLS stays enabled on every table. With no INSERT/UPDATE/DELETE policy, all writes are automatically denied. Reads continue to work for everyone.

The seeded demonstration data already in the tables is preserved.

### 2. Frontend (UI changes only — no business logic)

Since writes will now fail, the UI is updated to a **demo / read-only** posture so users don't see broken save buttons:

- **`DroneSetupSheet.tsx`** — switch all fields (callsign, type, group class, status, mission, sliders, alert acknowledge) to read-only/disabled. Replace the Save bar with a single "Close" button. Hide quick actions (RTB / Standby / E-Stop), Remove-from-formation, and Acknowledge buttons. Add a small banner: "Read-only demo — modifications are disabled."
- **`DroneFleet.tsx`** — rename the gear icon tooltip from "Setup" to "View details". Keep the sheet open behavior.
- **`MissionPlanner.tsx`**, **`SwarmControl.tsx`**, **`EmergencyPanel.tsx`** — disable or hide any create / edit / delete / activate / trigger controls; keep all viewing UI intact. Add the same read-only banner at the top of each panel where write actions used to be.
- Remove `logAudit` calls (they would fail anyway with no write access).

No table structure, no auth system, no realtime changes — only RLS policies are tightened and the UI is set to view-only.

### 3. Security findings

After the migration, mark all 7 `PUBLIC_WRITE_OPERATIONAL_DATA` findings and the `SUPA_rls_policy_always_true` warning as fixed, and update the security memory to record that this project is an intentionally public, read-only demo (so future scans don't re-flag the public SELECT policies).

## Files touched

- `supabase/migrations/<new>.sql` — drop 7 write policies
- `src/components/DroneSetupSheet.tsx` — read-only mode
- `src/components/DroneFleet.tsx` — tooltip + remove write affordances
- `src/components/MissionPlanner.tsx` — disable write controls
- `src/components/SwarmControl.tsx` — disable write controls
- `src/components/EmergencyPanel.tsx` — disable write controls
- `src/lib/audit.ts` — becomes a no-op (or removed)

## Out of scope

- No authentication added (not needed for a read-only public demo).
- No data deletion — existing seed rows remain visible.
- No changes to telemetry ingestion; if you later want a backend job to keep writing telemetry, that would be added via a service-role edge function in a follow-up.
