import { chapters, intro } from './content.js';

const app = document.getElementById('app');
let current = 'cover';

/* 打卡状态持久化 */
const store = {
  key: 'agent-learn-progress',
  load() {
    try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; }
  },
  save(data) { localStorage.setItem(this.key, JSON.stringify(data)); },
};
let progress = store.load();
const mark = (id, on) => { progress[id] = !!on; store.save(progress); };

const isDone = (id) => !!progress[id];
function toggle(id, el) { mark(id, !isDone(id)); render(); }

/* 渲染顶栏 + 进度 */
function renderTop() {
  const total = chapters.length;
  const done = chapters.filter((c) => isDone(c.id)).length;
  const pct = Math.round((done / total) * 100);
  const hasProgress = Object.keys(progress).length > 0;
  app.innerHTML = `
    <div class="topbar">
      <button class="menu-btn" data-menu aria-label="打开目录">
        <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div class="brand">Agent 原理精修<small>求职学习站 · 梁梓渤</small></div>
      <div class="progress"><span id="pbar" style="width:${pct}%"></span></div>
      <div class="pct" id="ppct">${pct}%</div>
      ${hasProgress ? '<button class="reset-btn" data-reset title="重置所有进度">↺</button>' : ''}
    </div>
    <div class="sidebar-overlay" data-overlay></div>
    <div class="layout">
      <aside class="sidebar" id="sidebar">${renderNav()}</aside>
      <main class="main" id="main"></main>
    </div>`;
}

function renderNav() {
  const groups = [
    { title: '原理主课', ids: ['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'] },
    { title: '进阶 · 视野', ids: ['ch85', 'ch12', 'hard', 'rag', 'prompt', 'sec', 'cap'] },
    { title: '认知 · 未来', ids: ['human'] },
    { title: '产品 · 冲刺', ids: ['prod', 'sprint'] },
    { title: '面试 · 行为面', ids: ['hr', 'star'] },
    { title: '计划 · 打卡', ids: ['plan', 'course'] },
  ];
  return groups.map((g) => {
    const items = g.ids.map((id) => {
      const c = chapters.find((x) => x.id === id);
      const on = isDone(id);
      return `<div class="nav-item ${current === id ? 'active' : ''}" data-id="${id}">
        <span class="no">${c.no}</span>
        <span class="t">${c.title}</span>
        <span class="done ${on ? 'on' : ''}" data-done="${id}" title="${on ? '已完成' : '标记完成'}"></span>
      </div>`;
    }).join('');
    return `<h3>${g.title}</h3><div class="nav-group">${items}</div>`;
  }).join('');
}

function renderView() {
  const main = document.getElementById('main');
  if (current === 'cover') { main.innerHTML = coverView(); bindCover(); return; }
  const c = chapters.find((x) => x.id === current);
  main.innerHTML = chapterView(c);
  bindChapter(c);
}

/* 封面 */
function coverView() {
  const stats = intro.stats.map((s) => `<div class="stat"><div class="n">${s.k}</div><div class="l">${s.label}</div></div>`).join('');
  return `
    <div class="view on">
      <div class="cover">
        <div class="kicker">求职学习 · Agent 精修线</div>
        <h1>${intro.slogan}</h1>
        <p class="sub">${intro.sub}</p>
        <div class="stats">${stats}</div>
        <div class="start">
          <button class="btn" data-go="ch0">开始学习 · 第 1 章</button>
          <button class="btn ghost" data-go="plan">看 8 天计划</button>
        </div>
        <div class="kbd-hint">
          <span><kbd>→</kbd> 下一节</span>
          <span><kbd>←</kbd> 上一节</span>
          <span><kbd>Home</kbd> 回封面</span>
          <span><kbd>Esc</kbd> 回封面</span>
        </div>
      </div>
    </div>`;
}
function bindCover() {
  app.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { current = b.dataset.go; render(); scrollTo(0, 0); }));
}

/* 章节页 */
function chapterView(c) {
  let body = '';
  if (c.content) body += c.content.map((s) => `<div class="section"><h4>${s.h}</h4><p>${s.p.replace(/\n/g, '<br>')}</p></div>`).join('');
  if (c.points) body += `<div class="section"><h4>要点速记</h4><div class="points">${c.points.map((p) => `<span class="point">${p}</span>`).join('')}</div></div>`;
  if (c.cards) {
    let cardTitle = '速卡';
    let cardHint = '点右上角「揭」逐张看答案，先盖住自己说';
    if (c.id === 'prod') { cardTitle = '9 张产品题速卡'; }
    else if (c.id === 'hr') { cardTitle = 'HR 行为面 10 问'; cardHint = '点右上角「揭」看回答模板 + HR 真实意图'; }
    else if (c.id === 'hard') { cardTitle = '大厂 Agent 硬核 13 问'; cardHint = '点右上角「揭」看深度答案 + 面试官考察意图，先看题自己答'; }
    else if (c.id === 'rag') { cardTitle = 'RAG 深度 14 问'; cardHint = '点右上角「揭」看深度答案 + 面试官考察意图，先看题自己答'; }
    else if (c.id === 'prompt') { cardTitle = '提示词工程 6 问'; cardHint = '点右上角「揭」看深度答案 + 面试官考察意图，先看题自己答'; }
    else if (c.id === 'sec') { cardTitle = 'Agent 安全 6 问'; cardHint = '点右上角「揭」看深度答案 + 面试官考察意图，先看题自己答'; }
    else if (c.id === 'cap') { cardTitle = '模型能力 6 问'; cardHint = '点右上角「揭」看深度答案 + 面试官考察意图，先看题自己答'; }
    else if (c.id === 'human') { cardTitle = 'AI 时代人类该学什么'; cardHint = '点右上角「揭」看深度答案 + 面试官考察意图，先看题自己答'; }
    body += `<div class="section"><h4>${cardTitle}</h4><div class="cards-hint">${cardHint}</div><div class="cards">${c.cards.map((k, i) => `
      <div class="card" data-card="${i}">
        <span class="toggle" data-i="${i}">揭</span>
        <h5>${k.title}</h5>
        <div class="ans">
          ${k.body}
          ${k.intent ? `<div class="intent"><span class="intent-tag">面试官考察</span>${k.intent}</div>` : ''}
        </div>
      </div>`).join('')}</div></div>`;
  }
  if (c.tenQ) body += `<div class="section"><h4>Agent 原理 10 问</h4><div class="qa">${c.tenQ.map((x) => `<div class="qa-row"><div class="q">${x.q}</div><div class="a">${x.a}</div></div>`).join('')}</div></div>`;
  if (c.golden) body += `<div class="section"><h4>4 句万能金句</h4><div class="goldens">${c.golden.map((g) => `<div class="golden">${g}</div>`).join('')}</div></div>`;
  if (c.sprint) body += `<div class="section"><h4>进门前冲刺</h4><ul class="sprint-list">${c.sprint.map((s, i) => `<li data-i="${i + 1}">${s}</li>`).join('')}</ul></div>`;
  if (c.plan) body += `<div class="section"><h4>8 天主线</h4><div class="plan">${c.plan.map((p) => `<div class="plan-row"><div class="d">Day ${p.day}</div><div class="name">${p.name}</div><ul>${p.tasks.map((t) => `<li>${t}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
  if (c.course) body += `<div class="section"><h4>AI for Everyone · 12 节</h4><div class="course">${c.course.map((m, mi) => `
      <div class="course-m"><h5>${m.m}</h5><ul>${m.secs.map((s, si) => {
        const key = `course-${mi}-${si}`;
        const on = !!progress[key];
        return `<li class="${on ? 'done' : ''}"><span class="chk ${on ? 'on' : ''}" data-course="${key}"></span>${s}</li>`;
      }).join('')}</ul></div>`).join('')}</div></div>`;
  if (c.quiz) body += `<div class="section"><h4>闭卷自测</h4><div class="quiz">${c.quiz.map((z, i) => `
      <div class="quiz-item" data-q="${i}">
        <div class="q">${z.q}</div>
        <div class="a">
          ${z.a}
          ${z.intent ? `<div class="intent"><span class="intent-tag">面试官考察</span>${z.intent}</div>` : ''}
        </div>
        <span class="btn-toggle" data-i="${i}">显示答案</span>
      </div>`).join('')}</div></div>`;

  const idx = chapters.findIndex((x) => x.id === c.id);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];
  const on = isDone(c.id);
  return `
    <div class="view on">
      <article class="chapter">
        <div class="meta"><span class="no">${c.no}</span><span class="tag">${c.tag}</span></div>
        <h2>${c.title}</h2>
        <div class="subline">${c.sub} · 约 ${c.readMinutes} 分钟</div>
        ${body}
        <div class="finish">
          <button class="btn ${on ? '' : 'ghost'}" data-finish="${c.id}">${on ? '✓ 已完成，点击撤销' : '标记本节完成'}</button>
          <div class="state ${on ? 'on' : ''}">${on ? '已计入进度' : '学完可点此节'}</div>
        </div>
        <div class="page-foot">
          ${prev ? `<div class="pf-btn" data-go="${prev.id}"><div class="l">上一节</div><div class="t">${prev.title}</div></div>` : '<div></div>'}
          ${next ? `<div class="pf-btn next" data-go="${next.id}"><div class="l">下一节</div><div class="t">${next.title}</div></div>` : `<div class="pf-btn next" data-go="cover"><div class="l">返回</div><div class="t">封面</div></div>`}
        </div>
      </article>
    </div>`;
}

function bindChapter(c) {
  app.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { current = b.dataset.go; render(); scrollTo(0, 0); }));
  app.querySelectorAll('[data-finish]').forEach((b) => b.addEventListener('click', () => toggle(b.dataset.finish, b)));
  app.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('reveal');
      const t = card.querySelector('.toggle');
      t.textContent = card.classList.contains('reveal') ? '盖' : '揭';
    });
  });
  app.querySelectorAll('.quiz-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-toggle') || e.target === item) item.classList.toggle('open');
      const t = item.querySelector('.btn-toggle');
      t.textContent = item.classList.contains('open') ? '收起' : '显示答案';
    });
  });
  app.querySelectorAll('[data-course]').forEach((el) => el.addEventListener('click', () => toggle(el.dataset.course, el)));
}

/* 导航事件（委托一次） */
app.addEventListener('click', (e) => {
  const menuBtn = e.target.closest('[data-menu]');
  if (menuBtn) {
    const sb = document.getElementById('sidebar');
    const ov = document.querySelector('[data-overlay]');
    if (sb) sb.classList.toggle('on');
    if (ov) ov.classList.toggle('on');
    return;
  }
  const resetBtn = e.target.closest('[data-reset]');
  if (resetBtn) {
    if (confirm('确认重置所有学习进度？')) {
      progress = {};
      store.save(progress);
      current = 'cover';
      render();
      scrollTo(0, 0);
    }
    return;
  }
  const ov = e.target.closest('[data-overlay]');
  if (ov) {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('on');
    ov.classList.remove('on');
    return;
  }
  const item = e.target.closest('.nav-item');
  if (item) {
    current = item.dataset.id;
    render();
    scrollTo(0, 0);
    const sb = document.getElementById('sidebar');
    const ovEl = document.querySelector('[data-overlay]');
    if (sb) sb.classList.remove('on');
    if (ovEl) ovEl.classList.remove('on');
    return;
  }
  const done = e.target.closest('[data-done]');
  if (done && e.target === done) { toggle(done.dataset.done, done); return; }
});

/* 键盘快捷键 */
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

  const idx = chapters.findIndex((c) => c.id === current);
  if (e.key === 'ArrowRight' || e.key === 'j') {
    e.preventDefault();
    const next = chapters[idx + 1];
    current = next ? next.id : 'cover';
    render(); scrollTo(0, 0);
  } else if (e.key === 'ArrowLeft' || e.key === 'k') {
    e.preventDefault();
    const prev = idx > 0 ? chapters[idx - 1] : null;
    current = prev ? prev.id : 'cover';
    render(); scrollTo(0, 0);
  } else if (e.key === 'Home' || e.key === 'Escape') {
    e.preventDefault();
    current = 'cover';
    render(); scrollTo(0, 0);
  }
});

function render() { renderTop(); renderView(); }
render();
