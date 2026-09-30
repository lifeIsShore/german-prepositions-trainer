import re, json

with open('words.md', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\|\s*(\d+)\s*\|\s*\*\*(.*?)\*\*\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|'
matches = re.findall(pattern, content)

cards = []
for m in matches:
    num, verb, prep_kasus, example = m
    prep_kasus = prep_kasus.strip()
    if '+' in prep_kasus:
        parts = prep_kasus.split('+')
        prep = parts[0].strip()
        kasus = parts[1].strip()
    else:
        prep = prep_kasus
        if 'Dat' in prep_kasus:
            kasus = 'Dat.'
        elif 'Akk' in prep_kasus:
            kasus = 'Akk.'
        else:
            kasus = prep_kasus

    cards.append({
        'verb': verb.strip(),
        'prep': prep.strip(),
        'kasus': kasus.strip(),
        'example': example.strip()
    })

cards_json = json.dumps(cards, ensure_ascii=False, indent=2)

js_template = """// ── DATA: __COUNT__ German verbs with prepositions ──────────────────────────────
const ALL_CARDS = __CARDS__;

// ── STATE ────────────────────────────────────────────────────────────────────
let state = {
  deck: [...ALL_CARDS],
  index: 0,
  flipped: false,
  correct: 0,
  wrong: 0,
  filter: 'all',   // 'all' | 'akk' | 'dat'
  mode: 'sequential',
  wrongCards: [],
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function isAkk(card) { return card.kasus.toLowerCase().includes('akk'); }
function isDat(card) { return card.kasus.toLowerCase().includes('dat'); }

function buildDeck() {
  let source = ALL_CARDS;
  if (state.filter === 'akk') source = ALL_CARDS.filter(isAkk);
  if (state.filter === 'dat') source = ALL_CARDS.filter(isDat);
  if (state.mode === 'random') {
    source = [...source].sort(() => Math.random() - 0.5);
  }
  return source;
}

function getCard() { return state.deck[state.index]; }

// ── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  const card = getCard();
  if (!card) { showDone(); return; }

  // Front
  document.getElementById('verb-display').textContent = card.verb;
  document.getElementById('card-number').textContent = `#${state.index + 1} / ${state.deck.length}`;

  // Back
  document.getElementById('back-verb').textContent = card.verb;
  document.getElementById('back-prep').textContent = card.prep;
  document.getElementById('back-example').textContent = card.example;

  const kasusBadge = document.getElementById('back-kasus');
  kasusBadge.textContent = card.kasus;
  kasusBadge.className = 'kasus-badge' + (isDat(card) && !isAkk(card) ? ' dat' : '');

  // Flip state
  const cardEl = document.getElementById('card');
  cardEl.classList.toggle('flipped', state.flipped);

  // Progress
  const pct = ((state.index + 1) / state.deck.length) * 100;
  document.getElementById('progress-bar').style.setProperty('--pct', pct + '%');
  document.getElementById('progress-text').textContent = `${state.index + 1} / ${state.deck.length}`;

  // Stats
  document.getElementById('total-count').textContent = state.deck.length;
  document.getElementById('correct-count').textContent = state.correct;
  document.getElementById('wrong-count').textContent = state.wrong;
}

// ── FLIP ─────────────────────────────────────────────────────────────────────
function flipCard() {
  if (state.flipped) return; // only flip to back from front
  state.flipped = true;
  render();
}

// ── ANSWER ───────────────────────────────────────────────────────────────────
function markCorrect() {
  state.correct++;
  nextCard();
}
function markWrong() {
  state.wrong++;
  state.wrongCards.push(getCard());
  nextCard();
}

function nextCard() {
  state.index++;
  state.flipped = false;
  if (state.index >= state.deck.length) { showDone(); return; }
  render();
}

function prevCard() {
  if (state.index <= 0) return;
  state.index--;
  state.flipped = false;
  render();
}

// ── DONE ─────────────────────────────────────────────────────────────────────
function showDone() {
  document.getElementById('done-screen').style.display = 'flex';
  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  document.getElementById('done-correct').textContent = state.correct;
  document.getElementById('done-wrong').textContent = state.wrong;
  document.getElementById('done-pct').textContent = pct + '%';
  document.getElementById('btn-wrong-only').style.display = state.wrongCards.length > 0 ? 'block' : 'none';
}

function hideDone() {
  document.getElementById('done-screen').style.display = 'none';
}

function restart(deck) {
  state.deck = deck || buildDeck();
  state.index = 0;
  state.flipped = false;
  state.correct = 0;
  state.wrong = 0;
  state.wrongCards = [];
  hideDone();
  render();
}

// ── FILTER / MODE ─────────────────────────────────────────────────────────────
function setFilter(f) {
  state.filter = f;
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === f);
  });
  restart();
}

function setMode(m) {
  state.mode = m;
  document.querySelectorAll('[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === m);
  });
  restart();
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document.getElementById('card').addEventListener('click', flipCard);

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); flipCard(); }
  if (e.code === 'ArrowRight') { if (state.flipped) markCorrect(); else nextCard(); }
  if (e.code === 'ArrowLeft')  { prevCard(); }
  if (e.code === 'Digit1' && state.flipped) markWrong();
  if (e.code === 'Digit2' && state.flipped) markCorrect();
});

document.getElementById('btn-correct').addEventListener('click', e => { e.stopPropagation(); markCorrect(); });
document.getElementById('btn-wrong').addEventListener('click',   e => { e.stopPropagation(); markWrong(); });
document.getElementById('btn-next').addEventListener('click', () => { if (state.flipped) markCorrect(); else flipCard(); });
document.getElementById('btn-prev').addEventListener('click', prevCard);
document.getElementById('btn-restart').addEventListener('click', () => restart());
document.getElementById('btn-done-restart').addEventListener('click', () => restart());
document.getElementById('btn-wrong-only').addEventListener('click', () => {
  const wrongDeck = state.wrongCards.length > 0 ? [...state.wrongCards] : buildDeck();
  restart(state.mode === 'random' ? wrongDeck.sort(() => Math.random() - 0.5) : wrongDeck);
});

document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});
document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ── INIT ──────────────────────────────────────────────────────────────────────
render();
"""

js_code = js_template.replace('__COUNT__', str(len(cards))).replace('__CARDS__', cards_json)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print(f"Updated app.js with {len(cards)} cards!")
