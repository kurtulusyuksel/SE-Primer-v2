import { FEATURE_NAMES, Features } from './modelInference';
const KEY = 'primer-v2-decisions';
export interface Row { oturum_id: string; kaynak: 'gercek'; features: Features; ipucu_gerekli: 0 | 1; }
export function getRows(): Row[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}
export function saveRow(row: Row) {
  const rows = getRows().filter(existing => !(existing.oturum_id === row.oturum_id && existing.features[4] === row.features[4]));
  localStorage.setItem(KEY, JSON.stringify([...rows, row]));
}
export function clearRows() { localStorage.removeItem(KEY); }

function completeSessions(rows: Row[]) {
  const grouped = new Map<string, Row[]>();
  rows.forEach(row => grouped.set(row.oturum_id, [...(grouped.get(row.oturum_id) ?? []), row]));
  return new Map([...grouped].filter(([, group]) => new Set(group.map(row => row.features[4])).size === 3));
}

export function completedSessionCount() { return completeSessions(getRows()).size; }

export function exportRows() {
  const complete = [...completeSessions(getRows()).values()].flat();
  const header = ['oturum_id', 'kaynak', ...FEATURE_NAMES, 'ipucu_gerekli'];
  const csv = [header.join(','), ...complete.map(row => [row.oturum_id, row.kaynak, ...row.features, row.ipucu_gerekli].join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'oturumlar.csv'; anchor.click();
  URL.revokeObjectURL(url);
  return complete.length / 3;
}
