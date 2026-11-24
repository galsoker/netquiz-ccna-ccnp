/* NetQuiz – CCNA / CCNP quiz game (RTL, Hebrew). All data stays on the device (localStorage). */
(function () {
  'use strict';
  const Q = window.QUESTIONS || [];
  const LETTERS = ['א', 'ב', 'ג', 'ד'];
  const COLORS = ['#1554D1', '#0A2A6B', '#0E7490', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#334155'];
  const KEY = 'netquiz_v1';
  const IS_APP = /NetQuizApp/.test(navigator.userAgent);
  const app = document.getElementById('app');

  /* ------------------------------------------------ storage */
  const blank = () => ({ profile: null, points: 0, quizzes: [], seen: {}, topic: {}, level: { CCNA: { a: 0, c: 0 }, CCNP: { a: 0, c: 0 } }, friends: {}, bestStreak: 0, answered: 0, prefs: { mode: 'MIX', n: 10 } });
  let S;
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

  /* ------------------------------------------------ helpers */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = s => esc(s)
    .replace(/&lt;(\/?)sup&gt;/g, '<$1sup>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^\w>])([A-Za-z][A-Za-z0-9.\-]*\+)(?![\w+])/g, '$1<bdi>$2</bdi>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = n => Math.round(n).toLocaleString('he-IL');
  const avg = () => S.quizzes.length ? S.quizzes.reduce((s, q) => s + q.pct, 0) / S.quizzes.length : 0;
  const initial = n => (n || '?').trim().charAt(0).toUpperCase();
  const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); };
  const vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } };

  /* ------------------------------------------------ icons */
  const I = {
    logo: `<svg width="30" height="30" viewBox="0 0 32 32"><circle cx="16" cy="7" r="4.2" fill="#1554D1"/><circle cx="6.5" cy="24" r="4.2" fill="#0A2A6B"/><circle cx="25.5" cy="24" r="4.2" fill="#2B6BEA"/><path d="M16 11v5M16 16l-7.5 5.2M16 16l7.5 5.2" stroke="#1554D1" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="16" r="2.6" fill="#F5B301"/></svg>`,
    home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>`,
    trophy: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>`,
    chart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`,
    x: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    ok: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>`,
    bad: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>`,
    share: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>`,
    plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    users: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1554D1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>`,
    target: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1554D1" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#1554D1"/></svg>`,
    bolt: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD34D"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>`,
    crown: `<svg width="26" height="20" viewBox="0 0 26 20"><path d="M2 6l5.5 5L13 2l5.5 9L24 6l-2.5 12h-17z" fill="#F5B301" stroke="#C98A00" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
    trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>`,
    modeA: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1554D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/></svg>`,
    modeP: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 15.6 6.6 18.5l1.2-6-4.5-4.2 6.1-.7z"/></svg>`,
    modeM: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A2A6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>`,
    bigTrophy: `<svg width="150" height="120" viewBox="0 0 150 120"><g fill="none" stroke-linecap="round"><path d="M22 30l8 6M128 30l-8 6M18 62h10M122 62h10M34 12l4 9M116 12l-4 9" stroke="#2B6BEA" stroke-width="4"/></g><circle cx="26" cy="46" r="4" fill="#F5B301"/><circle cx="125" cy="48" r="4" fill="#1554D1"/><circle cx="40" cy="92" r="3" fill="#1554D1"/><circle cx="112" cy="90" r="3" fill="#F5B301"/><path d="M52 18h46v26a23 23 0 0 1-46 0z" fill="#F5B301"/><path d="M98 24h12v8a14 14 0 0 1-14 14M52 24H40v8a14 14 0 0 0 14 14" fill="none" stroke="#F5B301" stroke-width="6"/><path d="M60 18h12v30a12 12 0 0 1-12-12z" fill="#FFD966"/><rect x="69" y="66" width="12" height="16" fill="#E0A100"/><rect x="56" y="82" width="38" height="10" rx="3" fill="#0A2A6B"/><rect x="50" y="92" width="50" height="12" rx="4" fill="#1554D1"/></svg>`
  };

  /* ------------------------------------------------ profile code (friends league, serverless) */
  function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36).slice(-6).padStart(6, '0'); }
  function b64e(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function myCode() {
    const p = S.profile;
    const body = b64e(JSON.stringify({ i: p.id, n: p.name, c: p.color, a: Math.round(avg() * 10) / 10, p: Math.round(S.points), q: S.quizzes.length, t: Date.now() }));
    return 'NQ1.' + body + '.' + hash(body);
  }
  function readCodes(text) {
    const re = /NQ1\.([A-Za-z0-9_-]+)\.([0-9a-z]{6})/g; let m, added = 0, updated = 0, bad = 0;
    while ((m = re.exec(text))) {
      if (hash(m[1]) !== m[2]) { bad++; continue; }
      try {
        const d = JSON.parse(b64d(m[1]));
        if (!d.i || d.i === S.profile.id) continue;
        const old = S.friends[d.i];
        if (old && old.t >= d.t) continue;
        S.friends[d.i] = { name: String(d.n).slice(0, 24), color: d.c, avg: +d.a || 0, pts: +d.p || 0, q: +d.q || 0, t: d.t };
        old ? updated++ : added++;
      } catch (e) { bad++; }
    }
    save();
    return { added, updated, bad };
  }
  function shareText(extra) {
    const lines = [];
    if (extra) lines.push(extra);
    lines.push(`🏆 אני מתחרה בנטקוויז – משחק התרגול ל־CCNA ול־CCNP!`);
    lines.push(`הממוצע שלי: ${Math.round(avg())}% · ${fmt(S.points)} נקודות · ${S.quizzes.length} מבחנים`);
    lines.push(`בוא להתחרות בי: פתח את נטקוויז ← ליגת חברים ← "הוספת חבר", והדבק את הקוד הזה:`);
    lines.push(myCode());
    return lines.join('\n');
  }
  function doShare(text) {
    if (IS_APP) { location.href = 'app-share:' + encodeURIComponent(text); return; }
    if (navigator.share) { navigator.share({ text }).catch(() => copy(text)); return; }
    copy(text);
  }
  function copy(text) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) { }
    ta.remove();
    if (!ok && navigator.clipboard) { navigator.clipboard.writeText(text).then(() => toast('הועתק ללוח')).catch(() => toast('לא הצלחנו להעתיק')); return; }
    toast(ok ? 'הועתק ללוח – הדבק בוואטסאפ או בהודעה' : 'לא הצלחנו להעתיק');
  }

  /* ------------------------------------------------ router */
  let screen = 'home', quiz = null, timerId = null;
  function go(s) { clearInterval(timerId); screen = s; render(); window.scrollTo(0, 0); }
  window.appBack = function () {
    if (document.querySelector('.overlay')) { document.querySelector('.overlay').remove(); return; }
    if (screen === 'quiz') { confirmQuit(); return; }
    if (screen !== 'home' && S.profile) { go('home'); return; }
    if (IS_APP) location.href = 'app-exit:';
  };

  function nav() {
    const b = (id, ic, t) => `<button class="${screen === id ? 'on' : ''}" data-go="${id}">${ic}<span>${t}</span></button>`;
    return `<nav class="nav">${b('home', I.home, 'בית')}${b('league', I.trophy, 'ליגת חברים')}${b('stats', I.chart, 'התקדמות')}</nav>`;
  }

  function render() {
    if (!S.profile) { app.innerHTML = welcome(); bindWelcome(); return; }
    if (screen === 'home') app.innerHTML = home() + nav();
    else if (screen === 'quiz') app.innerHTML = quizView();
    else if (screen === 'result') app.innerHTML = resultView();
    else if (screen === 'league') app.innerHTML = leagueView() + nav();
    else if (screen === 'stats') app.innerHTML = statsView() + nav();
    bind();
  }

  /* ------------------------------------------------ welcome */
  function welcome() {
    const nA = Q.filter(q => q.lv === 'CCNA').length, nP = Q.length - nA;
    return `<div class="welcome screen">
      <div class="big">${I.logo.replace(/width="30" height="30"/, 'width="62" height="62"')}</div>
      <h1>נטקוויז</h1>
      <p>משחק השאלות האמריקאיות לתרגול CCNA ו־CCNP<br>צוברים נקודות, לומדים מכל טעות ומתחרים בחברים</p>
      <div class="feat"><div><b>${Q.length}</b>שאלות</div><div><b>${nA}</b>CCNA</div><div><b>${nP}</b>CCNP</div></div>
      <div class="panel">
        <label>איך לקרוא לך בליגה?</label>
        <input class="field" id="nm" maxlength="20" placeholder="למשל: גל" autocomplete="off">
        <label>בחר צבע</label>
        <div class="colors">${COLORS.map((c, i) => `<button data-c="${c}" class="${i === 0 ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>
        <button class="btn primary" id="startApp" disabled>יוצאים לדרך</button>
      </div></div>`;
  }
  function bindWelcome() {
    let color = COLORS[0];
    const nm = $('#nm'), b = $('#startApp');
    nm.addEventListener('input', () => b.disabled = nm.value.trim().length < 2);
    app.querySelectorAll('.colors button').forEach(el => el.onclick = () => { app.querySelectorAll('.colors button').forEach(x => x.classList.remove('on')); el.classList.add('on'); color = el.dataset.c; });
    b.onclick = () => { S.profile = { id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4), name: nm.value.trim(), color, created: Date.now() }; save(); go('home'); };
  }

  /* ------------------------------------------------ home */
  function home() {
    const p = S.profile, nA = Q.filter(q => q.lv === 'CCNA').length, nP = Q.length - nA;
    const m = S.prefs.mode, n = S.prefs.n;
    const hour = new Date().getHours(), greet = hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';
    const mode = (id, ic, cls, title, sub) => `<button class="mode ${m === id ? 'sel' : ''}" data-mode="${id}"><span class="ic ${cls}">${ic}</span><span class="tx"><b>${title}</b><small>${sub}</small></span><span class="chk">${m === id ? I.check : ''}</span></button>`;
    return `<div class="screen">
      <div class="hero"><div class="topbar"><div class="brand"><div class="logo">${I.logo}</div><div><h1>נטקוויז</h1><small>תרגול CCNA · CCNP</small></div></div>
      <div class="avatar" style="background:${p.color}" data-act="profile">${esc(initial(p.name))}</div></div>
      <div class="hello">${greet},<b>${esc(p.name)} 👋</b></div></div>
      <div class="stats"><div class="stat"><div class="v gold">${fmt(S.points)}</div><div class="k">נקודות</div></div>
      <div class="stat"><div class="v">${S.quizzes.length ? Math.round(avg()) + '%' : '—'}</div><div class="k">ממוצע ציונים</div></div>
      <div class="stat"><div class="v">${S.quizzes.length}</div><div class="k">מבחנים</div></div></div>
      <div class="section"><div class="sec-title"><h2>בחר מסלול</h2><span>${Q.length} שאלות במאגר</span></div>
      ${mode('CCNA', I.modeA, 'a', 'שאלות CCNA', `${nA} שאלות · יסודות, מיתוג, ניתוב ואבטחה`)}
      ${mode('CCNP', I.modeP, 'p', 'שאלות CCNP', `${nP} שאלות · OSPF מתקדם, BGP, MST, אוטומציה`)}
      ${mode('MIX', I.modeM, 'm', 'מעורב', 'שאלות משני המסלולים בסדר אקראי')}</div>
      <div class="section"><div class="sec-title"><h2>מספר שאלות</h2><span>ללא הגבלת זמן</span></div>
      <div class="seg">${[10, 20, 30, 50].map(k => `<button data-n="${k}" class="${n === k ? 'on' : ''}">${k}</button>`).join('')}</div></div>
      <div class="section"><button class="btn primary" data-act="start">התחל מבחן ←</button></div>
      <div class="section"><div class="tile-grid">
        <button class="tile" data-act="weak"><div class="ic">${I.target}</div><b>חיזוק נקודות חולשה</b><small>10 שאלות מהנושאים שבהם טעית הכי הרבה</small></button>
        <button class="tile" data-go="league"><div class="ic">${I.users}</div><b>ליגת חברים</b><small>${Object.keys(S.friends).length ? Object.keys(S.friends).length + ' חברים בליגה' : 'הזמן חברים להתחרות'}</small></button>
      </div></div></div>`;
  }

  /* ------------------------------------------------ quiz engine */
  function pick(mode, n, weak) {
    let pool = mode === 'MIX' ? Q : Q.filter(q => q.lv === mode);
    if (weak) {
      const acc = t => { const s = S.topic[t]; return s && s.a ? s.c / s.a : 1; };
      const topics = [...new Set(Q.map(q => q.t))].filter(t => S.topic[t] && S.topic[t].a).sort((a, b) => acc(a) - acc(b)).slice(0, 5);
      if (topics.length) pool = Q.filter(q => topics.includes(q.t));
    }
    const unseen = shuffle(pool.filter(q => !S.seen[q.id])), seen = shuffle(pool.filter(q => S.seen[q.id]));
    let list = unseen.concat(seen).slice(0, n);
    if (unseen.length < n && unseen.length === 0) { pool.forEach(q => delete S.seen[q.id]); }
    return shuffle(list).map(q => { const opts = shuffle([q.c, ...q.w]); return { q, opts, ci: opts.indexOf(q.c) }; });
  }
  function startQuiz(weak) {
    const mode = weak ? 'MIX' : S.prefs.mode, n = weak ? 10 : S.prefs.n;
    const items = pick(mode, n, weak);
    if (!items.length) { toast('אין עדיין מספיק נתונים לחיזוק – שחק מבחן רגיל קודם'); return; }
    quiz = { mode: weak ? 'WEAK' : mode, items, i: 0, sel: -1, done: false, ans: [], streak: 0, best: 0, pts: 0, start: Date.now() };
    go('quiz');
  }
  const modeName = m => ({ CCNA: 'מבחן CCNA', CCNP: 'מבחן CCNP', MIX: 'מבחן מעורב', WEAK: 'חיזוק נקודות חולשה' })[m];

  function quizView() {
    const it = quiz.items[quiz.i], q = it.q, n = quiz.items.length;
    const pct = (quiz.i + (quiz.done ? 1 : 0)) / n * 100;
    const opts = it.opts.map((o, k) => {
      let cls = '';
      if (quiz.done) { if (k === it.ci) cls = 'ok'; else if (k === quiz.sel) cls = 'bad'; else cls = 'dim'; }
      else if (k === quiz.sel) cls = 'sel';
      const s = cls === 'ok' ? I.ok : cls === 'bad' ? I.bad : '';
      return `<button class="opt ${cls}" data-o="${k}" ${quiz.done ? 'disabled' : ''}><span class="L">${LETTERS[k]}</span><span class="T">${md(o)}</span><span class="S">${s}</span></button>`;
    }).join('');
    let ex = '';
    if (quiz.done) {
      const last = quiz.ans[quiz.ans.length - 1];
      if (last.ok) ex = `<div class="explain ok"><h4>✓ נכון! +${last.pts} נקודות</h4><div class="why">${md(q.e)}</div></div>`;
      else if (last.revealed) ex = `<div class="explain info"><h4>💡 התשובה הנכונה</h4><div class="ans">${LETTERS[it.ci]}. ${md(q.c)}</div><div class="why"><b>למה?</b> ${md(q.e)}</div></div>`;
      else ex = `<div class="explain bad"><h4>✗ תשובה שגויה</h4><div class="ans">התשובה הנכונה: ${LETTERS[it.ci]}. ${md(q.c)}</div><div class="why"><b>למה?</b> ${md(q.e)}</div></div>`;
    }
    const btn = quiz.done
      ? `<button class="btn primary" data-act="next">${quiz.i + 1 < n ? 'לשאלה הבאה ←' : 'לתוצאות ←'}</button>`
      : `<div class="row"><button class="btn reveal" data-act="reveal">💡 גלה לי את התשובה</button><button class="btn primary" data-act="check" ${quiz.sel < 0 ? 'disabled' : ''}>בדוק תשובה</button></div>`;
    return `<div class="screen" style="padding-bottom:20px">
      <div class="qhead"><div class="t"><h3>${modeName(quiz.mode)}</h3><button class="x" data-act="quit">${I.x}</button></div>
      <div class="qmeta"><span>שאלה ${quiz.i + 1} מתוך ${n}</span>${quiz.streak >= 2 ? `<span class="streak">${I.bolt} רצף ${quiz.streak}</span>` : `<span></span>`}
      <span class="timer">⭐ ${fmt(quiz.pts)}</span></div>
      <div class="pbar"><i style="width:${pct}%"></i></div></div>
      <div class="qcard" id="qc"><div class="chips"><span class="chip lv ${q.lv === 'CCNP' ? 'p' : ''}">${q.lv}</span><span class="chip">${esc(q.t)}</span></div>
      <div class="qtext"><span class="qnum">${quiz.i + 1}.</span>${md(q.q)}</div></div>
      <div class="opts">${opts}</div>${ex}<div class="qfoot">${btn}</div></div>`;
  }
  function answer(revealed) {
    const it = quiz.items[quiz.i], q = it.q;
    const ok = !revealed && quiz.sel === it.ci;
    let pts = 0;
    if (ok) {
      quiz.streak++; quiz.best = Math.max(quiz.best, quiz.streak);
      pts = q.lv === 'CCNP' ? 15 : 10;
      if (quiz.streak >= 3) pts += Math.min(10, (quiz.streak - 2) * 2);
      quiz.pts += pts;
    } else quiz.streak = 0;
    quiz.ans.push({ id: q.id, ok, sel: revealed ? -1 : quiz.sel, revealed: !!revealed, pts, it });
    S.seen[q.id] = 1; S.answered++;
    const tp = S.topic[q.t] || (S.topic[q.t] = { a: 0, c: 0 }); tp.a++; if (ok) tp.c++;
    S.level[q.lv].a++; if (ok) S.level[q.lv].c++;
    save();
    quiz.done = true;
    render();
    if (ok) { const g = document.createElement('div'); g.className = 'gain'; g.textContent = '+' + pts; document.body.appendChild(g); setTimeout(() => g.remove(), 1000); $('#qc').classList.add('pop'); vib(30); }
    else if (revealed) { setTimeout(() => { const e = $('.explain'); e && e.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); }
    else { $('#qc').classList.add('shake'); vib([60, 40, 60]); setTimeout(() => { const e = $('.explain'); e && e.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); }
  }
  function next() {
    if (quiz.i + 1 < quiz.items.length) { quiz.i++; quiz.sel = -1; quiz.done = false; render(); window.scrollTo(0, 0); }
    else finish();
  }
  function finish() {
    const n = quiz.items.length, c = quiz.ans.filter(a => a.ok).length, pct = Math.round(c / n * 100);
    const bonus = pct === 100 ? 50 : pct >= 90 ? 20 : 0;
    quiz.pts += bonus; quiz.bonus = bonus;
    S.points += quiz.pts; S.bestStreak = Math.max(S.bestStreak, quiz.best);
    S.quizzes.push({ ts: Date.now(), mode: quiz.mode, n, c, pct, pts: quiz.pts });
    if (S.quizzes.length > 500) S.quizzes.shift();
    save();
    quiz.result = { n, c, pct };
    go('result');
    if (pct >= 70) confetti();
  }
  function confirmQuit() {
    sheet(`<h3>לצאת מהמבחן?</h3><p>ההתקדמות במבחן הנוכחי לא תישמר בממוצע. התשובות שכבר ענית נספרות בסטטיסטיקה.</p>
      <div class="row"><button class="btn soft" data-close>להמשיך</button><button class="btn primary" id="qq">לצאת</button></div>`,
      el => { $('#qq', el).onclick = () => { el.remove(); quiz = null; go('home'); }; });
  }

  /* ------------------------------------------------ result */
  function resultView() {
    const r = quiz.result;
    const title = r.pct >= 90 ? 'מצוין! אתה מוכן למבחן' : r.pct >= 70 ? 'כל הכבוד!' : r.pct >= 50 ? 'לא רע – ממשיכים להתאמן' : 'צריך עוד קצת תרגול';
    const wrong = quiz.ans.filter(a => !a.ok), revealedN = quiz.ans.filter(a => a.revealed).length;
    const rev = wrong.map(a => `<div class="review"><div class="q">${md(a.it.q.q)}</div>
      <div class="your">${a.revealed ? '💡 ביקשת לגלות את התשובה' : '✗ ענית: ' + md(a.it.opts[a.sel])}</div>
      <div class="right">✓ נכון: ${md(a.it.q.c)}</div><div class="why">${md(a.it.q.e)}</div></div>`).join('');
    return `<div class="screen" style="padding-bottom:30px"><div class="res-wrap">
      <div class="res" id="res"><div class="confetti" id="cf"></div>${I.bigTrophy}
      <h2>${title}</h2><div class="score">${r.pct}%</div>
      <div class="sub">ענית נכון על <b>${r.c} מתוך ${r.n}</b> שאלות${revealedN ? ` · ${revealedN} תשובות נחשפו` : ''}</div>
      <div class="res-grid"><div><b>+${fmt(quiz.pts)}</b><small>נקודות</small></div><div><b>${quiz.best}</b><small>רצף שיא</small></div><div><b>${Math.round(avg())}%</b><small>ממוצע כללי</small></div></div>
      ${quiz.bonus ? `<div class="sub" style="margin-top:6px">כולל בונוס של <b>${quiz.bonus}</b> נקודות על ציון גבוה 🎉</div>` : ''}</div>
      <div style="margin-top:14px" class="row"><button class="btn primary" data-act="again">מבחן נוסף</button><button class="btn ghost" data-act="shareRes">${I.share} שתף ואתגר</button></div>
      <button class="btn soft" style="margin-top:10px" data-go="home">לדף הבית</button>
      ${wrong.length ? `<div class="sec-title" style="margin-top:22px"><h2>סקירת טעויות ותשובות שנחשפו</h2><span>${wrong.length} שאלות</span></div>${rev}` : `<div class="empty">אין טעויות במבחן הזה – מושלם! 🏆</div>`}
      </div></div>`;
  }
  function confetti() {
    const cf = $('#cf'); if (!cf) return;
    const cols = ['#1554D1', '#2B6BEA', '#F5B301', '#0A2A6B', '#7DB2FF'];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%'; s.style.background = cols[i % cols.length];
      s.style.animationDelay = Math.random() * .8 + 's'; s.style.transform = `rotate(${Math.random() * 180}deg)`;
      cf.appendChild(s);
    }
  }

  /* ------------------------------------------------ league */
  function leagueView() {
    const me = { id: S.profile.id, name: S.profile.name, color: S.profile.color, avg: avg(), pts: S.points, q: S.quizzes.length, me: true };
    const list = [me, ...Object.entries(S.friends).map(([id, f]) => Object.assign({ id }, f))]
      .sort((a, b) => (b.q ? b.avg : -1) - (a.q ? a.avg : -1) || b.pts - a.pts);
    const top = list.slice(0, 3);
    const pod = (p, k) => p ? `<div class="pod p${k + 1}"><div class="av" style="background:${p.color}">${k === 0 ? `<span class="crown">${I.crown}</span>` : ''}${esc(initial(p.name))}</div><div class="nm">${esc(p.name)}${p.me ? ' (אני)' : ''}</div><div class="bar">${p.q ? Math.round(p.avg) + '%' : '—'}</div></div>` : '<div class="pod"></div>';
    const rows = list.map((p, k) => `<div class="lb-row ${p.me ? 'me' : ''}"><div class="rk">${k + 1}</div><div class="av" style="background:${p.color}">${esc(initial(p.name))}</div>
      <div class="nm"><b>${esc(p.name)}${p.me ? ' (אני)' : ''}</b><small>${fmt(p.pts)} נק׳ · ${p.q} מבחנים${p.t ? ' · עודכן ' + ago(p.t) : ''}</small></div>
      <div class="sc"><b>${p.q ? Math.round(p.avg) + '%' : '—'}</b><small>ממוצע</small></div>${p.me ? '' : `<button class="del" data-del="${p.id}">${I.trash}</button>`}</div>`).join('');
    return `<div class="screen"><div class="page-head"><h2>ליגת חברים</h2><p>הדירוג לפי ממוצע הציונים מאז ההצטרפות. שלחו זה לזה את הקוד האישי – והטבלה מתעדכנת אצל כולם.</p>
      ${list.length > 1 ? `<div class="podium">${pod(top[1], 1)}${pod(top[0], 0)}${pod(top[2], 2)}</div>` : ''}</div>
      <div class="section"><div class="row"><button class="btn primary" data-act="invite">${I.share} הזמנת חברים</button><button class="btn ghost" data-act="addFriend">${I.plus} הוספת חבר</button></div></div>
      <div class="section"><div class="lb">${rows}</div>
      ${list.length === 1 ? `<div class="empty">עדיין אין חברים בליגה.<br>לחצו על <b>הזמנת חברים</b> ושלחו את ההזמנה בוואטסאפ. כשחבר ישלח לכם בחזרה את הקוד שלו – הדביקו אותו ב<b>הוספת חבר</b>.</div>` : ''}
      <div class="card" style="margin-top:12px"><h3>איך זה עובד?</h3><div class="why" style="font-size:13.5px;line-height:1.7;color:var(--ink-2)">
      1. לוחצים על <b>הזמנת חברים</b> ושולחים את ההודעה עם הקוד האישי.<br>2. החבר מתקין את נטקוויז ומדביק את הקוד שלכם ב<b>הוספת חבר</b>.<br>3. הוא שולח לכם את הקוד שלו, ואתם מדביקים אותו אצלכם.<br>4. אחרי כל כמה מבחנים, שתפו שוב את הקוד – כך הציונים מתעדכנים בטבלה.</div></div></div></div>`;
  }
  function ago(t) {
    const d = (Date.now() - t) / 60000;
    if (d < 60) return 'לפני ' + Math.max(1, Math.round(d)) + ' דק׳';
    if (d < 1440) return 'לפני ' + Math.round(d / 60) + ' שע׳';
    return 'לפני ' + Math.round(d / 1440) + ' ימים';
  }
  function addFriendSheet() {
    sheet(`<h3>הוספת חבר לליגה</h3><p>הדביקו כאן את ההודעה או את הקוד שהחבר שלח (מתחיל ב־NQ1). אפשר להדביק כמה קודים בבת אחת.</p>
      <textarea class="field" id="fc" rows="4" placeholder="הדביקו כאן…" style="resize:none;direction:ltr;text-align:left"></textarea>
      <button class="btn primary" id="fadd">הוסף לליגה</button>
      <p style="margin-top:16px;margin-bottom:6px"><b>הקוד האישי שלך</b></p><div class="codebox">${myCode()}</div>
      <button class="btn soft" id="fcopy">העתקת הקוד שלי</button>`,
      el => {
        $('#fadd', el).onclick = () => {
          const r = readCodes($('#fc', el).value);
          if (r.added || r.updated) { el.remove(); toast(r.added ? `נוספו ${r.added} חברים לליגה 🎉` : 'הציונים עודכנו'); render(); }
          else toast(r.bad ? 'הקוד לא תקין – בדקו שהועתק במלואו' : 'לא נמצא קוד חדש');
        };
        $('#fcopy', el).onclick = () => copy(myCode());
      });
  }

  /* ------------------------------------------------ stats */
  function statsView() {
    const tot = S.level.CCNA.a + S.level.CCNP.a, cor = S.level.CCNA.c + S.level.CCNP.c;
    const bar = (lbl, c, a) => `<div class="bar-row"><div class="lbl"><span>${esc(lbl)}</span><span>${a ? Math.round(c / a * 100) + '%' : '—'} · ${c}/${a}</span></div><div class="track"><i style="width:${a ? c / a * 100 : 0}%"></i></div></div>`;
    const topics = Object.entries(S.topic).filter(([, v]) => v.a >= 1).sort((x, y) => x[1].c / x[1].a - y[1].c / y[1].a);
    const last = S.quizzes.slice(-10);
    const coveredA = Q.filter(q => q.lv === 'CCNA' && S.seen[q.id]).length, coveredP = Q.filter(q => q.lv === 'CCNP' && S.seen[q.id]).length;
    return `<div class="screen"><div class="page-head"><h2>ההתקדמות שלי</h2><p>${esc(S.profile.name)} · הצטרפת ב־${new Date(S.profile.created).toLocaleDateString('he-IL')}</p></div>
      <div class="section"><div class="stats" style="margin:0"><div class="stat"><div class="v">${tot ? Math.round(cor / tot * 100) + '%' : '—'}</div><div class="k">דיוק כללי</div></div>
      <div class="stat"><div class="v">${S.answered}</div><div class="k">שאלות שנענו</div></div><div class="stat"><div class="v gold">${S.bestStreak}</div><div class="k">רצף שיא</div></div></div></div>
      <div class="section"><div class="card"><h3>לפי מסלול</h3>${bar('CCNA', S.level.CCNA.c, S.level.CCNA.a)}${bar('CCNP', S.level.CCNP.c, S.level.CCNP.a)}
      <div style="font-size:12.5px;color:var(--muted);margin-top:6px">כיסוי המאגר: ${coveredA} מתוך ${Q.filter(q => q.lv === 'CCNA').length} שאלות CCNA, ‏${coveredP} מתוך ${Q.filter(q => q.lv === 'CCNP').length} שאלות CCNP</div></div>
      <div class="card"><h3>10 המבחנים האחרונים</h3>${last.length ? `<div class="hist">${last.map(q => `<div style="height:${Math.max(4, q.pct)}%"><span>${q.pct}</span></div>`).join('')}</div>` : '<div class="empty">עוד לא נערכו מבחנים</div>'}</div>
      <div class="card"><h3>נושאים לחיזוק</h3>${topics.length ? topics.slice(0, 10).map(([t, v]) => bar(t, v.c, v.a)).join('') : '<div class="empty">ענו על כמה שאלות כדי לראות כאן ניתוח</div>'}</div>
      <div class="row"><button class="btn soft" data-act="profile">עריכת פרופיל</button><button class="btn ghost" data-act="reset">איפוס נתונים</button></div></div></div>`;
  }
  function profileSheet() {
    let color = S.profile.color;
    sheet(`<h3>עריכת פרופיל</h3><input class="field" id="pn" maxlength="20" value="${esc(S.profile.name)}">
      <div class="colors">${COLORS.map(c => `<button data-c="${c}" class="${c === color ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>
      <button class="btn primary" id="ps">שמירה</button>`,
      el => {
        el.querySelectorAll('.colors button').forEach(b => b.onclick = () => { el.querySelectorAll('.colors button').forEach(x => x.classList.remove('on')); b.classList.add('on'); color = b.dataset.c; });
        $('#ps', el).onclick = () => { const v = $('#pn', el).value.trim(); if (v.length < 2) return toast('שם קצר מדי'); S.profile.name = v; S.profile.color = color; save(); el.remove(); render(); };
      });
  }

  /* ------------------------------------------------ sheet + binding */
  function sheet(html, onReady) {
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<div class="sheet"><div class="grab"></div>${html}</div>`;
    o.addEventListener('click', e => { if (e.target === o || e.target.hasAttribute('data-close')) o.remove(); });
    document.body.appendChild(o); onReady && onReady(o);
  }
  function bind() {
    app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
    app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.prefs.mode = b.dataset.mode; save(); render(); });
    app.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { S.prefs.n = +b.dataset.n; save(); render(); });
    app.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      if (quiz.done) return; quiz.sel = +b.dataset.o;
      app.querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
      const ck = $('[data-act="check"]'); if (ck) ck.disabled = false;
    });
    app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { delete S.friends[b.dataset.del]; save(); render(); });
    app.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'start') startQuiz(false);
      else if (a === 'weak') startQuiz(true);
      else if (a === 'check') answer(false);
      else if (a === 'reveal') answer(true);
      else if (a === 'next') next();
      else if (a === 'quit') confirmQuit();
      else if (a === 'again') startQuiz(quiz && quiz.mode === 'WEAK');
      else if (a === 'shareRes') doShare(shareText(`השגתי ${quiz.result.pct}% ב${modeName(quiz.mode)} (${quiz.result.c}/${quiz.result.n}) 💪`));
      else if (a === 'invite') doShare(shareText());
      else if (a === 'addFriend') addFriendSheet();
      else if (a === 'profile') profileSheet();
      else if (a === 'reset') sheet(`<h3>לאפס את כל הנתונים?</h3><p>הנקודות, ההיסטוריה והחברים יימחקו מהמכשיר. אי אפשר לבטל את הפעולה.</p><div class="row"><button class="btn soft" data-close>ביטול</button><button class="btn primary" id="rr" style="background:#D92D20;box-shadow:none">איפוס</button></div>`,
        el => { $('#rr', el).onclick = () => { const p = S.profile; S = blank(); S.profile = p; save(); el.remove(); go('home'); }; });
    });
  }

  // codes passed in the URL hash (e.g. opened from a link) are imported automatically
  if (S.profile && location.hash.indexOf('NQ1.') >= 0) { const r = readCodes(decodeURIComponent(location.hash)); if (r.added) screen = 'league'; }
  render();
})();
