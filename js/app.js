import { createStore } from './store.js';

/* ================================================================ helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const ICONS = {
  menu: '<path d="M4 12h16M4 6h16M4 18h16"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  squareCheck: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const GOOGLE = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const STROKES = `<svg class="strokes" viewBox="0 0 150 88" aria-hidden="true"><defs><linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="0"><stop offset="0" stop-color="#CFD8F7"/><stop offset=".55" stop-color="#E9C3EC"/><stop offset="1" stop-color="#F4B6D8"/></linearGradient></defs><g stroke="url(#sg)" stroke-width="6" stroke-linecap="round">${[0, 1, 2, 3, 4].map(i => `<line x1="${6 + i * 27}" y1="82" x2="${32 + i * 27}" y2="6"/>`).join('')}</g></svg>`;

const PRI = { urgent: 'Urgent', normal: 'Normal', low: 'Low' };
const PRI_ORDER = { urgent: 0, normal: 1, low: 2 };
const STATUS = { todo: 'Not started', started: 'Started', done: 'Completed' };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const todayISO = () => iso(new Date());
const fmtTime = t => { const [h, m] = t.split(':').map(Number); const hh = h % 12 || 12; return `${hh}${m ? ':' + pad(m) : ''}${h < 12 ? 'am' : 'pm'}`; };
const fmtDue = t => {
  if (!t.due) return 'No date';
  const d = parseISO(t.due);
  return `${d.getDate()} ${MON[d.getMonth()]}${t.dueTime ? ', ' + fmtTime(t.dueTime) : ''}`;
};
const fmtStamp = ms => { const d = new Date(ms); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}, ${fmtTime(`${d.getHours()}:${d.getMinutes()}`)}`; };
function ago(ms) {
  const s = (Date.now() - ms) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 172800) return 'Yesterday';
  const d = new Date(ms); return `${d.getDate()} ${MON[d.getMonth()]}`;
}
const initial = name => esc((name || '?').trim().charAt(0).toUpperCase() || '?');
const avatar = (name, photo, cls = '') => `<span class="avatar ${cls}" aria-hidden="true">${photo ? `<img src="${esc(photo)}" alt="" referrerpolicy="no-referrer">` : initial(name)}</span>`;

function toast(msg) {
  $$('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
function friendly(e) {
  const code = e && (e.code || '');
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'You no longer have access to this task';
  if (code === 'unavailable') return 'You are offline — changes will sync when you reconnect';
  return (e && e.message) || 'Something went wrong';
}
const run = p => Promise.resolve(p).catch(e => { console.error(e); toast(friendly(e)); throw e; });

/* ================================================================ state */
const S = {
  store: null,
  authReady: false,
  user: null,
  profile: { name: '', role: '', bookmarks: [] },
  tasks: [],
  tasksLoaded: false,
  sel: todayISO(),
  view: 'all',
  calMonth: (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(),
  watchers: [],
  detail: null, // { id, task, atts, loaded, err, tab, expanded, unsubs }
  share: null,  // { id, task, state }
  authMode: 'signin',
  lastKey: '',
};
const VIEWS = {
  all: { label: 'All tasks', icon: 'list' },
  bookmarked: { label: 'Bookmarked', icon: 'bookmark', test: t => S.profile.bookmarks.includes(t.id) },
  shared: { label: 'Shared with me', icon: 'users', test: t => t.owner !== S.user.uid },
  sharing: { label: 'Shared by me', icon: 'link', test: t => t.owner === S.user.uid && t.visibility === 'link' },
  private: { label: 'Private', icon: 'lock', test: t => t.owner === S.user.uid && t.visibility !== 'link' },
  done: { label: 'Completed', icon: 'squareCheck', test: t => t.status === 'done' },
};
const isMine = t => t && S.user && t.owner === S.user.uid;
const myName = () => S.profile.name || (S.user && S.user.name) || 'You';

function sortTasks(list) {
  return [...list].sort((a, b) =>
    (a.status === 'done') - (b.status === 'done') ||
    (PRI_ORDER[a.priority] ?? 1) - (PRI_ORDER[b.priority] ?? 1) ||
    (a.due || '9999').localeCompare(b.due || '9999') ||
    (a.dueTime || '99').localeCompare(b.dueTime || '99') ||
    (b.createdAt || 0) - (a.createdAt || 0));
}
function tasksForDay(day) {
  const today = todayISO();
  return S.tasks.filter(t => {
    if (t.due === day) return true;
    if (day !== today) return false;
    if (t.due && t.due < today) return t.status !== 'done';          // overdue carries over to today
    if (!t.due) return t.status !== 'done' || iso(new Date(t.updatedAt || 0)) === today;
    return false;
  });
}

/* ================================================================ routing */
const parseRoute = () => { const [name = '', id] = location.hash.replace(/^#\/?/, '').split('/'); return { name, id: id && decodeURIComponent(id) }; };
const go = (hash, replace) => { if (replace) { history.replaceState(null, '', hash); render(); } else location.hash = hash; };
const onboarded = () => { try { return localStorage.getItem('tm.onboarded') === '1'; } catch { return true; } };

function render() {
  const app = $('#app');
  if (!S.authReady) { app.innerHTML = '<div class="boot"><div class="spinner" role="status" aria-label="Loading"></div></div>'; return; }
  const r = parseRoute();

  if (r.name !== 'task' && S.detail) closeDetail();
  if (r.name !== 'share') S.share = null;

  if (!S.user) {
    if (r.name === 'share' && r.id) { try { sessionStorage.setItem('tm.pendingShare', r.id); } catch {} return paint('auth', () => renderAuth(r.id)); }
    if (r.name === 'auth' || (onboarded() && r.name !== 'welcome')) return paint('auth', () => renderAuth());
    return paint('welcome', renderWelcome);
  }
  switch (r.name) {
    case 'calendar': return paint('cal', () => renderHome('calendar'));
    case 'task': return r.id ? paint('task:' + r.id, () => renderDetail(r.id)) : go('#/today', true);
    case 'share': return r.id ? paint('share:' + r.id, () => renderShareLanding(r.id)) : go('#/today', true);
    case 'today': return paint(`today:${S.view}:${S.sel}`, () => renderHome('today'));
    default: return go('#/today', true);
  }
}
function paint(key, html) {
  const app = $('#app');
  const fresh = key !== S.lastKey;
  S.animate = fresh;
  app.innerHTML = html();
  if (fresh) { S.lastKey = key; if (!key.startsWith('today') && !key.startsWith('cal')) window.scrollTo(0, 0); }
  S.animate = false;
}

/* ================================================================ auth / data wiring */
function onAuthChanged(u) {
  S.watchers.forEach(f => f && f()); S.watchers = [];
  S.user = u; S.tasks = []; S.tasksLoaded = false;
  S.profile = { name: u ? u.name : '', role: '', bookmarks: [] };
  S.authReady = true;
  if (u) {
    S.watchers.push(S.store.watchProfile(p => { S.profile = p; render(); }));
    S.watchers.push(S.store.watchTasks(list => { S.tasks = list; S.tasksLoaded = true; render(); }, e => { console.error(e); if (!S.deleting) toast(friendly(e)); }));
    S.store.importLegacy().then(n => n && toast(`Imported ${n} task${n > 1 ? 's' : ''} from the old app`)).catch(() => {});
    let pending = null; try { pending = sessionStorage.getItem('tm.pendingShare'); sessionStorage.removeItem('tm.pendingShare'); } catch {}
    const r = parseRoute();
    if (pending && !(r.name === 'share' && r.id === pending)) return go('#/share/' + encodeURIComponent(pending), true);
    if (r.name === 'welcome' || r.name === 'auth' || !r.name) return go('#/today', true);
  }
  render();
}

/* ================================================================ screens */
function renderWelcome() {
  return `<section class="screen onboard">
    ${STROKES}
    <div class="stack">
      <h1 class="display">Keep track of<br><strong class="text-g-button">your tasks</strong></h1>
      <p class="sub">A reliable place to store your tasks and plan your day.</p>
    </div>
    <button class="btn-primary" data-act="start">Start</button>
  </section>`;
}

function renderAuth(shareId) {
  const local = S.store.mode === 'local';
  const signup = S.authMode === 'signup';
  const ctx = shareId ? `<div class="notice">${ic('link')}<div>Someone shared a task with you. ${local ? 'Sharing needs cloud sync, which isn’t set up in this copy of the app.' : 'Sign in to add it to your tasks.'}</div></div>` : '';
  if (local) {
    return `<section class="screen auth">
      ${STROKES}
      <div class="stack" style="display:flex;flex-direction:column;gap:12px">
        <h1 class="display" style="font-size:38px;line-height:42px">What should we<br><strong class="text-g-button">call you?</strong></h1>
        <p class="sub" style="color:#A6A6AE;margin:0">Your tasks are saved on this device.</p>
      </div>
      ${ctx}
      <form id="local-form" class="stack" style="display:flex;flex-direction:column;gap:12px">
        <div class="field"><label for="ln">Your name</label><input id="ln" class="input" required maxlength="40" autocomplete="name" placeholder="e.g. Alina Petrenko"></div>
        <div class="field"><label for="lr">Role (optional)</label><input id="lr" class="input" maxlength="40" placeholder="e.g. Designer"></div>
        <button class="btn-primary" type="submit" style="margin-top:8px">Continue</button>
      </form>
      <div class="notice">${ic('info')}<div>Running in <b>local mode</b>. Add your Firebase keys (see SETUP.md) to turn on accounts, share links and live sync.</div></div>
    </section>`;
  }
  return `<section class="screen auth">
    ${STROKES}
    <div style="display:flex;flex-direction:column;gap:12px">
      <h1 class="display" style="font-size:38px;line-height:42px">${signup ? 'Create your' : 'Welcome'}<br><strong class="text-g-button">${signup ? 'account' : 'back'}</strong></h1>
      <p style="color:#A6A6AE;margin:0">Sign in to sync your tasks and share them with others.</p>
    </div>
    ${ctx}
    <button class="btn-white" data-act="google">${GOOGLE} Continue with Google</button>
    <div class="divider">or with email</div>
    <form id="auth-form" style="display:flex;flex-direction:column;gap:12px" novalidate>
      ${signup ? '<div class="field"><label for="an">Name</label><input id="an" class="input" required maxlength="40" autocomplete="name" placeholder="Your name"></div>' : ''}
      <div class="field"><label for="ae">Email</label><input id="ae" class="input" type="email" required autocomplete="email" placeholder="you@example.com"></div>
      <div class="field"><label for="ap">Password</label><input id="ap" class="input" type="password" required minlength="6" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="At least 6 characters"></div>
      <p class="form-error" id="auth-err" role="alert"></p>
      <button class="btn-primary" type="submit">${signup ? 'Create account' : 'Sign in'}</button>
    </form>
    <button class="link-btn" data-act="auth-toggle" style="align-self:center;min-height:44px">${signup ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
    <p class="caption" style="text-align:center;margin:-12px 0 0">By continuing you agree to the <a href="privacy.html" target="_blank" rel="noopener" style="color:#C9B8FF">Privacy policy</a>.</p>
  </section>`;
}

function headerHTML() {
  const name = myName();
  const role = S.profile.role || (S.store.mode === 'local' ? 'Local only' : 'Add your role');
  return `<div class="topbar">
    <button class="icon-btn" data-act="menu" aria-label="Open menu">${ic('menu')}</button>
    <button class="who" data-act="profile" aria-label="Edit profile">
      <span style="min-width:0"><span class="name" style="display:block">${esc(name)}</span><span class="role" style="display:block">${esc(role)}</span></span>
      ${avatar(name, S.user.photo)}
    </button>
  </div>`;
}

function navHTML(active) {
  return `<nav class="bottom-nav" aria-label="Main">
    <a class="nav-item" href="#/today" aria-label="Tasks" ${active === 'today' ? 'aria-current="page"' : ''}>${ic('squareCheck')}</a>
    <button class="fab" data-act="add" aria-label="Add task">${ic('plus')}</button>
    <a class="nav-item" href="#/calendar" aria-label="Calendar" ${active === 'calendar' ? 'aria-current="page"' : ''}>${ic('calendar')}</a>
  </nav>`;
}

function cardHTML(t, i = 0, opts = {}) {
  const done = t.status === 'done';
  const bm = S.profile.bookmarks.includes(t.id);
  const subs = t.subtasks || [];
  const sd = subs.filter(s => s.done).length;
  const pri = PRI[t.priority] ? t.priority : 'normal';
  const shared = t.visibility === 'link';
  const anim = S.animate ? ` anim-in" style="animation-delay:${Math.min(i, 8) * 50}ms` : '';
  return `<article class="card ${pri}${done ? ' done' : ''}${anim}">
    <div class="row1">
      <div class="chips"><span class="chip">${PRI[pri]}</span>${shared ? `<span class="chip">${ic(isMine(t) ? 'link' : 'users')}${isMine(t) ? 'Shared' : 'With you'}</span>` : ''}</div>
      ${opts.preview ? '' : `<div class="actions">
        <button class="card-check" data-act="toggle-done" data-id="${t.id}" aria-pressed="${done}" aria-label="${done ? 'Mark as not done' : 'Mark as done'}">${ic('check')}</button>
        <button class="icon-btn sm on-grad" data-act="bookmark" data-id="${t.id}" aria-pressed="${bm}" aria-label="${bm ? 'Remove bookmark' : 'Bookmark'}">${ic('bookmark', 'bm')}</button>
      </div>`}
    </div>
    <div>
      <div class="project">${esc(t.project || 'No project')}</div>
      <h3 class="title">${opts.preview ? esc(t.title) : `<a class="stretch" href="#/task/${encodeURIComponent(t.id)}">${esc(t.title)}</a>`}</h3>
    </div>
    <div class="meta">
      <div><span class="lbl">Status</span><span class="val">${STATUS[t.status] || STATUS.todo}</span></div>
      <div><span class="lbl">Priority</span><span class="val">${PRI[pri]}</span></div>
      <div><span class="lbl">Due to</span><span class="val">${fmtDue(t)}</span></div>
    </div>
    ${subs.length ? `<div class="progress" role="img" aria-label="${sd} of ${subs.length} subtasks done"><i style="width:${(sd / subs.length) * 100}%"></i></div>` : ''}
  </article>`;
}

function listHTML(list, emptyTitle, emptyText) {
  if (!S.tasksLoaded) return '<div class="empty"><div class="spinner"></div></div>';
  if (!list.length) return `<div class="empty"><div class="art">${ic('inbox')}</div><b>${emptyTitle}</b><span>${emptyText}</span></div>`;
  return sortTasks(list).map((t, i) => cardHTML(t, i)).join('');
}

function dateStrip() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sel = parseISO(S.sel);
  let start = addDays(today, -1);
  const diff = Math.round((sel - start) / 864e5);
  if (diff < 0 || diff > 5) start = addDays(sel, -1);
  const dueSet = new Set(S.tasks.filter(t => t.status !== 'done').map(t => t.due));
  let html = '';
  for (let i = 0; i < 6; i++) {
    const d = addDays(start, i); const k = iso(d);
    html += `<button class="date-pill" data-act="pick-day" data-day="${k}" aria-pressed="${k === S.sel}" aria-label="${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}${k === todayISO() ? ', today' : ''}">
      <span class="n">${d.getDate()}</span><span class="d">${DOW[d.getDay()]}</span>${dueSet.has(k) ? '<i class="dot"></i>' : ''}</button>`;
  }
  return `<div class="date-strip" role="group" aria-label="Choose day">${html}</div>`;
}

function renderHome(kind) {
  let body;
  if (kind === 'calendar') {
    const d = parseISO(S.sel);
    body = `<h1 class="h1">Calendar</h1>${calendarHTML()}
      <div class="list-head">${S.sel === todayISO() ? 'Today' : `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`}</div>
      <div class="task-list">${listHTML(S.tasks.filter(t => t.due === S.sel), 'Nothing due', 'Tap + to plan something for this day.')}</div>`;
  } else if (S.view !== 'all') {
    const v = VIEWS[S.view];
    body = `<div class="title-row"><h1 class="h1">${v.label}</h1><button class="chip dark" data-act="clear-view" style="height:32px">${ic('x')} Clear</button></div>
      <div class="task-list">${listHTML(S.tasks.filter(v.test), `No ${v.label.toLowerCase()} tasks`, 'Tasks will show up here.')}</div>`;
  } else {
    const isToday = S.sel === todayISO();
    const d = parseISO(S.sel);
    const title = isToday ? 'Your tasks for today' : `Your tasks for ${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
    body = `<h1 class="h1">${title}</h1>${dateStrip()}
      <div class="task-list">${listHTML(tasksForDay(S.sel), isToday ? 'You’re all clear' : 'Nothing planned', 'Tap + to add a task.')}</div>`;
  }
  return `<section class="screen home">${headerHTML()}${body}</section>${navHTML(kind)}`;
}

function calendarHTML() {
  const m = S.calMonth;
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const start = addDays(first, -lead);
  const byDay = {};
  S.tasks.forEach(t => { if (t.due) (byDay[t.due] = byDay[t.due] || []).push(t); });
  const today = todayISO();
  let cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="dow">${d}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i); const k = iso(d);
    if (i === 35 && d.getMonth() !== m.getMonth()) break; // drop a 6th row that is entirely next month
    const ts = (byDay[k] || []).filter(t => t.status !== 'done');
    const pris = [...new Set(ts.map(t => t.priority))].slice(0, 3);
    cells += `<button class="cal-day${d.getMonth() !== m.getMonth() ? ' out' : ''}${k === today ? ' today' : ''}" data-act="pick-day" data-day="${k}" aria-pressed="${k === S.sel}" aria-label="${d.getDate()} ${MONTHS[d.getMonth()]}${ts.length ? `, ${ts.length} open tasks` : ''}">
      ${d.getDate()}<span class="dots">${pris.map(p => `<i class="dot-${p}"></i>`).join('')}</span></button>`;
  }
  return `<div class="cal">
    <div class="cal-head">
      <button class="icon-btn" data-act="month" data-d="-1" aria-label="Previous month">${ic('chevronLeft')}</button>
      <b style="font-size:16px">${MONTHS[m.getMonth()]} ${m.getFullYear()}</b>
      <button class="icon-btn" data-act="month" data-d="1" aria-label="Next month">${ic('chevronRight')}</button>
    </div>
    <div class="cal-grid">${cells}</div>
  </div>`;
}

/* ---------------------------------------------------------------- task detail */
function openDetail(id) {
  closeDetail();
  const D = S.detail = { id, task: null, atts: [], loaded: false, err: null, tab: 'desc', expanded: false, unsubs: [] };
  let sync = true; // the local store answers synchronously; don't re-render mid-render
  const refresh = () => { if (!sync && S.detail === D) refreshDetail(); };
  D.unsubs.push(S.store.watchTask(id, t => { D.task = t; D.loaded = true; D.err = null; refresh(); },
    e => { D.err = e; D.loaded = true; refresh(); }));
  D.unsubs.push(S.store.watchAttachments(id, a => { D.atts = a; refresh(); }));
  sync = false;
}
function closeDetail() { if (S.detail) { S.detail.unsubs.forEach(f => f && f()); S.detail = null; } }
function refreshDetail() { const r = parseRoute(); if (r.name === 'task') render(); }

function renderDetail(id) {
  if (!S.detail || S.detail.id !== id) openDetail(id);
  const D = S.detail;
  if (!D.loaded) return '<div class="boot"><div class="spinner" role="status" aria-label="Loading task"></div></div>';
  const t = D.task;
  if (!t || D.err) {
    return `<section class="screen share-land">
      <div class="empty"><div class="art">${ic('lock')}</div><b>Task not available</b><span>It was deleted, or the owner made it private.</span></div>
      <a class="btn-primary" href="#/today">Back to my tasks</a></section>`;
  }
  const bm = S.profile.bookmarks.includes(t.id);
  const members = t.members || [];
  const people = [{ uid: t.owner, name: t.ownerName }, ...members.map(u => ({ uid: u, name: (t.memberInfo || {})[u]?.name || 'Someone' }))];
  const btn = t.status === 'todo' ? 'Start' : t.status === 'started' ? 'Complete' : 'Reopen';
  const ownerLabel = isMine(t) ? `${esc(t.ownerName)} (you)` : esc(t.ownerName);
  const live = t.visibility === 'link' && S.store.mode === 'cloud';
  const tab = D.tab;
  return `<div class="detail screen">
    <header class="detail-head">
      <div class="bar">
        <button class="icon-btn on-grad" data-act="back" aria-label="Back">${ic('chevronLeft')}</button>
        <div class="t">Task</div>
        <div class="r">
          <button class="icon-btn on-grad" data-act="share" aria-label="Share task">${ic('share')}</button>
          <button class="icon-btn on-grad" data-act="bookmark" data-id="${t.id}" aria-pressed="${bm}" aria-label="${bm ? 'Remove bookmark' : 'Bookmark'}">${ic('bookmark', 'bm')}</button>
        </div>
      </div>
      <div>
        <div class="project">${esc(t.project || 'No project')}
          <span class="chip">${ic(t.visibility === 'link' ? 'link' : 'lock')}${t.visibility === 'link' ? 'Shared via link' : 'Private'}</span>
          ${live ? '<span class="live"><i></i>Live</span>' : ''}</div>
        <h1 class="title">${esc(t.title)}</h1>
      </div>
      <div class="meta">
        <div><span class="lbl">Status</span><span class="val">${STATUS[t.status] || STATUS.todo}</span></div>
        <div><span class="lbl">Priority</span><span class="val">${PRI[t.priority] || 'Normal'}</span></div>
        <div><span class="lbl">Due to</span><span class="val">${fmtDue(t)}</span></div>
      </div>
      <div class="assign">
        ${people.length > 1
          ? `<button class="who2" data-act="share" aria-label="See who has access"><span class="avatar-stack">${people.slice(0, 3).map(p => avatar(p.name, null, 'ink')).join('')}</span>
              <span style="min-width:0;text-align:left"><span class="lbl">Shared with</span><span class="nm">${people.length} people</span></span></button>`
          : `<div class="who2">${avatar(t.ownerName, null, 'ink')}<span style="min-width:0"><span class="lbl">Assigned to</span><span class="nm">${ownerLabel}</span></span></div>`}
        <button class="btn-dark" data-act="advance">${btn}</button>
      </div>
    </header>
    <section class="sheet-panel">
      <div class="tabs" role="tablist" aria-label="Task sections">
        <span class="tab-pill" style="width:calc(50% - 4px);transform:translateX(${tab === 'desc' ? 0 : 100}%)"></span>
        <button role="tab" id="tab-desc" aria-controls="tabbody" aria-selected="${tab === 'desc'}" data-act="tab" data-tab="desc">Description</button>
        <button role="tab" id="tab-act" aria-controls="tabbody" aria-selected="${tab === 'act'}" data-act="tab" data-tab="act">Activity</button>
      </div>
      <div id="tabbody" role="tabpanel" aria-labelledby="${tab === 'desc' ? 'tab-desc' : 'tab-act'}" style="display:flex;flex-direction:column;gap:22px">${detailBody(t)}</div>
    </section>
  </div>`;
}

function detailBody(t) {
  const D = S.detail;
  if (D.tab === 'act') {
    const items = [...(t.activity || [])].reverse();
    if (!items.length) return '<p class="desc">No activity yet.</p>';
    return `<div class="timeline">${items.map(a => `<div class="tl-item"><span class="tl-dot"></span><div><div class="ev">${esc(a.text)}</div><div class="tm">${esc(a.by)} · ${ago(a.at)}</div></div></div>`).join('')}</div>`;
  }
  const desc = (t.description || '').trim();
  const long = desc.length > 180 || desc.split('\n').length > 4;
  const subs = t.subtasks || [];
  const sd = subs.filter(s => s.done).length;
  const atts = D.atts;
  return `<section>
      <h2 class="section-title">Description</h2>
      <p class="desc${long && !D.expanded ? ' clamp' : ''}">${desc ? esc(desc) : '<span style="color:var(--muted)">No description yet.</span>'}</p>
      ${long ? `<button class="link-btn" data-act="readmore" style="min-height:32px">${D.expanded ? 'Show less' : 'Read more'}</button>` : ''}
    </section>
    <section>
      <div class="sec-head"><h2 class="section-title">Attachments</h2><div class="tools">${atts.length} file${atts.length === 1 ? '' : 's'}
        <button class="icon-btn sm ghost" data-act="attach" aria-label="Add attachment">${ic('upload')}</button></div></div>
      <div class="thumbs" style="margin-top:12px">
        ${atts.map((a, i) => `<button class="thumb" data-act="view-att" data-i="${i}" aria-label="Open ${esc(a.name)}"><img src="${a.data}" alt="" loading="lazy"><span class="cap">${esc(a.name)}</span></button>`).join('')}
        <button class="thumb add" data-act="attach" aria-label="Add image">${ic('plus')}</button>
      </div>
    </section>
    <section>
      <div class="sec-head"><h2 class="section-title">Subtasks</h2><div class="tools">${subs.length ? `${sd}/${subs.length} done` : ''}</div></div>
      <div class="rows" style="margin-top:8px">
        ${subs.map(s => `<div class="subtask${s.done ? ' done' : ''}">
          <button class="tick" data-act="sub-toggle" data-sid="${esc(s.id)}" aria-pressed="${!!s.done}" aria-label="${s.done ? 'Uncheck' : 'Check'} ${esc(s.text)}">${ic('check')}</button>
          <span class="txt">${esc(s.text)}</span>
          <button class="del" data-act="sub-del" data-sid="${esc(s.id)}" aria-label="Delete subtask ${esc(s.text)}">${ic('x')}</button></div>`).join('')}
        <button class="row" data-act="add-subtask">Add subtask ${ic('plus')}</button>
        <button class="row" data-act="share">Sharing <span class="sub">${t.visibility === 'link' ? `${ic('link')}Link · ${1 + (t.members || []).length} ${(t.members || []).length ? 'people' : 'person'}` : `${ic('lock')}Private`} ${ic('chevronRight')}</span></button>
        <button class="row" data-act="more-info">More info ${ic('chevronRight')}</button>
      </div>
    </section>`;
}

/* ---------------------------------------------------------------- share landing */
function renderShareLanding(id) {
  if (S.store.mode === 'local') {
    return `<section class="screen share-land">${STROKES}
      <h1 class="display" style="font-size:36px;line-height:40px">Shared <strong class="text-g-button">task</strong></h1>
      <div class="notice">${ic('info')}<div>This copy of the app runs in local mode, so it can’t open shared tasks. Add Firebase keys (see SETUP.md) to turn on sharing.</div></div>
      <a class="btn-primary" href="#/today">Go to my tasks</a></section>`;
  }
  if (!S.share || S.share.id !== id) {
    const sh = S.share = { id, task: null, state: 'loading' };
    S.store.getTask(id)
      .then(t => { if (S.share !== sh) return; sh.task = t; sh.state = t ? 'ok' : 'missing'; render(); })
      .catch(() => { if (S.share !== sh) return; sh.state = 'missing'; render(); });
  }
  const sh = S.share;
  if (sh.state === 'loading') return '<div class="boot"><div class="spinner" role="status" aria-label="Loading shared task"></div></div>';
  if (sh.state === 'missing') {
    return `<section class="screen share-land">
      <div class="empty"><div class="art">${ic('lock')}</div><b>This task is private</b><span>The link is no longer active, or the task was deleted. Ask the owner to share it again.</span></div>
      <a class="btn-primary" href="#/today">Go to my tasks</a></section>`;
  }
  const t = sh.task;
  const joined = isMine(t) || (t.members || []).includes(S.user.uid);
  const subs = t.subtasks || [];
  return `<section class="screen share-land">
    <div class="from">${avatar(t.ownerName)}<div><div class="t">${isMine(t) ? 'Your shared task' : 'Shared with you by'}</div><div class="n">${esc(isMine(t) ? myName() : t.ownerName)}</div></div></div>
    <h1 class="display" style="font-size:36px;line-height:40px">${joined ? 'Already in' : 'Add this to'}<br><strong class="text-g-button">your tasks${joined ? '' : '?'}</strong></h1>
    ${cardHTML(t, 0, { preview: true })}
    <p style="color:#A6A6AE;margin:0;font-size:14px">${subs.length ? `${subs.length} subtask${subs.length > 1 ? 's' : ''} · ` : ''}Progress syncs live — when anyone ticks something off, everyone sees it.</p>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${joined ? `<a class="btn-primary" href="#/task/${encodeURIComponent(t.id)}">Open task</a>` : `<button class="btn-primary" data-act="join" data-id="${t.id}">${ic('plus')} Add to my tasks</button>`}
      <a class="btn-ghost" href="#/today">Not now</a>
    </div>
  </section>`;
}

/* ================================================================ sheets */
function openSheet(html, mount, cls = '', onClose) {
  const ov = document.createElement('div');
  ov.className = 'overlay ' + cls;
  ov.innerHTML = html;
  const panel = ov.firstElementChild;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
  const prevFocus = document.activeElement;
  const close = () => {
    if (!ov.isConnected) return;
    ov.classList.add('closing');
    onClose && onClose();
    setTimeout(() => ov.remove(), 170);
    document.removeEventListener('keydown', onKey);
    prevFocus && prevFocus.focus && prevFocus.isConnected && prevFocus.focus();
  };
  const onKey = e => { if (e.key === 'Escape' && $('#layer').lastElementChild === ov) close(); };
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  $('#layer').appendChild(ov);
  mount && mount(panel, close);
  const f = panel.querySelector('[autofocus]') || panel.querySelector('button, input');
  if (f && !matchMedia('(pointer: coarse)').matches) f.focus();
  else { panel.setAttribute('tabindex', '-1'); panel.focus(); }
  return close;
}
const sheetHead = title => `<div class="grab"></div><div class="mhead"><h2>${title}</h2><button class="icon-btn" data-close aria-label="Close">${ic('x')}</button></div>`;

function confirmSheet({ title, body, ok = 'Confirm', danger = true }) {
  return new Promise(resolve => {
    let done = false;
    openSheet(`<div class="modal">${sheetHead(title)}<p class="desc" style="margin:0">${body}</p>
      <button class="${danger ? 'btn-danger' : 'btn-primary'}" data-s="ok">${ok}</button><button class="btn-ghost" data-close>Cancel</button></div>`,
      (el, c) => { el.querySelector('[data-s=ok]').onclick = () => { done = true; resolve(true); c(); }; },
      '', () => { if (!done) resolve(false); });
  });
}

function taskFormSheet(existing) {
  const t = existing || { priority: 'normal', visibility: 'private', due: S.view === 'all' ? S.sel : todayISO(), dueTime: '', status: 'todo' };
  const segBtn = (group, v, label, icon = '') => `<button type="button" role="radio" data-g="${group}" data-v="${v}" aria-checked="${t[group] === v}">${icon}${label}</button>`;
  openSheet(`<form class="modal" id="task-form" novalidate>${sheetHead(existing ? 'Edit task' : 'New task')}
    <div class="field"><label for="f-title">Title</label><input id="f-title" class="input" maxlength="120" required autofocus placeholder="What needs to be done?" value="${esc(t.title || '')}"></div>
    <div class="field"><label for="f-project">Project</label><input id="f-project" class="input" maxlength="60" placeholder="e.g. Landcom" value="${esc(t.project || '')}"></div>
    <div class="field"><label for="f-desc">Description</label><textarea id="f-desc" class="input" maxlength="4000" placeholder="Add details, links, notes…">${esc(t.description || '')}</textarea></div>
    <div class="field"><span class="lbl" id="l-pri">Priority</span><div class="seg" role="radiogroup" aria-labelledby="l-pri">${segBtn('priority', 'urgent', 'Urgent')}${segBtn('priority', 'normal', 'Normal')}${segBtn('priority', 'low', 'Low')}</div></div>
    <div class="two-col">
      <div class="field"><label for="f-due">Due date</label><input id="f-due" type="date" class="input" value="${esc(t.due || '')}"></div>
      <div class="field"><label for="f-time">Time</label><input id="f-time" type="time" class="input" value="${esc(t.dueTime || '')}"></div>
    </div>
    <div class="field"><span class="lbl" id="l-vis">Who can see it</span>
      <div class="seg two" role="radiogroup" aria-labelledby="l-vis">${segBtn('visibility', 'private', 'Private', ic('lock'))}${segBtn('visibility', 'link', 'Shared via link', ic('link'))}</div>
      <span class="caption" id="vis-help" style="padding-left:4px"></span></div>
    <p class="form-error" id="f-err" role="alert"></p>
    <button class="btn-primary" type="submit">${existing ? 'Save changes' : 'Add task'}</button>
  </form>`, (form, close) => {
    const val = { priority: t.priority, visibility: t.visibility };
    const help = () => {
      $('#vis-help', form).textContent = val.visibility === 'link'
        ? (S.store.mode === 'local' ? 'Link sharing needs cloud sync — see SETUP.md.' : 'Anyone with the link can add it and update progress live.')
        : 'Only you can see this task.';
    };
    help();
    form.addEventListener('click', e => {
      const b = e.target.closest('[data-g]'); if (!b) return;
      val[b.dataset.g] = b.dataset.v;
      $$(`[data-g="${b.dataset.g}"]`, form).forEach(x => x.setAttribute('aria-checked', x === b));
      help();
    });
    let busy = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return; // never save the same form twice
      const title = $('#f-title', form).value.trim();
      if (!title) { $('#f-err', form).textContent = 'Give your task a title.'; $('#f-title', form).focus(); return; }
      const data = {
        title, project: $('#f-project', form).value.trim(), description: $('#f-desc', form).value.trim(),
        priority: val.priority, visibility: val.visibility,
        due: $('#f-due', form).value || null, dueTime: $('#f-time', form).value || null,
      };
      const btn = form.querySelector('[type=submit]'); btn.disabled = true; busy = true;
      try {
        if (existing) {
          const visChanged = existing.visibility !== data.visibility;
          await S.store.mutateTask(existing.id, () => ({
            ...data, ...(data.visibility === 'private' ? { members: [], memberInfo: {} } : {}),
          }), visChanged ? (data.visibility === 'link' ? 'Turned on link sharing' : 'Made the task private') : 'Edited task details');
          close(); toast('Saved');
        } else {
          const id = await S.store.createTask(data);
          close(); toast('Task added');
          if (data.due && data.due !== S.sel && S.view === 'all') { S.sel = data.due; render(); }
          if (data.visibility === 'link' && S.store.mode === 'cloud') shareSheet(id, { ...data, id, owner: S.user.uid, members: [] });
        }
      } catch (err) { btn.disabled = false; busy = false; $('#f-err', form).textContent = friendly(err); }
    });
  });
}

const shareUrl = id => `${location.origin}${location.pathname}?share=${encodeURIComponent(id)}`;
const findTask = id => (S.detail && S.detail.id === id && S.detail.task) || S.tasks.find(t => t.id === id);

function shareSheet(id, fallback) {
  const draw = (el) => {
    const t = findTask(id) || fallback;
    if (!t) { el.innerHTML = sheetHead('Share task') + '<p class="desc">Task not available.</p>'; return; }
    const mine = isMine(t);
    const link = t.visibility === 'link';
    const local = S.store.mode === 'local';
    const members = (t.members || []).map(u => ({ uid: u, name: (t.memberInfo || {})[u]?.name || 'Someone' }));
    const opt = (v, icon, title, text) => `<button class="opt" role="radio" data-s="vis" data-v="${v}" aria-checked="${t.visibility === v || (v === 'private' && !link)}"><span class="ic">${ic(icon)}</span><span><b>${title}</b><span>${text}</span></span></button>`;
    el.innerHTML = `${sheetHead(mine ? 'Share task' : 'Shared task')}
      ${mine ? `<div role="radiogroup" aria-label="Visibility" style="display:flex;flex-direction:column;gap:10px">
        ${opt('private', 'lock', 'Private', 'Only you can see this task. Anyone you shared it with loses access.')}
        ${opt('link', 'link', 'Shared via link', 'Anyone with the link can add it to their tasks and tick things off — updates sync live.')}
      </div>` : `<div class="notice">${ic('users')}<div>Shared with you by <b>${esc(t.ownerName)}</b>. Changes you make sync to everyone live.</div></div>`}
      ${link && local ? `<div class="notice">${ic('info')}<div>Link sharing needs cloud sync. Add your Firebase keys (see SETUP.md) to get a real link.</div></div>` : ''}
      ${link && !local ? `<div class="linkbox"><input readonly value="${esc(shareUrl(t.id))}" aria-label="Share link"><button class="btn-dark" data-s="copy">${ic('copy')}Copy</button></div>
        <button class="btn-primary" data-s="native">${ic('share')} Send link</button>
        <div class="people"><div class="caption" style="padding-bottom:8px">People with access</div>
          <div class="person">${avatar(t.ownerName, null, 'xs')}<span class="nm">${esc(t.ownerName)}${mine ? ' (you)' : ''}<small>Owner</small></span></div>
          ${members.map(m => `<div class="person">${avatar(m.name, null, 'xs')}<span class="nm">${esc(m.name)}${m.uid === S.user.uid ? ' (you)' : ''}<small>Can update progress</small></span>
            ${mine ? `<button class="chip dark" style="height:32px" data-s="remove" data-uid="${esc(m.uid)}" data-name="${esc(m.name)}">Remove</button>` : ''}</div>`).join('')}
          ${!members.length ? '<p class="caption" style="margin:8px 0 0">Nobody has opened the link yet.</p>' : ''}
        </div>` : ''}
      ${!mine ? '<button class="btn-danger" data-s="leave">Leave task</button>' : ''}`;
  };
  openSheet('<div class="modal"></div>', (el, close) => {
    draw(el);
    el.addEventListener('click', async e => {
      const b = e.target.closest('[data-s]'); if (!b) return;
      const t = findTask(id) || fallback;
      const a = b.dataset.s;
      if (a === 'vis') {
        const v = b.dataset.v;
        if (v === t.visibility || (v === 'private' && t.visibility !== 'link')) return;
        if (v === 'private' && (t.members || []).length) {
          const ok = await confirmSheet({ title: 'Make private?', body: `${t.members.length} ${t.members.length > 1 ? 'people' : 'person'} will lose access, and the link will stop working.`, ok: 'Make private' });
          if (!ok) return;
        }
        await run(S.store.mutateTask(id, () => v === 'private' ? { visibility: 'private', members: [], memberInfo: {} } : { visibility: 'link' },
          v === 'private' ? 'Made the task private' : 'Turned on link sharing'));
        if (fallback) fallback.visibility = v;
        setTimeout(() => draw(el), 50);
      } else if (a === 'copy') {
        await copy(shareUrl(id)); toast('Link copied');
      } else if (a === 'native') {
        const url = shareUrl(id);
        if (navigator.share) { try { await navigator.share({ title: t.title, text: `Join my task “${t.title}”`, url }); } catch {} }
        else { await copy(url); toast('Link copied'); }
      } else if (a === 'remove') {
        const uid = b.dataset.uid;
        await run(S.store.mutateTask(id, x => { const mi = { ...(x.memberInfo || {}) }; delete mi[uid]; return { members: (x.members || []).filter(m => m !== uid), memberInfo: mi }; }, `Removed ${b.dataset.name}`));
        setTimeout(() => draw(el), 50);
      } else if (a === 'leave') {
        const ok = await confirmSheet({ title: 'Leave task?', body: 'It will disappear from your tasks. You can rejoin with the link while it stays shared.', ok: 'Leave' });
        if (!ok) return;
        await run(S.store.leaveTask(id)); close(); toast('You left the task'); go('#/today');
      }
    });
  });
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch { const i = document.createElement('textarea'); i.value = text; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); }
}

function moreInfoSheet(t) {
  const mine = isMine(t);
  openSheet(`<div class="modal">${sheetHead('More info')}
    <dl class="kv" style="margin:0">
      <div><dt>Created by</dt><dd>${esc(t.ownerName)}${mine ? ' (you)' : ''}</dd></div>
      <div><dt>Created</dt><dd>${fmtStamp(t.createdAt)}</dd></div>
      <div><dt>Last updated</dt><dd>${ago(t.updatedAt)}</dd></div>
      <div><dt>Visibility</dt><dd>${t.visibility === 'link' ? 'Shared via link' : 'Private'}</dd></div>
      <div><dt>People</dt><dd>${1 + (t.members || []).length}</dd></div>
    </dl>
    ${mine ? `<button class="btn-ghost" data-s="edit">${ic('pencil')} Edit task</button><button class="btn-danger" data-s="delete">${ic('trash')} Delete task</button>`
      : `<button class="btn-danger" data-s="leave">${ic('logout')} Leave task</button>`}
  </div>`, (el, close) => el.addEventListener('click', async e => {
    const a = e.target.closest('[data-s]')?.dataset.s;
    if (a === 'edit') { close(); taskFormSheet(t); }
    if (a === 'delete') {
      const ok = await confirmSheet({ title: 'Delete task?', body: `“${esc(t.title)}” will be deleted for you${(t.members || []).length ? ' and everyone it’s shared with' : ''}. This can’t be undone.`, ok: 'Delete' });
      if (!ok) return;
      close(); go('#/today'); await run(S.store.deleteTask(t.id)); toast('Task deleted');
    }
    if (a === 'leave') {
      const ok = await confirmSheet({ title: 'Leave task?', body: 'It will disappear from your tasks.', ok: 'Leave' });
      if (!ok) return;
      close(); await run(S.store.leaveTask(t.id)); go('#/today'); toast('You left the task');
    }
  }));
}

function subtaskSheet(id) {
  openSheet(`<form class="modal" novalidate>${sheetHead('Add subtask')}
    <div class="field"><label for="s-text">Subtask</label><input id="s-text" class="input" maxlength="140" autofocus placeholder="e.g. Draft the survey"></div>
    <p class="caption" style="margin:0">Press Enter to add another.</p>
    <button class="btn-primary" type="submit">Add</button></form>`, (form, close) => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const inp = $('#s-text', form); const text = inp.value.trim();
      if (!text) { close(); return; }
      inp.value = ''; inp.focus();
      await run(S.store.mutateTask(id, t => ({
        subtasks: [...(t.subtasks || []), { id: rid(), text, done: false }],
      }), `Added subtask “${text}”`));
      toast('Subtask added');
    });
  });
}

function profileSheet() {
  openSheet(`<form class="modal" novalidate>${sheetHead('Your profile')}
    <div class="field"><label for="p-name">Name</label><input id="p-name" class="input" maxlength="40" required value="${esc(myName())}"></div>
    <div class="field"><label for="p-role">Role</label><input id="p-role" class="input" maxlength="40" placeholder="e.g. Designer" value="${esc(S.profile.role)}"></div>
    ${S.user.email ? `<p class="caption" style="margin:0">Signed in as ${esc(S.user.email)}</p>` : ''}
    <button class="btn-primary" type="submit">Save</button></form>`, (form, close) => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = $('#p-name', form).value.trim();
      if (!name) return;
      await run(S.store.updateProfile({ name, role: $('#p-role', form).value.trim() }));
      close(); toast('Profile saved');
    });
  });
}

function menuDrawer() {
  const counts = Object.fromEntries(Object.entries(VIEWS).map(([k, v]) => [k, v.test ? S.tasks.filter(v.test).length : S.tasks.length]));
  const cloud = S.store.mode === 'cloud';
  openSheet(`<aside class="drawer" aria-label="Menu">
    <div class="me">${avatar(myName(), S.user.photo)}<div style="min-width:0"><b>${esc(myName())}</b><span class="caption">${esc(S.profile.role || S.user.email || '')}</span></div></div>
    <nav class="nav">${Object.entries(VIEWS).map(([k, v]) => `<button data-s="view" data-v="${k}" aria-current="${S.view === k}">${ic(v.icon)}${v.label}<span class="count">${counts[k]}</span></button>`).join('')}</nav>
    <nav class="nav" style="border-top:1px solid var(--line);padding-top:16px">
      <button data-s="profile">${ic('pencil')}Edit profile</button>
      <button data-s="signout">${ic('logout')}${cloud ? 'Sign out' : 'Switch user'}</button>
      <a href="privacy.html" target="_blank" rel="noopener" style="height:48px;border-radius:999px;padding:0 16px;display:flex;align-items:center;gap:12px;color:var(--body);font-weight:600;font-size:14px">${ic('lock')}Privacy policy</a>
      <button data-s="delete-account" style="color:#FF8FA6">${ic('trash')}Delete account</button>
    </nav>
    <div class="sync${cloud ? '' : ' local'}" style="margin-top:auto"><i></i>${cloud ? 'Cloud sync on — shared tasks update live' : 'Local mode — add Firebase keys to share'}</div>
  </aside>`, (el, close) => el.addEventListener('click', async e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    if (b.dataset.s === 'view') { S.view = b.dataset.v; close(); location.hash === '#/today' ? render() : go('#/today'); }
    if (b.dataset.s === 'profile') { close(); profileSheet(); }
    if (b.dataset.s === 'signout') { close(); await run(S.store.signOut()); go('#/auth'); }
    if (b.dataset.s === 'delete-account') { close(); deleteAccountSheet(); }
  }), 'drawer-ov');
}

function deleteAccountSheet() {
  const cloud = S.store.mode === 'cloud';
  const needsPw = cloud && (S.user.providers || []).includes('password');
  const usesGoogle = cloud && !needsPw && (S.user.providers || []).includes('google.com');
  const owned = S.tasks.filter(isMine);
  const sharedOut = owned.filter(t => (t.members || []).length).length;
  const joined = S.tasks.length - owned.length;
  openSheet(`<form class="modal" novalidate>${sheetHead('Delete account')}
    <div class="notice" style="border-color:rgba(255,92,122,.3)">${ic('info')}<div>
      This permanently deletes ${cloud ? 'your account and profile' : 'your profile and all data on this device'}, and it can’t be undone:
      <ul style="margin:8px 0 0;padding-left:18px">
        <li>${owned.length} task${owned.length === 1 ? '' : 's'} you created, with their subtasks and attachments${sharedOut ? ` (also removed for the people you shared ${sharedOut === 1 ? 'one' : sharedOut} with)` : ''}</li>
        ${cloud ? `<li>You’ll be removed from ${joined} task${joined === 1 ? '' : 's'} others shared with you, and your attachments there are deleted</li>` : ''}
      </ul></div></div>
    ${needsPw ? '<div class="field"><label for="da-pw">Your password</label><input id="da-pw" class="input" type="password" autocomplete="current-password" placeholder="Confirm it’s you"></div>' : ''}
    ${usesGoogle ? '<p class="caption" style="margin:0">You’ll be asked to sign in with Google again to confirm.</p>' : ''}
    <div class="field"><label for="da-confirm">Type DELETE to confirm</label><input id="da-confirm" class="input" autocomplete="off" autocapitalize="characters" placeholder="DELETE"></div>
    <p class="form-error" id="da-err" role="alert"></p>
    <button class="btn-danger" type="submit">${ic('trash')} Delete my account</button>
    <button class="btn-ghost" type="button" data-close>Cancel</button>
  </form>`, (form, close) => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const err = $('#da-err', form);
      if ($('#da-confirm', form).value.trim().toUpperCase() !== 'DELETE') { err.textContent = 'Type DELETE to confirm.'; return; }
      const password = needsPw ? $('#da-pw', form).value : undefined;
      if (needsPw && !password) { err.textContent = 'Enter your password to confirm.'; return; }
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Deleting…'; err.textContent = '';
      S.deleting = true;
      try {
        await S.store.deleteAccount({ password });
        close(); S.view = 'all';
        toast('Your account was deleted');
        go('#/auth', true);
      } catch (x) {
        console.error(x);
        btn.disabled = false; btn.innerHTML = `${ic('trash')} Delete my account`;
        err.textContent = x.code === 'auth/popup-closed-by-user' ? 'Google confirmation was cancelled.' : authError(x);
      } finally { S.deleting = false; }
    });
  });
}

function lightbox(i) {
  const D = S.detail; const a = D.atts[i]; if (!a) return;
  const canDel = isMine(D.task) || a.by === S.user.uid;
  const ov = document.createElement('div');
  ov.className = 'lightbox'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', a.name);
  ov.innerHTML = `<div class="lb-bar"><button class="icon-btn" data-s="close" aria-label="Close">${ic('x')}</button>
    <span style="align-self:center;font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 12px">${esc(a.name)}<br><span class="caption">by ${esc(a.byName || '')}</span></span>
    ${canDel ? `<button class="icon-btn" data-s="del" aria-label="Delete attachment">${ic('trash')}</button>` : '<span style="width:44px"></span>'}</div><img src="${a.data}" alt="${esc(a.name)}">`;
  const close = () => { ov.remove(); document.removeEventListener('keydown', key); };
  const key = e => e.key === 'Escape' && close();
  document.addEventListener('keydown', key);
  ov.addEventListener('click', async e => {
    const s = e.target.closest('[data-s]')?.dataset.s;
    if (s === 'close' || e.target === ov) close();
    if (s === 'del') { close(); await run(S.store.removeAttachment(D.id, a.id)); toast('Attachment removed'); }
  });
  document.body.appendChild(ov);
  ov.querySelector('button').focus();
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let max = 1200, q = 0.78, data;
      const draw = () => {
        const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL('image/jpeg', q);
      };
      data = draw();
      while (data.length > 650000 && max > 320) { max = Math.round(max * 0.75); q = Math.max(0.5, q - 0.08); data = draw(); }
      URL.revokeObjectURL(url); resolve(data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
    img.src = url;
  });
}

/* ================================================================ actions */
const statusFlow = { todo: ['started', 'Started the task'], started: ['done', 'Marked as completed'], done: ['todo', 'Reopened the task'] };

async function onClick(e) {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  const D = S.detail;
  switch (a) {
    case 'start':
      try { localStorage.setItem('tm.onboarded', '1'); } catch {}
      return go('#/auth');
    case 'google': {
      el.disabled = true;
      try { await S.store.signInGoogle(); }
      catch (err) { el.disabled = false; const m = $('#auth-err'); if (m) m.textContent = authError(err); }
      return;
    }
    case 'auth-toggle': S.authMode = S.authMode === 'signin' ? 'signup' : 'signin'; return render();
    case 'menu': return menuDrawer();
    case 'profile': return profileSheet();
    case 'add': return taskFormSheet();
    case 'clear-view': S.view = 'all'; return render();
    case 'pick-day': {
      S.sel = el.dataset.day;
      const d = parseISO(S.sel);
      if (parseRoute().name === 'calendar') S.calMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      return render();
    }
    case 'month': S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth() + Number(el.dataset.d), 1); return render();
    case 'toggle-done': {
      const id = el.dataset.id;
      const t = S.tasks.find(x => x.id === id); if (!t) return;
      const done = t.status !== 'done';
      el.setAttribute('aria-pressed', done); // instant feedback; snapshot confirms
      return run(S.store.mutateTask(id, x => ({ status: x.status === 'done' ? 'todo' : 'done' }), done ? 'Marked as completed' : 'Reopened the task')).catch(() => render());
    }
    case 'bookmark': {
      const id = el.dataset.id;
      const set = new Set(S.profile.bookmarks);
      set.has(id) ? set.delete(id) : set.add(id);
      S.profile = { ...S.profile, bookmarks: [...set] }; render();
      return run(S.store.updateProfile({ bookmarks: [...set] }));
    }
    case 'join': {
      el.disabled = true;
      try { await S.store.joinTask(el.dataset.id); toast('Added to your tasks'); go('#/task/' + encodeURIComponent(el.dataset.id), true); }
      catch (err) { el.disabled = false; toast(friendly(err)); }
      return;
    }
    // ---- detail
    case 'back': return S.depth > 0 ? history.back() : go('#/today');
    case 'tab': {
      if (!D || D.tab === el.dataset.tab) return;
      D.tab = el.dataset.tab;
      $$('.tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === D.tab));
      $('.tab-pill').style.transform = `translateX(${D.tab === 'desc' ? 0 : 100}%)`;
      const body = $('#tabbody'); body.setAttribute('aria-labelledby', D.tab === 'desc' ? 'tab-desc' : 'tab-act');
      body.innerHTML = detailBody(D.task);
      return;
    }
    case 'readmore': D.expanded = !D.expanded; $('#tabbody').innerHTML = detailBody(D.task); return;
    case 'advance': {
      const [next, text] = statusFlow[D.task.status] || statusFlow.todo;
      return run(S.store.mutateTask(D.id, x => (x.status === D.task.status ? { status: next } : null), text));
    }
    case 'share': return shareSheet(D ? D.id : el.dataset.id);
    case 'more-info': return moreInfoSheet(D.task);
    case 'add-subtask': return subtaskSheet(D.id);
    case 'sub-toggle': {
      const sid = el.dataset.sid;
      const s = (D.task.subtasks || []).find(x => x.id === sid); if (!s) return;
      el.setAttribute('aria-pressed', !s.done);
      return run(S.store.mutateTask(D.id, x => {
        const subtasks = (x.subtasks || []).map(y => y.id === sid ? { ...y, done: !y.done } : y);
        return { subtasks, ...(x.status === 'todo' && !s.done ? { status: 'started' } : {}) };
      }, `${s.done ? 'Unchecked' : 'Completed'} “${s.text}”`)).catch(() => render());
    }
    case 'sub-del': {
      const sid = el.dataset.sid;
      const s = (D.task.subtasks || []).find(x => x.id === sid); if (!s) return;
      return run(S.store.mutateTask(D.id, x => ({ subtasks: (x.subtasks || []).filter(y => y.id !== sid) }), `Removed subtask “${s.text}”`));
    }
    case 'attach': { const f = $('#file-in'); f.value = ''; f.click(); return; }
    case 'view-att': return lightbox(Number(el.dataset.i));
  }
}

function authError(e) {
  const map = {
    'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.', 'auth/user-not-found': 'No account with that email — create one below.',
    'auth/email-already-in-use': 'That email already has an account. Sign in instead.', 'auth/weak-password': 'Use at least 6 characters.',
    'auth/invalid-email': 'That email doesn’t look right.', 'auth/popup-closed-by-user': '', 'auth/unauthorized-domain': 'This domain isn’t authorised in Firebase Auth settings (see SETUP.md).',
    'auth/network-request-failed': 'No connection. Check your internet and try again.', 'auth/too-many-requests': 'Too many attempts. Try again in a minute.',
  };
  return e && e.code in map ? map[e.code] : friendly(e);
}

async function onSubmit(e) {
  if (e.target.id === 'auth-form') {
    e.preventDefault();
    const f = e.target; const err = $('#auth-err');
    const email = $('#ae').value.trim(), pw = $('#ap').value;
    const name = $('#an') ? $('#an').value.trim() : '';
    if (S.authMode === 'signup' && !name) { err.textContent = 'Tell us your name.'; return; }
    if (!email || !pw) { err.textContent = 'Enter your email and password.'; return; }
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; err.textContent = '';
    try { S.authMode === 'signup' ? await S.store.signUpEmail(name, email, pw) : await S.store.signInEmail(email, pw); }
    catch (x) { btn.disabled = false; err.textContent = authError(x); }
  }
  if (e.target.id === 'local-form') {
    e.preventDefault();
    const name = $('#ln').value.trim(); if (!name) return;
    S.store.signInLocal(name, $('#lr').value.trim());
  }
}

async function onFiles(e) {
  const D = S.detail; if (!D) return;
  const files = [...e.target.files].filter(f => f.type.startsWith('image/'));
  if (!files.length) { if (e.target.files.length) toast('Only images can be attached'); return; }
  toast(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}…`);
  for (const f of files) {
    try {
      const data = await compressImage(f);
      await S.store.addAttachment(D.id, { name: f.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'Image', data });
    } catch (err) { toast(friendly(err)); return; }
  }
  run(S.store.mutateTask(D.id, () => ({}), `Added ${files.length} attachment${files.length > 1 ? 's' : ''}`)).catch(() => {});
  toast('Attachment added');
}

/* ================================================================ boot */
async function boot() {
  const params = new URLSearchParams(location.search);
  const share = params.get('share');
  if (share) history.replaceState(null, '', location.pathname + '#/share/' + encodeURIComponent(share));
  render();
  document.addEventListener('click', e => { if (e.target.closest('#app')) onClick(e); });
  document.addEventListener('submit', onSubmit);
  $('#file-in').addEventListener('change', onFiles);
  window.addEventListener('hashchange', () => { S.depth = (S.depth || 0) + 1; render(); });
  // keep "today" correct if the app stays open past midnight
  let day = todayISO();
  setInterval(() => { if (todayISO() !== day) { if (S.sel === day) S.sel = todayISO(); day = todayISO(); render(); } }, 60000);

  S.store = await createStore();
  S.store.onAuth(onAuthChanged);
}
boot();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
