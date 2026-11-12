// Score Filler 2.4
// Name matching ignores letter case, word order, punctuation and accents,
// so "doe john", "John Doe" and "DOE, JOHN" are all the same person.
// A leading or trailing "ms" on a name in Excel is ignored (the site doesn't have it).

const $ = id => document.getElementById(id);
const FOLD = { '\u00f8': 'o', '\u0142': 'l', '\u00e6': 'ae', '\u0153': 'oe', '\u0111': 'd', '\u00f0': 'd', '\u00fe': 'th', '\u00df': 'ss', '\u0131': 'i' };

function tokensOf(s) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // strip accents
    .toLowerCase()
    .replace(/['\u2018\u2019\u02bc`]/g, '')              // O'Brien -> obrien
    .replace(/[\u00f8\u0142\u00e6\u0153\u0111\u00f0\u00fe\u00df\u0131]/g, c => FOLD[c])               // S\u00f8ren -> soren
    .replace(/[^a-z0-9]+/g, ' ')                         // punctuation -> space
    .trim().split(/\s+/).filter(Boolean);
}

function keyOf(s) {
  return tokensOf(s).sort().join(' ');                   // order does not matter
}

// Excel names only: drop a leading and/or trailing "ms" (any case) first.
function excelKeyOf(s) {
  const t = tokensOf(s);
  if (t[0] === 'ms') t.shift();
  if (t[t.length - 1] === 'ms') t.pop();
  return t.sort().join(' ');
}

// Runs inside the web page. Must be self-contained (keeps its own copy of keyOf).
// `hold` = keys found in more than one site row: outlined red, never typed.
function fillScores(map, dry, hold) {
  const FOLD = { 'ø': 'o', 'ł': 'l', 'æ': 'ae', 'œ': 'oe', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ß': 'ss', 'ı': 'i' };
  const keyOf = s => (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['‘’ʼ`]/g, '')
    .replace(/[øłæœđðþßı]/g, c => FOLD[c])
    .replace(/[^a-z0-9]+/g, ' ')
    .trim().split(/\s+/).filter(Boolean)
    .sort().join(' ');

  const setVal = (el, v) => {
    el.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.blur();
  };

  document.querySelectorAll('input[data-scorefill]').forEach(el => {   // clear outlines of earlier runs
    el.style.outline = ''; el.removeAttribute('data-scorefill');
  });
  const filled = [], unmatchedSite = [];
  document.querySelectorAll('tr').forEach(row => {
    const input = row.querySelector('input[inputmode="decimal"], input[type="text"]');
    if (!input) return;
    const cells = [...row.children].map(c => (c.innerText || '').trim()).filter(Boolean);
    const hit = cells[0];                                 // the name cell only, never ID/code/attempt
    const key = keyOf(hit);
    if (hit === undefined || !Object.prototype.hasOwnProperty.call(map, key)) {
      if (cells.length) unmatchedSite.push(cells[0]);
      return;
    }
    const held = (hold || []).includes(key);
    const was = input.value;
    if (!dry && !held) setVal(input, map[key].score);
    input.style.outline = held ? '2px solid red' : '2px solid orange';
    input.setAttribute('data-scorefill', '');
    filled.push({
      key, held,
      text: hit + '  ->  ' + map[key].score +
        (was && was !== map[key].score ? '   (box already had ' + was + ')' : '') +
        (map[key].rounded ? '   [rounded from ' + map[key].raw + ']' : '')
    });
  });
  return { filled, unmatchedSite };
}

// Adds one person to the lookup table (shared by both input formats).
function addEntry(res, name, rawScore, original) {
  name = (name || '').trim();
  const raw = String(rawScore).trim();
  const m = raw.replace(/\s*%$/, '').match(/^(\d+)(?:[.,](\d+))?$/);   // plain number; "98,70" = 98.70
  const num = m ? parseFloat(m[1] + '.' + (m[2] || '0')) : NaN;
  const key = excelKeyOf(name);
  if (!name || !key) { res.skipped.push(original || name); return; }
  if (!(num <= 100)) { res.skipped.push((original || name) + '   (score is not a number from 0 to 100)'); return; }
  if (Object.prototype.hasOwnProperty.call(res.map, key)) res.dupExcel.push(name);
  const score = String(Math.round(num * 10 + 1e-9) / 10);   // half up (toFixed turned 98.35 into 98.3)
  res.map[key] = { name, score, raw, rounded: Number(score) !== num };
}

// Format 1: cells copied from Excel (tab-separated: name ... score).
function parseExcel(text) {
  const res = { map: {}, skipped: [], dupExcel: [] };
  text.split(/\r?\n/).forEach(line => {
    if (!line.trim()) return;
    const p = line.split('\t');
    if (p.length < 2) { res.skipped.push(line.trim()); return; }
    addEntry(res, p[0], p[p.length - 1], line.trim());
  });
  return res;
}

// Format 2: rows copied from the ClassMarker results page, e.g.
//   C281 DOE JOHN / (blank) / (blank) / 97.8 % / 44 / 45 / 00:27:22 / date / Answers
// The name is everything after the course code (C + 3 digits).
// The "Average" row and column headers are ignored automatically.
function parseClassMarker(text) {
  const res = { map: {}, skipped: [], dupExcel: [] };
  const lines = text.split(/\r?\n|\t/)
    .map(l => l.replace(/\u00a0/g, ' ').trim()).filter(Boolean);
  let name = null;
  const fail = () => { res.skipped.push(name + '   (no percentage found)'); name = null; };
  for (const line of lines) {
    const m = line.match(/^C\d{3}(?!\d)\s*(.*)$/i);
    if (m) { if (name !== null) fail(); name = m[1]; continue; }
    if (name === null) continue;                          // Average row, headers, etc.
    const pm = line.match(/^(\d+(?:\.\d+)?)\s*%$/);
    if (pm) { addEntry(res, name, pm[1], name); name = null; continue; }
    if (/^answers$/i.test(line) || /\d\s*\/\s*\d/.test(line) || /^\d{1,2}:\d{2}/.test(line)) { fail(); continue; }
    name += ' ' + line;                                   // name wrapped onto a 2nd line
  }
  if (name !== null) fail();
  return res;
}

function parseInput(text) {
  if (/^\s*C\d{3}(?!\d)/im.test(text))
    return Object.assign(parseClassMarker(text), { source: 'ClassMarker' });
  return Object.assign(parseExcel(text), { source: 'Excel' });
}

$('go').onclick = async () => {
  const out = $('out');
  const dry = $('dry').checked;
  const { map, skipped, dupExcel, source } = parseInput($('data').value);
  const section = (title, arr) => `${title} (${arr.length}):\n${arr.length ? arr.join('\n') : '-'}\n\n`;
  if (!Object.keys(map).length) {
    out.textContent = 'No usable rows found. Paste cells copied from Excel, or rows copied from the ClassMarker results page.\n\n' +
      (skipped.length ? section('Skipped pasted lines (no name or score)', skipped) : '');
    return;
  }

  let res;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const run = (d, hold) => chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: fillScores,
      args: [map, d, hold]
    });
    // Look first (types nothing): a name found in 2+ rows, in any frame, is never typed.
    const seen = {};
    (await run(true, [])).flatMap(r => r.result?.filled || []).forEach(f => { seen[f.key] = (seen[f.key] || 0) + 1; });
    res = await run(dry, Object.keys(seen).filter(k => seen[k] > 1));
  } catch (e) {
    out.textContent = 'Could not run on this tab: ' + e.message + '\nOpen the trainee page in this tab and try again.';
    return;
  }

  const all = res.flatMap(r => r.result?.filled || []);
  const filled = all.filter(f => !f.held), held = all.filter(f => f.held);
  const unmatched = res.flatMap(r => r.result?.unmatchedSite || []);
  const used = new Set(all.map(f => f.key));
  const unusedKeys = Object.keys(map).filter(k => !used.has(k));

  // Hints only (never filled): one name's words are contained in the other's.
  const hints = [];
  unmatched.forEach(site => {
    const sk = keyOf(site).split(' ');
    unusedKeys.forEach(k => {
      const ek = k.split(' ');
      const [small, big] = sk.length <= ek.length ? [sk, ek] : [ek, sk];
      if (small.length >= 2 && small.every(w => big.includes(w)))
        hints.push(site + '   ?=   ' + map[k].name);
    });
  });

  out.textContent =
    (dry ? '*** DRY RUN: nothing was typed ***\n' : '*** FILLED ***\n') +
    `Input read as ${source}: ${Object.keys(map).length} people found\n\n` +
    section('Matched', filled.map(f => f.text)) +
    section('On the site but NOT in your Excel selection', unmatched) +
    section('In Excel but NOT found on the site', unusedKeys.map(k => map[k].name)) +
    (hints.length ? section('Possible matches (NOT filled, check by hand)', hints) : '') +
    (held.length ? section('WARNING: name appears in more than one site row - NOT filled, red outline, fill by hand', held.map(f => f.text)) : '') +
    (dupExcel.length ? section('WARNING: name appears twice in Excel, last one used', dupExcel) : '') +
    (skipped.length ? section('Skipped pasted lines (no name or score)', skipped) : '');
};
