const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { TRACKS, GENERATIONS, hebNum, ranges, sefariaUrl } = require('./data');

const FAMILY_NAME = process.env.FAMILY_NAME || 'Kramer';
const FAMILY_CODE = process.env.FAMILY_CODE || '';
const PORT = process.env.PORT || 3000;
// Changes on every deploy so browsers fetch the new CSS/JS instead of a cached copy.
const ASSET_V = (process.env.RENDER_GIT_COMMIT || String(Date.now())).slice(0, 8);
const PROD = process.env.NODE_ENV === 'production';
// Family siyum target: first candle of Chanukah 5788, Friday Dec 24, 2027 (about sundown, New York time).
const SIYUM_DATE = new Date(process.env.SIYUM_DATE || '2027-12-24T16:30:00-05:00');
const SIYUM_LABEL = process.env.SIYUM_LABEL || 'Chanukah 5788 · Friday evening, December 24, 2027';

if (PROD && (!FAMILY_CODE || !process.env.SESSION_SECRET)) {
  console.error('FAMILY_CODE and SESSION_SECRET must be set.');
  process.exit(1);
}

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'"],
      formAction: ["'self'"],
    },
  },
}));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.get('/healthz', (req, res) => res.send('ok'));

app.use(session({
  store: new PgSession({ pool: db.pool, schemaName: db.SCHEMA, tableName: 'session', createTableIfMissing: false }),
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  name: 'kfs',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  // A device stays signed in to the family for a year; each person still enters their PIN.
  cookie: { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 365 * 24 * 3600 * 1000 },
}));

// Helpers available in every view
app.use((req, res, next) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(18).toString('hex');
  res.locals.csrf = req.session.csrf;
  res.locals.familyName = FAMILY_NAME;
  res.locals.v = ASSET_V;
  res.locals.me = null;
  res.locals.flash = req.session.flash || null;
  res.locals.hebNum = hebNum;
  const msLeft = Math.max(0, SIYUM_DATE - Date.now());
  res.locals.siyum = { iso: SIYUM_DATE.toISOString(), label: SIYUM_LABEL, days: Math.ceil(msLeft / 86400000) };
  delete req.session.flash;
  req.flash = (type, msg) => { req.session.flash = { type, msg }; };
  next();
});

// CSRF check on every form post
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const t = req.body && req.body._csrf;
  if (!t || t !== req.session.csrf) return res.status(403).send('This form expired. Go back, refresh the page and try again.');
  next();
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function requireFamily(req, res, next) {
  if (req.session.family) return next();
  res.redirect('/join');
}

const loadMe = wrap(async (req, res, next) => {
  res.locals.actingAdmin = null;
  // An admin "acting as" someone else: personId is that person, adminId is the admin.
  if (req.session.adminId) {
    const admin = await db.one('SELECT id, name, is_admin FROM people WHERE id = $1', [req.session.adminId]);
    if (!admin || !admin.is_admin) { delete req.session.adminId; delete req.session.personId; }
    else if (req.session.personId === admin.id) delete req.session.adminId;
    else { res.locals.actingAdmin = admin; req.actingAdmin = admin; }
  }
  if (req.session.personId) {
    const me = await db.one('SELECT id, name, generation, is_admin FROM people WHERE id = $1', [req.session.personId]);
    if (!me) { delete req.session.personId; if (req.actingAdmin) { req.session.personId = req.actingAdmin.id; delete req.session.adminId; return res.redirect('/admin'); } }
    res.locals.me = me;
    req.me = me;
  }
  next();
});

function requirePerson(req, res, next) {
  if (req.me) return next();
  res.redirect('/');
}
function requireAdmin(req, res, next) {
  if (req.me && req.me.is_admin) return next();
  res.status(403).send('Only a family admin can do that.');
}

const codeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: 'Too many tries. Wait 15 minutes and try again.' });
const pinLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: 'Too many PIN tries. Wait 15 minutes and try again.' });

function sameCode(a, b) {
  const x = Buffer.from(String(a).trim().toUpperCase());
  const y = Buffer.from(String(b).trim().toUpperCase());
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
const validPin = (p) => /^\d{4}$/.test(String(p || ''));
const cleanName = (n) => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 60);

// ---------- Family code ----------
app.get('/join', (req, res) => {
  if (req.session.family) return res.redirect('/');
  res.render('join', { error: null });
});
app.post('/join', codeLimiter, (req, res) => {
  if (FAMILY_CODE && sameCode(req.body.code || '', FAMILY_CODE)) {
    req.session.family = true;
    return res.redirect('/');
  }
  res.status(401).render('join', { error: 'That code didn’t match. Ask the family admin for the code.' });
});

app.use(requireFamily, loadMe);

// ---------- First-time setup: the first person becomes the admin ----------
app.get('/setup', wrap(async (req, res) => {
  const n = await db.one('SELECT count(*)::int AS n FROM people');
  if (n.n > 0) return res.redirect('/');
  res.render('setup', { generations: GENERATIONS, error: null });
}));
app.post('/setup', wrap(async (req, res) => {
  const n = await db.one('SELECT count(*)::int AS n FROM people');
  if (n.n > 0) return res.redirect('/');
  const name = cleanName(req.body.name);
  const gen = GENERATIONS.includes(req.body.generation) ? req.body.generation : GENERATIONS[0];
  if (!name || !validPin(req.body.pin)) {
    return res.render('setup', { generations: GENERATIONS, error: 'Enter your name and a 4-digit PIN.' });
  }
  const p = await db.one('INSERT INTO people (name, generation, pin_hash, is_admin) VALUES ($1,$2,$3,true) RETURNING id',
    [name, gen, await bcrypt.hash(req.body.pin, 10)]);
  req.session.personId = p.id;
  req.flash('ok', 'You’re set up as the family admin. Add everyone else from the Admin page.');
  res.redirect('/admin');
}));

// ---------- Who's learning ----------
async function summaries() {
  const rows = await db.many(`SELECT person_id, track, masechta, array_agg(unit ORDER BY unit) AS units,
      count(learned_at)::int AS learned FROM claims GROUP BY person_id, track, masechta ORDER BY min(claimed_at)`);
  const by = {};
  for (const r of rows) {
    const t = TRACKS[r.track]; const x = t.byKey[r.masechta]; if (!x) continue;
    const label = (r.track === 'm' ? 'Mishnayos ' : '') + x.name;
    const what = r.units.length === x.count ? `${label} · whole` : `${label} ${r.track === 'm' ? 'perek ' : ''}${ranges(r.units)}`;
    (by[r.person_id] = by[r.person_id] || []).push({ what, done: r.learned, of: r.units.length, unitsWord: t.many });
  }
  return by;
}

app.get('/', wrap(async (req, res) => {
  const people = await db.many('SELECT id, name, generation, is_admin FROM people ORDER BY created_at, id');
  if (!people.length) return res.redirect('/setup');
  const sums = await summaries();
  const groups = GENERATIONS.map((g) => ({ label: g, people: people.filter((p) => p.generation === g) })).filter((g) => g.people.length);
  const totals = await trackTotals();
  res.render('who', { groups, sums, totals, countdown: { totals } });
}));

app.get('/pin/:id', wrap(async (req, res) => {
  const person = await db.one('SELECT id, name FROM people WHERE id = $1', [req.params.id]);
  if (!person) return res.redirect('/');
  res.render('pin', { person, error: null });
}));
app.post('/pin/:id', pinLimiter, wrap(async (req, res) => {
  const person = await db.one('SELECT id, name, pin_hash FROM people WHERE id = $1', [req.params.id]);
  if (!person) return res.redirect('/');
  if (validPin(req.body.pin) && await bcrypt.compare(req.body.pin, person.pin_hash)) {
    req.session.personId = person.id;
    return res.redirect('/plan');
  }
  res.status(401).render('pin', { person, error: 'Wrong PIN. Try again.' });
}));
app.post('/switch', (req, res) => { delete req.session.personId; delete req.session.adminId; res.redirect('/'); });

// Admin: pick and mark for someone else, without their PIN.
app.post('/admin/people/:id/act', requirePerson, requireAdmin, wrap(async (req, res) => {
  const p = await db.one('SELECT id, name FROM people WHERE id = $1', [req.params.id]);
  if (!p) return res.redirect('/admin');
  if (p.id === req.me.id) return res.redirect('/plan');
  req.session.adminId = req.me.id;
  req.session.personId = p.id;
  req.flash('ok', `You're now picking for ${p.name}. Everything you take or mark goes on ${p.name}'s plan.`);
  res.redirect('/learn');
}));
app.post('/admin/return', (req, res) => {
  if (req.session.adminId) { req.session.personId = req.session.adminId; delete req.session.adminId; }
  res.redirect('/admin');
});

// ---------- Learn: pick a whole masechta or some units ----------
app.get('/learn', requirePerson, wrap(async (req, res) => {
  const t = TRACKS[req.query.track] || TRACKS.g;
  let s = parseInt(req.query.s, 10); if (!(s >= 0 && s < t.sedarim.length)) s = t.key === 'g' ? 1 : 0;
  const seder = t.sedarim[s];
  const x = (req.query.m && t.byKey[req.query.m] && t.byKey[req.query.m].seder === s) ? t.byKey[req.query.m] : seder.masechtos[0];

  const counts = await db.many('SELECT masechta, count(*)::int AS n FROM claims WHERE track = $1 GROUP BY masechta', [t.key]);
  const takenCount = Object.fromEntries(counts.map((c) => [c.masechta, c.n]));
  const claimed = await db.many(`SELECT c.unit, c.person_id, p.name FROM claims c JOIN people p ON p.id = c.person_id
    WHERE c.track = $1 AND c.masechta = $2`, [t.key, x.key]);
  const owner = Object.fromEntries(claimed.map((c) => [c.unit, c]));
  const units = [];
  for (let u = t.first; u <= x.last; u++) units.push({ n: u, label: hebNum(u), owner: owner[u] || null });
  const free = units.filter((u) => !u.owner).length;
  res.render('learn', { t, tracks: TRACKS, s, seder, x, units, free, takenCount });
}));

app.post('/claim', requirePerson, wrap(async (req, res) => {
  const t = TRACKS[req.body.track]; const x = t && t.byKey[req.body.masechta];
  if (!x) return res.redirect('/learn');
  let wanted = [];
  if (req.body.mode === 'whole') {
    const taken = new Set((await db.many('SELECT unit FROM claims WHERE track = $1 AND masechta = $2', [t.key, x.key])).map((r) => r.unit));
    for (let u = t.first; u <= x.last; u++) if (!taken.has(u)) wanted.push(u);
  } else {
    const raw = [].concat(req.body.units || []);
    wanted = [...new Set(raw.map((v) => parseInt(v, 10)).filter((u) => u >= t.first && u <= x.last))];
  }
  const back = `/learn?track=${t.key}&s=${x.seder}&m=${x.key}`;
  if (!wanted.length) {
    req.flash('err', req.body.mode === 'whole' ? 'Everything here is already taken.' : `Tap at least one ${t.one} first.`);
    return res.redirect(back);
  }
  const r = await db.pool.query(`INSERT INTO claims (track, masechta, unit, person_id)
    SELECT $1, $2, u, $3 FROM unnest($4::int[]) AS u ON CONFLICT DO NOTHING`, [t.key, x.key, req.me.id, wanted]);
  const label = (t.key === 'm' ? 'Mishnayos ' : '') + x.name;
  const got = r.rowCount;
  if (got === 0) req.flash('err', 'Someone else already took those. Pick others.');
  else if (got < wanted.length) req.flash('ok', `Added ${got} ${got === 1 ? t.one : t.many} of ${label}. ${wanted.length - got} were just taken by someone else.`);
  else if (req.body.mode === 'whole') req.flash('ok', got === x.count ? `You took all of ${label}. Hatzlacha!` : `You took the remaining ${got} ${got === 1 ? t.one : t.many} of ${label}. Hatzlacha!`);
  else req.flash('ok', `Added ${got} ${got === 1 ? t.one : t.many} of ${label} to your plan.`);
  res.redirect(back);
}));

// ---------- My plan ----------
app.get('/plan', requirePerson, wrap(async (req, res) => {
  const rows = await db.many(`SELECT track, masechta, unit, learned_at FROM claims WHERE person_id = $1 ORDER BY track, masechta, unit`, [req.me.id]);
  const groups = [];
  const idx = {};
  for (const r of rows) {
    const t = TRACKS[r.track]; const x = t.byKey[r.masechta]; if (!x) continue;
    const k = r.track + ':' + r.masechta;
    if (!idx[k]) {
      idx[k] = { t, x, label: (r.track === 'm' ? 'Mishnayos ' : '') + x.name, units: [] };
      groups.push(idx[k]);
    }
    idx[k].units.push({ n: r.unit, label: hebNum(r.unit), learned: !!r.learned_at, url: sefariaUrl(r.track, x, r.unit) });
  }
  // Gemara first, then by order in Shas
  groups.sort((a, b) => (a.t.key === b.t.key ? 0 : a.t.key === 'g' ? -1 : 1) || a.x.seder - b.x.seder
    || a.t.sedarim[a.x.seder].masechtos.indexOf(a.x) - b.t.sedarim[b.x.seder].masechtos.indexOf(b.x));
  for (const g of groups) {
    g.done = g.units.filter((u) => u.learned).length;
    g.whole = g.units.length === g.x.count;
    g.range = ranges(g.units.map((u) => u.n));
  }
  let next = null;
  for (const g of groups) { const u = g.units.find((v) => !v.learned); if (u) { next = { g, u }; break; } }
  res.render('plan', { groups, next });
}));

app.post('/learned', requirePerson, wrap(async (req, res) => {
  const t = TRACKS[req.body.track];
  if (t) {
    await db.pool.query(`UPDATE claims SET learned_at = ${req.body.learned === '1' ? 'now()' : 'NULL'}
      WHERE track = $1 AND masechta = $2 AND unit = $3 AND person_id = $4`,
    [t.key, req.body.masechta, parseInt(req.body.unit, 10), req.me.id]);
  }
  res.redirect('/plan' + (req.body.anchor ? '#' + encodeURIComponent(req.body.anchor) : ''));
}));

app.post('/release', requirePerson, wrap(async (req, res) => {
  const t = TRACKS[req.body.track];
  if (t) {
    const params = [t.key, req.body.masechta, req.me.id];
    let sql = 'DELETE FROM claims WHERE track = $1 AND masechta = $2 AND person_id = $3 AND learned_at IS NULL';
    if (req.body.unit) { sql += ' AND unit = $4'; params.push(parseInt(req.body.unit, 10)); }
    const r = await db.pool.query(sql, params);
    req.flash('ok', r.rowCount ? `Gave back ${r.rowCount} so someone else can take ${r.rowCount === 1 ? 'it' : 'them'}. (Anything you already learned stays yours.)` : 'Nothing to give back. Learned ones stay yours.');
  }
  res.redirect('/plan');
}));

// ---------- Family siyum board ----------
async function trackTotals() {
  const rows = await db.many('SELECT track, count(*)::int AS taken, count(learned_at)::int AS learned FROM claims GROUP BY track');
  const out = {};
  for (const t of Object.values(TRACKS)) {
    const r = rows.find((v) => v.track === t.key) || { taken: 0, learned: 0 };
    out[t.key] = { total: t.total, taken: r.taken, learned: r.learned };
  }
  return out;
}

app.get('/board', wrap(async (req, res) => {
  const rows = await db.many('SELECT track, masechta, count(*)::int AS taken, count(learned_at)::int AS learned FROM claims GROUP BY track, masechta');
  const boards = Object.values(TRACKS).map((t) => {
    const sedarim = t.sedarim.map((s) => {
      let taken = 0, learned = 0;
      for (const x of s.masechtos) {
        const r = rows.find((v) => v.track === t.key && v.masechta === x.key);
        if (r) { taken += r.taken; learned += r.learned; }
      }
      return { name: s.name, heb: s.heb, total: s.total, taken, learned };
    });
    const taken = sedarim.reduce((a, s) => a + s.taken, 0);
    const learned = sedarim.reduce((a, s) => a + s.learned, 0);
    return { t, sedarim, total: t.total, taken, learned };
  });
  const people = await db.many('SELECT id, name, generation FROM people ORDER BY created_at, id');
  const sums = await summaries();
  const cdTotals = {};
  for (const b of boards) cdTotals[b.t.key] = { total: b.total, taken: b.taken, learned: b.learned };
  res.render('board', { boards, people, sums, countdown: { totals: cdTotals } });
}));

// ---------- Admin ----------
app.get('/admin', requirePerson, requireAdmin, wrap(async (req, res) => {
  const people = await db.many(`SELECT p.id, p.name, p.generation, p.is_admin, count(c.unit)::int AS units
    FROM people p LEFT JOIN claims c ON c.person_id = p.id GROUP BY p.id ORDER BY p.created_at, p.id`);
  res.render('admin', { people, generations: GENERATIONS });
}));
app.post('/admin/people', requirePerson, requireAdmin, wrap(async (req, res) => {
  const name = cleanName(req.body.name);
  const gen = GENERATIONS.includes(req.body.generation) ? req.body.generation : GENERATIONS[1];
  if (!name || !validPin(req.body.pin)) { req.flash('err', 'Enter a name and a 4-digit PIN.'); return res.redirect('/admin'); }
  await db.pool.query('INSERT INTO people (name, generation, pin_hash, is_admin) VALUES ($1,$2,$3,$4)',
    [name, gen, await bcrypt.hash(req.body.pin, 10), req.body.is_admin === '1']);
  req.flash('ok', `Added ${name}. Their PIN is ${req.body.pin} — tell them privately.`);
  res.redirect('/admin');
}));
app.post('/admin/people/:id/pin', requirePerson, requireAdmin, wrap(async (req, res) => {
  if (!validPin(req.body.pin)) { req.flash('err', 'The PIN must be 4 digits.'); return res.redirect('/admin'); }
  const p = await db.one('UPDATE people SET pin_hash = $1 WHERE id = $2 RETURNING name', [await bcrypt.hash(req.body.pin, 10), req.params.id]);
  if (p) req.flash('ok', `${p.name}'s new PIN is ${req.body.pin}.`);
  res.redirect('/admin');
}));
app.post('/admin/people/:id/edit', requirePerson, requireAdmin, wrap(async (req, res) => {
  const name = cleanName(req.body.name);
  const gen = GENERATIONS.includes(req.body.generation) ? req.body.generation : null;
  if (name && gen) await db.pool.query('UPDATE people SET name = $1, generation = $2 WHERE id = $3', [name, gen, req.params.id]);
  res.redirect('/admin');
}));
app.post('/admin/people/:id/admin', requirePerson, requireAdmin, wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.me.id) { req.flash('err', 'You can’t remove your own admin access.'); return res.redirect('/admin'); }
  await db.pool.query('UPDATE people SET is_admin = NOT is_admin WHERE id = $1', [id]);
  res.redirect('/admin');
}));
app.post('/admin/people/:id/delete', requirePerson, requireAdmin, wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.me.id) { req.flash('err', 'You can’t remove yourself.'); return res.redirect('/admin'); }
  const p = await db.one('DELETE FROM people WHERE id = $1 RETURNING name', [id]);
  if (p) req.flash('ok', `Removed ${p.name}. Everything they had taken is open again.`);
  res.redirect('/admin');
}));

app.use((req, res) => res.status(404).send('Page not found. <a href="/">Go home</a>'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong. Go back and try again.');
});

db.migrate()
  .then(() => app.listen(PORT, () => console.log(`Kramer Family Shas on :${PORT}`)))
  .catch((e) => { console.error('Database setup failed:', e); process.exit(1); });

module.exports = app;
