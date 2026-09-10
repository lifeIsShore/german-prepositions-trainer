let ALL_CARDS = [];

// ── STATE ────────────────────────────────────────────────────────────────────
let state = {
  deck: [],
  index: 0,
  flipped: false,
  correct: 0,
  wrong: 0,
  filterType: 'all',
  filterLevel: 'all',
  mode: 'sequential',
  wrongCards: [],
};

// ── INIT & FETCH ─────────────────────────────────────────────────────────────
async function initApp() {
  try {
    const res = await fetch('data/generated/content.json');
    const data = await res.json();
    ALL_CARDS = data.items || [];
    
    // Attach event listeners for selects
    document.getElementById('filter-type').addEventListener('change', (e) => setFilterType(e.target.value));
    document.getElementById('filter-level').addEventListener('change', (e) => setFilterLevel(e.target.value));
    
    restart();
  } catch (err) {
    console.error("Failed to load content.json", err);
    document.getElementById('verb-display').textContent = "Error loading data.";
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function buildDeck() {
  let source = ALL_CARDS;
  
  if (state.filterType !== 'all') {
    source = source.filter(c => c.type === state.filterType);
  }
  
  if (state.filterLevel !== 'all') {
    source = source.filter(c => c.levels && c.levels.includes(state.filterLevel));
  }
  
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
  document.getElementById('verb-display').textContent = card.term;
  document.getElementById('card-number').textContent = `#${state.index + 1} / ${state.deck.length}`;

  // Back
  document.getElementById('back-verb').textContent = card.term;
  
  const prepEl = document.getElementById('back-prep');
  const kasusBadge = document.getElementById('back-kasus');
  const extraEl = document.getElementById('back-extra');
  const exampleEl = document.getElementById('back-example');

  // Clear previous state
  prepEl.textContent = '';
  prepEl.style.display = 'none';
  kasusBadge.style.display = 'none';
  extraEl.innerHTML = '';
  let exampleHtml = '';
  if (card.examples?.de) {
    exampleHtml = card.examples.de;
    if (card.examples?.en) {
      exampleHtml += `<br><span class="example-en" style="font-size: 13px; color: var(--text-dim); font-style: italic; margin-top: 4px; display: block;">${card.examples.en}</span>`;
    }
  }
  exampleEl.innerHTML = exampleHtml;

  // Render logic based on type
  if (card.type === 'verb_preposition' && card.grammar && card.grammar.valency && card.grammar.valency.length > 0) {
    const val = card.grammar.valency[0];
    if (val.preposition) {
      prepEl.textContent = val.preposition;
      prepEl.style.display = 'inline-block';
    }
    if (val.case) {
      kasusBadge.textContent = val.case;
      kasusBadge.className = 'kasus-badge' + (val.case.toLowerCase().includes('dat') && !val.case.toLowerCase().includes('akk') ? ' dat' : '');
      kasusBadge.style.display = 'inline-block';
    }
  }

  // Back Extra text construction
  let extraHtml = '';
  if (card.translation) {
    extraHtml += `<strong>${card.translation}</strong><br/>`;
  }
  
  // Show Part of Speech if available and valid
  if (card.partOfSpeech && card.partOfSpeech !== 'unknown') {
    const posDe = {
      'verb': 'Verb', 'noun': 'Nomen', 'adjective': 'Adjektiv', 'adverb': 'Adverb', 
      'pronoun': 'Pronomen', 'preposition': 'Präposition', 'conjunction': 'Konjunktion', 'phrase': 'Redewendung'
    }[card.partOfSpeech] || card.partOfSpeech;
    extraHtml += `<small style="color: var(--text-muted); text-transform: uppercase;">${posDe}</small><br/>`;
  }

  if (card.usage) {
    let freqColor = 'var(--text-muted)';
    const freq = card.usage.nativeFrequencyLabel || '';
    const reg = card.usage.register && card.usage.register !== 'unknown' ? card.usage.register : '';
    
    if (freq.toLowerCase().includes('high') || card.usage.nativeFrequencyRating >= 4) {
      freqColor = '#228b22'; /* Forest Green, not extreme/shiny */
    } else if (freq.toLowerCase().includes('medium') || card.usage.nativeFrequencyRating === 3) {
      freqColor = '#d97706';
    } else if (freq || card.usage.nativeFrequencyRating < 3) {
      freqColor = '#6b7280';
    }
    
    const freqDe = { 'Very High': 'Sehr Hoch', 'High': 'Hoch', 'Medium': 'Mittel', 'Low': 'Niedrig', 'Very Low': 'Sehr Niedrig' }[freq] || freq;
    let usageText = freqDe;
    if (reg) {
      const regDe = {
        'written': 'Geschrieben', 'spoken': 'Gesprochen', 'formal': 'Formell', 
        'informal': 'Informell', 'slang': 'Umgangssprache', 'elevated': 'Gehoben', 'archaic': 'Veraltet'
      }[reg] || (reg.charAt(0).toUpperCase() + reg.slice(1));
      usageText += usageText ? ` (${regDe})` : regDe;
    }
    
    if (usageText) {
      extraHtml += `<small style="color: ${freqColor}; font-weight: 600;">${usageText}</small><br/>`;
    }
  }

  if (card.type === 'konnektor' && card.grammar && card.grammar.verbPositionEffect) {
    const fx = card.grammar.verbPositionEffect.replace(/_/g, ' ').toUpperCase();
    extraHtml += `<small>Verbposition: ${fx}</small><br/>`;
  }
  
  if (card.grammar && card.grammar.auxiliary) {
    extraHtml += `<small style="color: #228b22; font-weight: 600;">Hilfsverb: ${card.grammar.auxiliary}</small><br/>`;
  }
  
  extraEl.innerHTML = extraHtml;

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
  
  if (state.deck.length === 0) {
    document.getElementById('verb-display').textContent = "No cards match filter.";
  } else {
    render();
  }
}

// ── FILTER / MODE ─────────────────────────────────────────────────────────────
function setFilterType(f) {
  state.filterType = f;
  restart();
}

function setFilterLevel(l) {
  state.filterLevel = l;
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

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ── STARTUP ───────────────────────────────────────────────────────────────────
initApp();
