import { supabase } from '@/integrations/supabase/client';

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {},
) {
  try {
    await supabase.from('audit_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details as any,
    });
  } catch (e) {
    console.error('audit log failed', e);
  }
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
