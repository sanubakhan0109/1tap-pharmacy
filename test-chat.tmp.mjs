const base = 'http://localhost:5000';
async function show(label, res) {
  const data = await res.json().catch(() => ({}));
  // sanitize: never print key material
  const s = JSON.stringify(data, (k, v) => (/key/i.test(k) && typeof v === 'string' && v.length > 8) ? '(redacted)' : v);
  console.log('=== ' + label + ' [' + res.status + '] ===');
  console.log(s.slice(0, 1200));
}
const h = await fetch(base + '/api/health');
await show('HEALTH', h);
for (const [label, msg] of [
  ['GREETING', 'Hello!'],
  ['ABOUT-1TAP', 'What is 1TAP?'],
  ['CATALOG-SEARCH', 'Do you have Hydrating Face Serum?'],
  ['NONEXISTENT', 'Do you have Unicorn Magic Pills 500mg?'],
]) {
  const r = await fetch(base + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg, history: [], catalog: [] }),
  });
  await show(label + ' :: ' + msg, r);
}
// validation checks
const e1 = await fetch(base + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '', history: [] }) });
await show('EMPTY-MESSAGE-VALIDATION', e1);
