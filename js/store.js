// Data layer. Two interchangeable backends with the same API:
//   cloud — Firebase Auth + Firestore (accounts, share links, live sync between people)
//   local — localStorage only (single device; live across tabs; no sharing)
// firebase-config.js is git-ignored (see firebase-config.example.js). If it is missing, run in local mode.
let firebaseConfig = null;
try { ({ firebaseConfig } = await import('./firebase-config.js')); }
catch { console.warn('[store] js/firebase-config.js not found, using local mode'); }

const FB_VERSION = '10.12.2';
const LEGACY_KEY = 'tasks-app-v1'; // todos from the previous version of the app

// Dev only: open http://localhost:5500/?emulator once to use the local Firebase emulators
// (`firebase emulators:start`), ?emulator=off to stop. Never active on a real domain.
const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);
const useEmulator = (() => {
  if (!isLocalHost) return false;
  const q = new URLSearchParams(location.search).get('emulator');
  try {
    if (q === 'off') localStorage.removeItem('tm.emulator');
    else if (q !== null) localStorage.setItem('tm.emulator', '1');
    return localStorage.getItem('tm.emulator') === '1';
  } catch { return false; }
})();
const config = useEmulator ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-tasks', appId: 'demo' } : firebaseConfig;

export const isConfigured = !!(config && config.apiKey && !config.apiKey.startsWith('YOUR_'));

export async function createStore() {
  if (isConfigured) {
    try { return await createCloudStore(); }
    catch (e) { console.error('[store] Firebase failed to load, using local mode', e); }
  }
  return createLocalStore();
}

const rid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));

function newTaskDoc(data, user) {
  const now = Date.now();
  return {
    title: data.title,
    project: data.project || '',
    description: data.description || '',
    priority: data.priority || 'normal',
    status: data.status || 'todo',
    due: data.due || null,
    dueTime: data.dueTime || null,
    visibility: data.visibility === 'link' ? 'link' : 'private',
    owner: user.uid,
    ownerName: user.name,
    members: [],
    memberInfo: {},
    subtasks: data.subtasks || [],
    activity: [{ text: 'Task created', by: user.name, at: now }],
    createdAt: now,
    updatedAt: now,
  };
}

function withActivity(task, patch, text, user) {
  if (!text) return patch;
  const activity = [...(task.activity || []), { text, by: user.name, at: Date.now() }].slice(-50);
  return { ...patch, activity };
}

function readLegacy() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(t => t && t.text) : [];
  } catch { return []; }
}

/* ------------------------------------------------------------------ cloud */
async function createCloudStore() {
  const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(base + 'firebase-app.js'),
    import(base + 'firebase-auth.js'),
    import(base + 'firebase-firestore.js'),
  ]);
  const app = initializeApp(config);
  const auth = A.getAuth(app);
  let db;
  if (useEmulator) {
    db = F.getFirestore(app);
    A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    F.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } else {
    try {
      db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
    } catch { db = F.getFirestore(app); }
  }
  A.getRedirectResult(auth).catch(() => {});

  const tasksCol = F.collection(db, 'tasks');
  let user = null;
  const toObj = d => ({ id: d.id, ...d.data() });

  async function ensureProfile(u) {
    const ref = F.doc(db, 'users', u.uid);
    const snap = await F.getDoc(ref);
    if (!snap.exists()) await F.setDoc(ref, { name: u.name, role: '', bookmarks: [] });
    else if (snap.data().name) user.name = snap.data().name;
  }

  const store = {
    mode: 'cloud',
    get user() { return user; },

    onAuth(cb) {
      return A.onAuthStateChanged(auth, async u => {
        if (!u) { user = null; cb(null); return; }
        user = {
          uid: u.uid, name: u.displayName || (u.email || '').split('@')[0] || 'You', email: u.email, photo: u.photoURL,
          providers: u.providerData.map(p => p.providerId),
        };
        try { await ensureProfile(user); } catch (e) { console.warn(e); }
        cb(user);
      });
    },
    async signInGoogle() {
      const provider = new A.GoogleAuthProvider();
      try { await A.signInWithPopup(auth, provider); }
      catch (e) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) {
          await A.signInWithRedirect(auth, provider);
        } else throw e;
      }
    },
    signInEmail: (email, pw) => A.signInWithEmailAndPassword(auth, email, pw),
    async signUpEmail(name, email, pw) {
      const cred = await A.createUserWithEmailAndPassword(auth, email, pw);
      await A.updateProfile(cred.user, { displayName: name });
      if (user) user.name = name;
      await F.setDoc(F.doc(db, 'users', cred.user.uid), { name }, { merge: true });
    },
    signOut: () => A.signOut(auth),

    // Permanently deletes the account and everything it owns (Play Store account-deletion requirement).
    async deleteAccount({ password } = {}) {
      const cu = auth.currentUser;
      if (!cu) throw new Error('You are not signed in');
      // 1. Confirm identity first: Firebase only deletes accounts with a recent sign-in,
      //    and doing it up front means we never delete data and then fail on the account.
      const providers = cu.providerData.map(p => p.providerId);
      if (providers.includes('password')) {
        if (!password) throw Object.assign(new Error('Enter your password to confirm'), { code: 'need-password' });
        await A.reauthenticateWithCredential(cu, A.EmailAuthProvider.credential(cu.email, password));
      } else if (providers.includes('google.com')) {
        await A.reauthenticateWithPopup(cu, new A.GoogleAuthProvider());
      }
      const uid = cu.uid;
      const myName = user.name;
      // 2. Tasks I own, with their attachments (removed for collaborators too).
      const own = await F.getDocs(F.query(tasksCol, F.where('owner', '==', uid)));
      for (const d of own.docs) await store.deleteTask(d.id);
      // 3. Tasks shared with me: delete my attachments, anonymise my activity, leave.
      const shared = await F.getDocs(F.query(tasksCol, F.where('members', 'array-contains', uid)));
      for (const d of shared.docs) {
        const mine = await F.getDocs(F.query(F.collection(db, 'tasks', d.id, 'attachments'), F.where('by', '==', uid)));
        await Promise.all(mine.docs.map(a => F.deleteDoc(a.ref)));
        await store.mutateTask(d.id, t => {
          const memberInfo = { ...(t.memberInfo || {}) }; delete memberInfo[uid];
          return {
            members: (t.members || []).filter(m => m !== uid),
            memberInfo,
            activity: (t.activity || []).map(a => (a.by === myName ? { ...a, by: 'Deleted user' } : a)),
          };
        });
      }
      // 4. Profile, then the sign-in itself.
      await F.deleteDoc(F.doc(db, 'users', uid));
      await A.deleteUser(cu);
      try { sessionStorage.removeItem('tm.pendingShare'); } catch {}
    },

    watchProfile(cb) {
      return F.onSnapshot(F.doc(db, 'users', user.uid), s => {
        const p = s.data() || {};
        if (p.name) user.name = p.name;
        cb({ name: p.name || user.name, role: p.role || '', bookmarks: p.bookmarks || [] });
      });
    },
    updateProfile: patch => F.setDoc(F.doc(db, 'users', user.uid), patch, { merge: true }),

    // Your own tasks + tasks other people shared with you (you joined via link).
    watchTasks(cb, onErr) {
      const own = new Map(), shared = new Map();
      const emit = () => cb([...new Map([...shared, ...own]).values()]);
      const u1 = F.onSnapshot(F.query(tasksCol, F.where('owner', '==', user.uid)), snap => {
        own.clear(); snap.forEach(d => own.set(d.id, toObj(d))); emit();
      }, onErr);
      const u2 = F.onSnapshot(F.query(tasksCol, F.where('members', 'array-contains', user.uid)), snap => {
        shared.clear(); snap.forEach(d => shared.set(d.id, toObj(d))); emit();
      }, onErr);
      return () => { u1(); u2(); };
    },
    watchTask(id, cb, onErr) {
      return F.onSnapshot(F.doc(db, 'tasks', id), s => cb(s.exists() ? toObj(s) : null), onErr);
    },
    async getTask(id) {
      const s = await F.getDoc(F.doc(db, 'tasks', id));
      return s.exists() ? toObj(s) : null;
    },
    async createTask(data) {
      const ref = await F.addDoc(tasksCol, newTaskDoc(data, user));
      return ref.id;
    },
    // fn(task) -> patch. Runs in a transaction so two people ticking at once don't overwrite each other.
    mutateTask(id, fn, activityText) {
      const ref = F.doc(db, 'tasks', id);
      return F.runTransaction(db, async tx => {
        const s = await tx.get(ref);
        if (!s.exists()) throw new Error('Task no longer exists');
        const task = toObj(s);
        const patch = fn(task);
        if (!patch) return;
        tx.update(ref, { ...withActivity(task, patch, activityText, user), updatedAt: Date.now() });
      });
    },
    async deleteTask(id) {
      const atts = await F.getDocs(F.collection(db, 'tasks', id, 'attachments'));
      await Promise.all(atts.docs.map(d => F.deleteDoc(d.ref)));
      await F.deleteDoc(F.doc(db, 'tasks', id));
    },
    joinTask(id) {
      return store.mutateTask(id, t => (t.members || []).includes(user.uid) ? null : {
        members: [...(t.members || []), user.uid],
        memberInfo: { ...(t.memberInfo || {}), [user.uid]: { name: user.name } },
      }, 'Joined via shared link');
    },
    leaveTask(id) {
      return store.mutateTask(id, t => {
        const memberInfo = { ...(t.memberInfo || {}) }; delete memberInfo[user.uid];
        return { members: (t.members || []).filter(m => m !== user.uid), memberInfo };
      }, 'Left the task');
    },

    watchAttachments(taskId, cb) {
      const q = F.query(F.collection(db, 'tasks', taskId, 'attachments'), F.orderBy('at', 'asc'));
      return F.onSnapshot(q, s => cb(s.docs.map(toObj)), () => cb([]));
    },
    addAttachment: (taskId, { name, data }) =>
      F.addDoc(F.collection(db, 'tasks', taskId, 'attachments'), { name, data, by: user.uid, byName: user.name, at: Date.now() }),
    removeAttachment: (taskId, attId) => F.deleteDoc(F.doc(db, 'tasks', taskId, 'attachments', attId)),

    async importLegacy() {
      const old = readLegacy();
      if (!old.length) return 0;
      for (const t of old) await store.createTask({ title: t.text, status: t.done ? 'done' : 'todo' });
      localStorage.removeItem(LEGACY_KEY);
      return old.length;
    },
  };
  return store;
}

/* ------------------------------------------------------------------ local */
function createLocalStore() {
  const K = { tasks: 'tm.tasks', profile: 'tm.profile', att: id => 'tm.att.' + id };
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { throw new Error('Storage is full'); } };
  const subs = new Set();
  const notify = () => subs.forEach(fn => fn());
  window.addEventListener('storage', e => { if (e.key && e.key.startsWith('tm.')) notify(); });

  let user = null;
  const loadUser = () => {
    const p = read(K.profile, null);
    user = p && p.name ? { uid: 'local', name: p.name } : null;
  };
  loadUser();
  let authCb = null;
  const tasks = () => read(K.tasks, []);
  const saveTasks = list => { write(K.tasks, list); notify(); };
  const sub = fn => { subs.add(fn); fn(); return () => subs.delete(fn); };

  const store = {
    mode: 'local',
    get user() { return user; },
    onAuth(cb) { authCb = cb; cb(user); return () => {}; },
    signInLocal(name, role) {
      write(K.profile, { ...read(K.profile, {}), name, role: role || '', bookmarks: read(K.profile, {}).bookmarks || [] });
      loadUser(); authCb && authCb(user);
    },
    signOut() { localStorage.removeItem(K.profile); user = null; authCb && authCb(null); },
    async deleteAccount() {
      Object.keys(localStorage).filter(k => k.startsWith('tm.') && k !== 'tm.onboarded').forEach(k => localStorage.removeItem(k));
      user = null; authCb && authCb(null);
    },

    watchProfile(cb) { return sub(() => { const p = read(K.profile, {}); cb({ name: p.name || '', role: p.role || '', bookmarks: p.bookmarks || [] }); }); },
    async updateProfile(patch) { write(K.profile, { ...read(K.profile, {}), ...patch }); loadUser(); notify(); },

    watchTasks(cb) { return sub(() => cb(tasks())); },
    watchTask(id, cb) { return sub(() => cb(tasks().find(t => t.id === id) || null)); },
    async getTask(id) { return tasks().find(t => t.id === id) || null; },
    async createTask(data) {
      const t = { id: rid(), ...newTaskDoc(data, user) };
      saveTasks([t, ...tasks()]);
      return t.id;
    },
    async mutateTask(id, fn, activityText) {
      const list = tasks();
      const i = list.findIndex(t => t.id === id);
      if (i < 0) throw new Error('Task no longer exists');
      const patch = fn(list[i]);
      if (!patch) return;
      list[i] = { ...list[i], ...withActivity(list[i], patch, activityText, user), updatedAt: Date.now() };
      saveTasks(list);
    },
    async deleteTask(id) { localStorage.removeItem(K.att(id)); saveTasks(tasks().filter(t => t.id !== id)); },
    async joinTask() { throw new Error('Sharing needs cloud sync'); },
    async leaveTask() { throw new Error('Sharing needs cloud sync'); },

    watchAttachments(taskId, cb) { return sub(() => cb(read(K.att(taskId), []))); },
    async addAttachment(taskId, { name, data }) {
      write(K.att(taskId), [...read(K.att(taskId), []), { id: rid(), name, data, by: 'local', byName: user.name, at: Date.now() }]);
      notify();
    },
    async removeAttachment(taskId, attId) { write(K.att(taskId), read(K.att(taskId), []).filter(a => a.id !== attId)); notify(); },

    async importLegacy() {
      const old = readLegacy();
      if (!old.length) return 0;
      for (const t of old.reverse()) await store.createTask({ title: t.text, status: t.done ? 'done' : 'todo' });
      localStorage.removeItem(LEGACY_KEY);
      return old.length;
    },
  };
  return store;
}
