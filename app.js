const KEY = "levelup-web-state";

let state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  name: "Hunter",
  weight: 105,
  target: 80,
  phase: 1,
  xp: 320,
  quests: [false, false, false, false],
  weights: [],
  workouts: [],
  messages: [],
  tab: 0,
  started: Date.now()
};

let sessionStart = Date.now();

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function login() {
  const input = document.getElementById("nameInput");
  const n = input.value.trim() || "Hunter";
  state.name = n;
  save();

  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  render();
}

function logout() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
}

function showTab(t) {
  state.tab = t;
  save();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function pct() {
  return Math.max(0, Math.min(100, Math.round((state.xp % 1000) / 10)));
}

function card(title, body, cls = "") {
  return `<div class="card ${cls}">
    ${title ? `<div class="label">${title}</div>` : ""}
    ${body}
  </div>`;
}

function toggleQuest(i) {
  state.quests[i] = !state.quests[i];
  state.xp += state.quests[i] ? (i === 2 ? 150 : 100) : (i === 2 ? -150 : -100);
  state.xp = Math.max(0, state.xp);
  save();
  render();
}

function logWeight() {
  const el = document.getElementById("weight");
  const note = document.getElementById("weightNote");
  const w = parseFloat(el.value);

  if (!Number.isFinite(w) || w < 20 || w > 300) {
    alert("Enter a valid weight.");
    return;
  }

  state.weight = w;
  state.weights.push({
    w,
    d: new Date().toLocaleDateString(),
    n: note ? note.value.trim() : ""
  });

  state.xp += 50;
  save();
  render();
}

function logWorkout(exercise) {
  state.workouts.push(`${exercise} • ${new Date().toLocaleDateString()}`);
  state.xp += 100;
  save();
  render();
}

function dashboard() {
  const done = state.quests.filter(Boolean).length;
  const level = Math.floor(state.xp / 1000) + 1;

  return `
    <div class="hero glow">
      <div class="eyebrow">SYSTEM ONLINE • WELCOME, ${escapeHtml(state.name.toUpperCase())}</div>
      <h2>LEVEL UP YOUR LIFE.</h2>
      <div class="rank">RANK ${state.phase >= 5 ? "S" : "E"} HUNTER • LEVEL ${level}</div>
      <p class="muted">Build strength. Complete quests. Unlock your next phase.</p>
      <div class="progress"><i style="width:${pct()}%"></i></div>
      <p class="note">${state.xp} XP • ${1000 - (state.xp % 1000)} XP to next level</p>
    </div>

    <div class="grid">
      ${card("CURRENT WEIGHT", `<div class="stat">${state.weight} <small>kg</small></div>`)}
      ${card("TARGET", `<div class="stat gold">${state.target} <small>kg</small></div>`)}
      ${card("PHASE", `<div class="stat purple">${state.phase}</div>`)}
      ${card("QUESTS", `<div class="stat green-t">${done}/4</div>`)}
    </div>

    <h3 class="section-title">⚡ TODAY'S SYSTEM</h3>

    <div class="grid">
      ${card("Daily Momentum", `
        <b>Finish your quests</b>
        <p class="muted">Complete missions and log a workout to earn XP.</p>
        <button class="small-btn" onclick="showTab(1)">VIEW QUESTS</button>
      `)}

      ${card("Quick Workout", `
        <b>Forge your body</b>
        <p class="muted">Choose a workout that fits your current level.</p>
        <button class="small-btn" onclick="showTab(3)">OPEN FORGE</button>
      `)}
    </div>

    <div class="card">
      <div class="row">
        <b>Progress to target</b>
        <span class="pill">${Math.max(0, Math.round(((105 - state.weight) / 25) * 100))}%</span>
      </div>
      <div class="progress"><i style="width:${Math.max(0, Math.min(100, ((105 - state.weight) / 25) * 100))}%"></i></div>
      <p class="note">${Math.max(0, state.weight - state.target).toFixed(1)} kg remaining</p>
    </div>
  `;
}

function quests() {
  const qs = [
    "Walk / cardio session",
    "Drink enough water",
    "Complete strength workout",
    "Log today's progress"
  ];

  return `
    <div class="hero">
      <div class="eyebrow">DAILY QUEST BOARD</div>
      <h2>QUESTS</h2>
      <p class="muted">Complete missions to earn XP and maintain momentum.</p>
    </div>

    <h3 class="section-title">Today's Quests</h3>

    ${qs.map((q, i) => `
      <div class="card quest ${state.quests[i] ? "done" : ""}">
        <input
          type="checkbox"
          ${state.quests[i] ? "checked" : ""}
          onchange="toggleQuest(${i})"
        >
        <div>
          <b>${q}</b>
          <div class="note">+${i === 2 ? 150 : 100} XP</div>
        </div>
      </div>
    `).join("")}
  `;
}

function phase() {
  const lost = Math.max(0, 105 - state.weight);
  const remaining = Math.max(0, state.weight - state.target);
  const progress = Math.max(0, Math.min(100, (lost / 25) * 100));

  return `
    <div class="hero">
      <div class="eyebrow">TRANSFORMATION PROTOCOL</div>
      <h2>PHASE ${state.phase}</h2>
      <p class="muted">Track your weight and move toward your target.</p>
    </div>

    <div class="grid">
      ${card("STARTING", `<div class="stat">105 <small>kg</small></div>`)}
      ${card("CURRENT", `<div class="stat">${state.weight} <small>kg</small></div>`)}
      ${card("TARGET", `<div class="stat gold">${state.target} <small>kg</small></div>`)}
    </div>

    <div class="card">
      <div class="row">
        <b>Progress to target</b>
        <span class="pill">${Math.round(progress)}%</span>
      </div>
      <div class="progress"><i style="width:${progress}%"></i></div>
      <p class="muted">${remaining.toFixed(1)} kg remaining</p>

      <div class="form">
        <input id="weight" type="number" step="0.1" placeholder="Weight (kg)">
        <input id="weightNote" type="text" maxlength="40" placeholder="Note">
        <button class="primary" onclick="logWeight()">LOG WEIGHT</button>
      </div>
    </div>

    <h3 class="section-title">Recent Logs</h3>
    ${state.weights.length
      ? state.weights.slice(-5).reverse().map(x =>
          `<div class="card row"><b>${x.w} kg</b><span class="note">${x.d}${x.n ? " • " + escapeHtml(x.n) : ""}</span></div>`
        ).join("")
      : `<div class="card"><p class="muted">No weight logs yet. Add your first measurement above.</p></div>`
    }
  `;
}

function forge() {
  const ex = ["Squats", "Push-ups", "Lunges", "Plank", "Dumbbell Row"];

  return `
    <div class="hero">
      <div class="eyebrow">TRAINING FACILITY</div>
      <h2>FORGE</h2>
      <p class="muted">Choose an exercise and record your training.</p>
    </div>

    <div class="grid">
      ${ex.map((e, i) => card(e, `
        <div class="row">
          <span class="pill">${i === 3 ? "CORE" : i < 2 ? "STRENGTH" : "FULL BODY"}</span>
          <b>${i === 3 ? "3 × 30s" : "3 × 10"}</b>
        </div>
        <button class="small-btn" style="margin-top:12px" onclick="logWorkout('${e.replace(/'/g, "\\'")}')">COMPLETE</button>
      `)).join("")}
    </div>

    <h3 class="section-title">Workout History</h3>
    ${state.workouts.length
      ? state.workouts.slice(-8).reverse().map(w =>
          `<div class="card row"><b>${escapeHtml(w.split(" • ")[0])}</b><span class="green-t">+100 XP</span></div>`
        ).join("")
      : `<div class="card"><p class="muted">No workouts logged yet.</p></div>`
    }
  `;
}

function oracle() {
  const msgs = state.messages.length
    ? state.messages
    : [["AI", "Greetings Hunter. I am your Fitness Oracle. Ask a workout, nutrition or form question."]];

  return `
    <div class="hero">
      <div class="eyebrow">SYSTEM INTELLIGENCE</div>
      <h2>✦ FITNESS ORACLE</h2>
      <p class="muted">Instant guidance for workouts, nutrition and progression.</p>

      <div class="bar">
        ${["High protein meal ideas", "Best fat-loss cardio", "Fix squat knee cave"].map(x =>
          `<button class="small-btn" onclick="ask('${x.replace(/'/g, "\\'")}')">${x}</button>`
        ).join("")}
      </div>
    </div>

    <div class="card">
      ${msgs.map(m =>
        `<div class="message ${m[0] === "AI" ? "ai" : "user"}"><b>${m[0]}</b><br>${escapeHtml(m[1])}</div>`
      ).join("")}

      <div class="row" style="margin-top:12px">
        <input id="prompt" class="chat-input" placeholder="Ask the Oracle..." onkeydown="if(event.key==='Enter')sendAsk()">
        <button class="primary" style="width:auto" onclick="sendAsk()">SEND</button>
      </div>
    </div>
  `;
}

function ask(x) {
  document.getElementById("prompt").value = x;
  sendAsk();
}

function sendAsk() {
  const input = document.getElementById("prompt");
  if (!input) return;

  const p = input.value.trim();
  if (!p) return;

  state.messages.push(["USER", p]);

  let a =
    "Stay consistent: prioritize a sustainable calorie deficit, adequate protein, progressive training and recovery. For exercise form, use controlled reps and stop if you feel sharp pain. For personalized medical advice, consult a qualified professional.";

  if (/protein|meal/i.test(p)) {
    a = "Budget-friendly protein options include eggs, dal, chickpeas, milk/curd and fish or chicken when available. Build each meal around a protein source plus vegetables and a sensible portion of carbs.";
  }

  if (/cardio|fat loss|weight loss/i.test(p)) {
    a = "For fat loss, brisk walking, jogging and cycling are effective. Start at a pace you can sustain, then gradually increase duration. Nutrition and overall activity matter more than one specific cardio exercise.";
  }

  if (/squat|knee/i.test(p)) {
    a = "Try reducing load and depth temporarily, keep the knee tracking roughly over the toes, maintain a stable foot tripod and control the descent. If pain persists, get your technique assessed.";
  }

  state.messages.push(["AI", a]);
  save();
  render();
}

function badges() {
  const list = [
    ["⚡", "First Steps", "Complete your first quest", state.xp > 0],
    ["♜", "Iron Will", "Complete 5 workouts", state.workouts.length >= 5],
    ["◉", "Phase Hunter", "Log your first weight", state.weights.length > 0],
    ["✦", "Momentum", "Complete all daily quests", state.quests.every(Boolean)],
    ["♛", "Level Master", "Reach 1000 XP", state.xp >= 1000],
    ["🏆", "Target Crusher", "Reach target weight", state.weight <= state.target]
  ];

  return `
    <div class="hero">
      <div class="eyebrow">ACHIEVEMENT VAULT</div>
      <h2>BADGES</h2>
      <p class="muted">Earn achievements by proving your consistency.</p>
    </div>

    <div class="badges">
      ${list.map(b => `
        <div class="card badge ${b[3] ? "" : "locked"}">
          <div class="symbol">${b[0]}</div>
          <h3>${b[1]}</h3>
          <div class="note">${b[2]}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function render() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach(b => b.classList.toggle("active", Number(b.dataset.tab) === state.tab));

  const views = [dashboard, quests, phase, forge, oracle, badges];
  const content = document.getElementById("content");

  if (content) content.innerHTML = views[state.tab]();

  const app = document.getElementById("app");
  const loginScreen = document.getElementById("login");

  if (state.name && state.name !== "Hunter") {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
  }
}

function updateTimer() {
  const app = document.getElementById("app");
  const timer = document.getElementById("timer");

  if (!app || !timer || app.classList.contains("hidden")) return;

  const s = Math.floor((Date.now() - sessionStart) / 1000);
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const q = String(s % 60).padStart(2, "0");
  timer.textContent = `${m}:${q}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setInterval(updateTimer, 1000);

if (state.name && state.name !== "Hunter") {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

render();
