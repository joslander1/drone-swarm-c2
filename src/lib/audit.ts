// Read-only public demo: audit logging is a no-op.
// Kept as an exported function so existing call sites don't break.
export async function logAudit(
  _action: string,
  _entityType: string,
  _entityId: string,
  _details: Record<string, unknown> = {},
) {
  return;
}

export function diffObjects<T extends Record<string, any>>(
  before: T,
  after: T,
): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    const a = before[k];
    const b = after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changes[k] = { from: a, to: b };
    }
  }
  return changes;
}
