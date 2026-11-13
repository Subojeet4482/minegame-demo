/* ---------- Sound (Web Audio, same synth as original) ---------- */
let soundVolume = 0.7, audioCtx = null;
function playSound(kind) {
  if (soundVolume <= 0) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = soundVolume;
    master.connect(ctx.destination);
    const tone = (freq, start, dur, type, vol, endFreq) => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + start + dur);
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(vol, now + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g).connect(master);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    };
    if (kind === "gem") {
      tone(1300, 0, 0.12, "sine", 0.5, 1900);
      tone(2400, 0.06, 0.16, "sine", 0.3);
    } else if (kind === "cash") {
      [1500, 2000, 2500, 3000].forEach((f, i) => tone(f, i * 0.07, 0.25, "triangle", 0.35));
      tone(4000, 0.3, 0.3, "sine", 0.2);
    } else {
      const len = Math.floor(ctx.sampleRate * 0.9);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.8);
      const g = ctx.createGain();
      g.gain.value = 1.2;
      noise.connect(filter).connect(g).connect(master);
      noise.start(now);
      tone(110, 0, 0.6, "sine", 0.9, 35);
    }
  } catch (e) { /* audio unavailable */ }
}

/* ---------- Icons (lucide paths) & art ---------- */
const ICONS = {
  diamond: '<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/>',
  bomb: '<circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  infinity: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  volume: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
};
const icon = (n, size = 18, fill) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;

const GEM_SVG = '<svg class="gem-art" viewBox="0 0 100 100" role="img" aria-label="Gem"><path d="M16 33 31 17h38l15 16-34 49Z" fill="var(--gem)"/><path d="M16 33h68L50 82Z" fill="var(--gem-mid)"/><path d="M16 33 31 17l9 16Z" fill="var(--gem-light)"/><path d="M31 17h38L60 33H40Z" fill="var(--gem-top)"/><path d="m69 17 15 16H60Z" fill="var(--gem-dark)"/><path d="M16 33h24l10 49Z" fill="var(--gem-left)"/><path d="M40 33h20L50 82Z" fill="var(--gem-bright)"/><path d="M60 33h24L50 82Z" fill="var(--gem-shadow)"/></svg>';
const BOMB_SVG = '<svg class="bomb-art" viewBox="0 0 100 100" role="img" aria-label="Bomb"><path d="M56 26q1-13 17-13 14 0 10 16" fill="none" stroke="var(--bomb-fuse)" stroke-width="6" stroke-linecap="round"/><path d="M80 18 77 9m6 13 9-5m-12 8 7 8" fill="none" stroke="var(--bomb-spark)" stroke-width="4" stroke-linecap="round"/><circle cx="47" cy="54" r="31" fill="var(--bomb-body)"/><path d="M23 39q13-19 34-16" fill="none" stroke="var(--bomb-highlight)" stroke-width="6" stroke-linecap="round"/><path d="M62 49q-11 20-33 23" fill="none" stroke="var(--bomb-shadow)" stroke-width="5" stroke-linecap="round"/><path d="m55 69 3 8 4-7 8 3-5-7 6-6-9 1-2-9-4 8-8-3 5 7-6 5Z" fill="var(--bomb-spark)"/><circle cx="57" cy="66" r="3" fill="var(--bomb-core)"/></svg>';

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const TILE_COUNT = 25;
const mineChoices = Array.from({ length: 24 }, (_, i) => i + 1);
const clampMoney = (v) => Math.max(0, Math.round(v * 100) / 100);
const parseAmount = (v) => Math.max(0, Number.parseFloat(v) || 0);
const allTiles = () => new Set(Array.from({ length: TILE_COUNT }, (_, i) => i));

function createMineSet(count) {
  const p = Array.from({ length: TILE_COUNT }, (_, i) => i);
  for (let i = p.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [p[i], p[r]] = [p[r], p[i]];
  }
  return new Set(p.slice(0, count));
}
function multiplierFor(mines, picks) {
  let chance = 1;
  for (let i = 0; i < picks; i++) chance *= (TILE_COUNT - mines - i) / (TILE_COUNT - i);
  return picks === 0 ? 1 : Number((0.97 / chance).toFixed(2));
}

/* ---------- State ---------- */
const S = {
  balance: 1000, bet: "0.00", mines: 3, mode: "manual", status: "idle",
  mineSet: new Set(), revealed: new Set(), openedPicks: new Set(),
  message: "Choose your stake and start a round",
  numberOfBets: "0", advanced: false,
  onWinMode: "reset", onLossMode: "reset", onWinPercent: "0", onLossPercent: "0",
  stopProfit: "0", stopLoss: "0",
  autoRunning: false, autoRounds: 0, sessionProfit: 0, autoStartPending: false, autoPicks: [],
  flash: null, result: { multiplier: 1, amount: 0 },
  animations: true, volume: 70, instantBet: false, settingsOpen: false,
};
let initialAutoBet = 0, autoTimer = null;
const derived = () => {
  const pickedGems = S.openedPicks.size;
  const multiplier = multiplierFor(S.mines, pickedGems);
  const currentBet = parseAmount(S.bet);
  return { pickedGems, multiplier, currentBet, payout: clampMoney(currentBet * multiplier) };
};
const setBalance = (v) => { S.balance = v; $("balance").value = v.toFixed(2); };

/* ---------- Game logic ---------- */
function resetBoard() {
  S.status = "idle"; S.mineSet = new Set(); S.revealed = new Set(); S.openedPicks = new Set(); S.flash = null;
}
function beginRound() {
  const amount = parseAmount(S.bet);
  if (amount > S.balance) { S.message = "Not enough balance for this bet"; return null; }
  setBalance(clampMoney(S.balance - amount));
  const set = createMineSet(S.mines);
  S.mineSet = set; S.revealed = new Set(); S.openedPicks = new Set();
  S.status = "playing"; S.flash = null; S.message = "Round active — reveal a safe tile";
  return set;
}
function finishRound(result, winPayout = 0) {
  const amount = parseAmount(S.bet);
  const profit = result === "win" ? clampMoney(winPayout - amount) : -amount;
  if (result === "win") { setBalance(clampMoney(S.balance + winPayout)); playSound("cash"); }
  S.sessionProfit = clampMoney(S.sessionProfit + profit);
  S.status = result === "win" ? "won" : "lost";
  S.flash = result;
  S.result = { multiplier: result === "win" && amount > 0 ? Number((winPayout / amount).toFixed(2)) : 0, amount: result === "win" ? winPayout : amount };
  S.message = result === "win" ? `Cashed out $${winPayout.toFixed(2)}` : "Mine hit — round lost";
  boardFX(result === "win" ? "win" : "loss");
}
function revealTile(index, forcedMines) {
  const ms = forcedMines || S.mineSet;
  const rv = forcedMines ? new Set() : S.revealed;
  if ((!forcedMines && S.status !== "playing") || rv.has(index)) return;
  const next = new Set(rv); next.add(index);
  S.revealed = next;
  if (ms.has(index)) { playSound("boom"); S.revealed = allTiles(); finishRound("loss"); return; }
  playSound("gem");
  S.openedPicks = new Set(forcedMines ? [] : S.openedPicks).add(index);
  const safe = Array.from(next).filter((t) => !ms.has(t)).length;
  if (safe === TILE_COUNT - S.mines) {
    const final = clampMoney(parseAmount(S.bet) * multiplierFor(S.mines, safe));
    S.revealed = allTiles(); finishRound("win", final); return;
  }
  S.message = `${safe} gem${safe === 1 ? "" : "s"} found · ${multiplierFor(S.mines, safe).toFixed(2)}×`;
}
function cashout() {
  const d = derived();
  if (S.status !== "playing" || d.pickedGems === 0) return;
  S.revealed = allTiles(); finishRound("win", d.payout);
}
function randomPick() {
  if (S.status !== "playing") return;
  const hidden = Array.from({ length: TILE_COUNT }, (_, i) => i).filter((i) => !S.revealed.has(i));
  const pick = hidden[Math.floor(Math.random() * hidden.length)];
  if (pick !== undefined) revealTile(pick);
}
function applyAutoBetChange(result) {
  const m = result === "win" ? S.onWinMode : S.onLossMode;
  const pct = parseAmount(result === "win" ? S.onWinPercent : S.onLossPercent);
  if (m === "reset") S.bet = initialAutoBet.toFixed(2);
  else S.bet = clampMoney(parseAmount(S.bet) * (1 + pct / 100)).toFixed(2);
}
function stopAutobet() { S.autoRunning = false; S.message = "Autobet stopped"; }
function startAutobet() {
  const d = derived();
  const canBet = d.currentBet >= 0 && d.currentBet <= S.balance && S.status !== "playing";
  if (S.autoPicks.length === 0) { S.message = "Select the tiles Autobet should open"; return; }
  if (!canBet) { S.message = "Not enough balance for this bet"; return; }
  initialAutoBet = d.currentBet;
  if (S.status !== "idle") resetBoard();
  S.autoRounds = 0; S.sessionProfit = 0; S.autoRunning = true; S.autoStartPending = false;
  S.message = "Autobet started";
}
function toggleAutoPick(i) {
  if (S.mode !== "auto" || S.autoRunning || S.status === "playing") return;
  if (S.status !== "idle") resetBoard();
  S.autoPicks = S.autoPicks.includes(i) ? S.autoPicks.filter((t) => t !== i) : [...S.autoPicks, i];
  S.message = "Autobet will repeat your selected tiles";
}

/* Autobet loop (replaces the React effect) */
function autoEffect() {
  const target = Math.max(0, Math.floor(parseAmount(S.numberOfBets)));
  const profitLimit = parseAmount(S.stopProfit), lossLimit = parseAmount(S.stopLoss);
  if ((target > 0 && S.autoRounds >= target) || (profitLimit > 0 && S.sessionProfit >= profitLimit) || (lossLimit > 0 && S.sessionProfit <= -lossLimit)) {
    S.autoRunning = false; S.message = "Autobet limit reached"; render(); return;
  }
  if (S.status === "idle" || S.status === "won" || S.status === "lost") {
    autoTimer = setTimeout(() => {
      if (S.status === "won" || S.status === "lost") {
        applyAutoBetChange(S.status === "won" ? "win" : "loss");
        resetBoard(); S.autoStartPending = true;
      } else if (S.autoStartPending) {
        if (!beginRound()) S.autoRunning = false;
        S.autoStartPending = false;
      } else if (!beginRound()) S.autoRunning = false;
      render();
    }, S.status === "idle" ? 200 : 750);
  } else if (S.status === "playing") {
    autoTimer = setTimeout(() => {
      const pick = S.autoPicks.find((i) => !S.revealed.has(i));
      if (pick === undefined) {
        const d = derived();
        S.revealed = allTiles();
        finishRound("win", clampMoney(d.currentBet * multiplierFor(S.mines, d.pickedGems)));
        S.autoRounds++;
      } else if (S.mineSet.has(pick)) {
        revealTile(pick); S.autoRounds++;
      } else {
        const next = new Set(S.revealed); next.add(pick);
        S.revealed = next;
        S.openedPicks = new Set(S.openedPicks).add(pick);
        playSound("gem");
        const safe = Array.from(next).filter((i) => !S.mineSet.has(i)).length;
        S.message = `${safe}/${S.autoPicks.length} selected tiles opened`;
      }
      render();
    }, 430);
  }
}

/* ---------- Celebration & shake effects ---------- */
function boardFX(kind) {
  if (!S.animations) return;
  const board = document.querySelector(".game-board-panel");
  if (!board) return;
  board.classList.remove("board-shake", "board-win");
  void board.offsetWidth; /* restart animation */
  if (kind === "loss") board.classList.add("board-shake");
  else { board.classList.add("board-win"); confettiBurst(board); }
}
const CONFETTI_COLORS = ["#38e07b", "#ffd24a", "#5aa9ff", "#ff6b81", "#c792ff", "#4af0d4"];
function confettiBurst(host) {
  for (let i = 0; i < 40; i++) {
    const c = document.createElement("i");
    c.className = "confetti";
    const size = 5 + Math.random() * 7;
    c.style.width = size + "px";
    c.style.height = size * (Math.random() > 0.5 ? 1 : 1.8) + "px";
    c.style.left = 50 + (Math.random() * 90 - 45) + "%";
    c.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    c.style.setProperty("--cx", (Math.random() * 160 - 80) + "px");
    c.style.setProperty("--cr", (Math.random() * 900 - 450) + "deg");
    c.style.animationDuration = 0.9 + Math.random() * 0.7 + "s";
    c.style.animationDelay = Math.random() * 0.18 + "s";
    c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    host.appendChild(c);
    setTimeout(() => c.remove(), 1900);
  }
}

/* Ambient floating gems behind the board */
function spawnAmbientGems() {
  const board = document.querySelector(".game-board-panel");
  if (!board) return;
  for (let i = 0; i < 7; i++) {
    const f = document.createElement("span");
    f.className = "ambient-gem";
    f.innerHTML = GEM_SVG;
    f.style.left = (5 + Math.random() * 88) + "%";
    f.style.animationDuration = (7 + Math.random() * 6).toFixed(2) + "s";
    f.style.animationDelay = (-Math.random() * 10).toFixed(2) + "s";
    f.style.width = (14 + Math.random() * 22) + "px";
    board.appendChild(f);
  }
}
spawnAmbientGems();

/* ---------- UI build ---------- */
document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 18); });
$("mines").innerHTML = mineChoices.map((v) => `<option value="${v}">${v}</option>`).join("");
$("mines").value = "3";

const changeSetting = (key, label) => `<div class="field-group"><span class="field-title">${label}</span><div class="change-setting"><button type="button" data-k="${key}" data-m="reset">Reset</button><button type="button" data-k="${key}" data-m="increase">Increase</button><div><input aria-label="${label} increase percent" inputmode="decimal" data-pct="${key}" value="0"><span>%</span></div></div></div>`;
const moneySetting = (id, label) => `<div class="field-group"><div class="field-label"><label for="${id}">${label}</label><span id="${id}Val">$0.00</span></div><div class="money-row money-row--readonly"><span>$</span><input id="${id}" inputmode="decimal" value="0"></div></div>`;
$("advancedGrid").innerHTML = changeSetting("onWin", "On Win") + changeSetting("onLoss", "On Loss") + moneySetting("profit", "Stop on Profit") + moneySetting("loss", "Stop on Loss");

const tiles = [];
for (let i = 0; i < TILE_COUNT; i++) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "mine-tile";
  b.addEventListener("click", () => {
    const canSel = S.mode === "auto" && S.status !== "playing" && !S.autoRunning;
    const canInst = S.instantBet && S.mode === "manual" && S.status !== "playing" && !S.autoRunning;
    if (canSel) toggleAutoPick(i);
    else if (canInst) { const set = beginRound(); if (set) revealTile(i, set); }
    else revealTile(i);
    render();
  });
  $("grid").appendChild(b); tiles.push(b);
}

/* ---------- Events ---------- */
const act = (fn) => () => { fn(); render(); };
$("balance").addEventListener("blur", () => { setBalance(clampMoney(parseAmount($("balance").value))); render(); });
$("balance").addEventListener("keydown", (e) => { if (e.key === "Enter") e.currentTarget.blur(); });
$("primary").addEventListener("click", act(() => {
  if (S.mode === "auto") { if (S.autoRunning) stopAutobet(); else if (S.status === "playing") cashout(); else startAutobet(); }
  else if (S.status === "playing") cashout();
  else if (S.status === "won" || S.status === "lost") resetBoard();
  else beginRound();
}));
$("bet").addEventListener("input", (e) => { S.bet = e.target.value; render(); });
$("half").addEventListener("click", act(() => { S.bet = (derived().currentBet / 2).toFixed(2); }));
$("double").addEventListener("click", act(() => { S.bet = Math.min(S.balance, derived().currentBet * 2).toFixed(2); }));
$("randomPick").addEventListener("click", act(randomPick));
$("clearPicks").addEventListener("click", act(() => { S.autoPicks = []; }));
$("mines").addEventListener("change", (e) => { S.mines = Number(e.target.value); render(); });
$("bets").addEventListener("input", (e) => { S.numberOfBets = e.target.value; });
$("advanced").addEventListener("change", (e) => { S.advanced = e.target.checked; render(); });
$("profit").addEventListener("input", (e) => { S.stopProfit = e.target.value; render(); });
$("loss").addEventListener("input", (e) => { S.stopLoss = e.target.value; render(); });
document.querySelectorAll(".change-setting button").forEach((b) => b.addEventListener("click", act(() => { S[b.dataset.k + "Mode"] = b.dataset.m; })));
document.querySelectorAll("[data-pct]").forEach((inp) => inp.addEventListener("input", () => { S[inp.dataset.pct + "Percent"] = inp.value; }));
$("tabManual").addEventListener("click", act(() => { S.mode = "manual"; }));
$("tabAuto").addEventListener("click", act(() => { S.mode = "auto"; }));
$("settingsBtn").addEventListener("click", act(() => { S.settingsOpen = !S.settingsOpen; }));
$("animations").addEventListener("change", (e) => { S.animations = e.target.checked; render(); });
$("instant").addEventListener("change", (e) => { S.instantBet = e.target.checked; render(); });
$("volume").addEventListener("input", (e) => { S.volume = Number(e.target.value); soundVolume = S.volume / 100; render(); });

/* ---------- Render ---------- */
let lastPop = "";
function render() {
  clearTimeout(autoTimer);
  const d = derived();
  const playing = S.status === "playing", auto = S.mode === "auto", locked = playing || S.autoRunning;
  const profit = Math.max(0, d.payout - d.currentBet);

  $("app").className = "app" + (S.animations ? "" : " no-anim");
  const multEl = $("mult");
  const newMult = d.multiplier.toFixed(2) + "×";
  if (multEl.textContent !== newMult && S.animations && playing) {
    multEl.classList.remove("mult-pulse");
    void multEl.offsetWidth;
    multEl.classList.add("mult-pulse");
  }
  multEl.textContent = newMult;
  $("potential").textContent = "$" + (playing ? d.payout.toFixed(2) : "0.00");
  $("msg").textContent = S.message;
  $("dot").className = "status-dot" + (S.autoRunning ? " status-dot--active" : "");

  /* tiles */
  const canSel = auto && !playing && !S.autoRunning;
  const canInst = S.instantBet && !auto && !playing && !S.autoRunning;
  tiles.forEach((el, i) => {
    const rev = S.revealed.has(i), isMine = S.mineSet.has(i), n = S.autoPicks.indexOf(i) + 1, opened = S.openedPicks.has(i);
    const cls = "mine-tile" + (n > 0 && !rev ? " mine-tile--selected" : "") + (rev ? ` mine-tile--revealed ${isMine ? "mine-tile--bomb" : "mine-tile--gem"} ${opened ? "mine-tile--picked" : "mine-tile--unpicked"}` : "");
    const html = (n > 0 && !rev ? `<span class="auto-pick-number">${n}</span>` : "") +
      (rev ? (isMine ? `<span class="bomb-shape"><i class="blast-ring"></i>${BOMB_SVG}</span>` : `<span class="gem-shape">${GEM_SVG}</span>`) : "");
    const sig = cls + "|" + html;
    if (el._sig !== sig) {
      if (el.className !== cls) el.className = cls;
      if (el._html !== html) el.innerHTML = html;
      el._sig = sig; el._html = html;
    }
    el.setAttribute("aria-label", rev && !canInst ? (isMine ? "Mine" : "Gem") : n > 0 ? `Selected tile ${n}` : `Hidden tile ${i + 1}`);
    el.disabled = !canSel && !canInst && (!playing || rev);
  });

  /* result popup */
  const popKey = S.flash ? S.flash + S.result.amount + S.result.multiplier : "";
  if (popKey !== lastPop) {
    lastPop = popKey;
    $("resultPop").innerHTML = S.flash ? `<div class="result-pop result-pop--${S.flash}"><div class="result-icon">${S.flash === "win" ? icon("diamond", 24, true) : icon("bomb", 24, true)}</div><b>${S.flash === "win" ? "YOU WON" : "MINE HIT"}</b><span>${S.flash === "win" ? S.result.multiplier.toFixed(2) + "×" : "BOOM"}</span><strong>${S.flash === "win" ? "$" + S.result.amount.toFixed(2) : "-$" + S.result.amount.toFixed(2)}</strong></div>` : "";
  }

  /* primary button */
  const p = $("primary");
  p.textContent = auto ? (S.autoRunning ? "Stop Autobet" : playing ? `Cashout $${d.payout.toFixed(2)}` : "Start Autobet")
    : playing ? `Cashout $${d.payout.toFixed(2)}` : (S.status === "won" || S.status === "lost") ? "New Round" : "Bet";
  p.disabled = playing && !S.autoRunning && d.pickedGems === 0;

  /* bet + fields */
  if ($("bet").value !== S.bet) $("bet").value = S.bet;
  $("bet").disabled = $("half").disabled = $("double").disabled = locked;
  $("betLabel").textContent = "$" + d.currentBet.toFixed(2);
  $("randomPick").hidden = auto; $("randomPick").disabled = !playing || S.autoRunning;
  $("clearPicks").hidden = !auto; $("clearPicks").disabled = S.autoRunning || S.autoPicks.length === 0;
  $("clearText").textContent = `Clear Picks (${S.autoPicks.length})`;
  $("mines").disabled = locked;
  $("gems").value = TILE_COUNT - S.mines;

  $("manualProfit").hidden = auto;
  $("profitTitle").textContent = `Total Profit (${d.multiplier.toFixed(2)}×)`;
  $("profitLabel").textContent = "$" + profit.toFixed(2);
  $("profitInput").value = playing ? profit.toFixed(2) : "0.00";

  $("autoSettings").hidden = !auto;
  $("bets").disabled = S.autoRunning;
  $("advancedGrid").hidden = !S.advanced;
  ["onWin", "onLoss"].forEach((k) => {
    const mode = S[k + "Mode"];
    document.querySelectorAll(`.change-setting button[data-k="${k}"]`).forEach((b) => { b.classList.toggle("active", b.dataset.m === mode); b.disabled = S.autoRunning; });
    const inp = document.querySelector(`[data-pct="${k}"]`);
    inp.disabled = S.autoRunning || mode === "reset";
  });
  $("profit").disabled = $("loss").disabled = S.autoRunning;
  $("profitVal").textContent = "$" + parseAmount(S.stopProfit).toFixed(2);
  $("lossVal").textContent = "$" + parseAmount(S.stopLoss).toFixed(2);
  $("sessionStats").hidden = !S.autoRunning;
  $("rounds").textContent = S.autoRounds;
  const sp = $("session");
  sp.textContent = (S.sessionProfit >= 0 ? "+" : "-") + "$" + Math.abs(S.sessionProfit).toFixed(2);
  sp.className = S.sessionProfit >= 0 ? "text-gem" : "text-destructive";

  $("tabManual").className = auto ? "" : "active"; $("tabAuto").className = auto ? "active" : "";
  $("tabManual").setAttribute("aria-selected", !auto); $("tabAuto").setAttribute("aria-selected", auto);
  $("tabManual").disabled = $("tabAuto").disabled = locked;

  $("settingsBody").hidden = !S.settingsOpen;
  $("settingsBtn").setAttribute("aria-expanded", S.settingsOpen);
  $("settingsChev").style.transform = S.settingsOpen ? "rotate(180deg)" : "";
  $("volLabel").textContent = S.volume + "%";

  if (S.autoRunning) autoEffect();
}
render();